import { expect, test, type Page } from '@playwright/test'

import { apiComo, CUENTAS, elegir, sesionDe, vigilarCSP } from '../helpers/admin'

/**
 * The newsroom's critical path, driven through the real admin panel:
 *
 *   a writer drafts and submits → an editor publishes → the article is on
 *   the portada and in search → the editor deletes it → it is gone.
 *
 * Steps run in order and share one article. Requires the sample content
 * (`pnpm seed`).
 */
test.describe.configure({ mode: 'serial' })

// A made-up word so search can only match this article.
const PALABRA = `tizalumbre${Date.now().toString(36)}`
const MARCA = `Prueba E2E ${PALABRA}`
const TITULO = `${MARCA}: la escuela estrena biblioteca`
const SLUG = `prueba-e2e-${PALABRA}-la-escuela-estrena-biblioteca`
const RUTA = `/articulo/${SLUG}`

type Lista = { docs: { id: number; estadoEditorial: string; _status: string }[] }

let id: number
let colaboradora: Page
let editor: Page

const estadoPublico = async (page: Page, ruta: string): Promise<number> =>
  (await page.request.get(ruta)).status()

test.beforeAll(async ({ browser }) => {
  colaboradora = await sesionDe(browser, CUENTAS.colaboradora)
  editor = await sesionDe(browser, CUENTAS.editor)
})

test.afterAll(async ({ request }) => {
  // Leave the sample content as it was, even if a step failed halfway.
  await (await apiComo(request, CUENTAS.editor)).borrarArticulosCon('Prueba E2E tizalumbre')
  await colaboradora?.context().close()
  await editor?.context().close()
})

test('una colaboradora escribe un borrador y lo envía a revisión', async ({ request }) => {
  const page = colaboradora
  const bloqueos = vigilarCSP(page)

  await page.goto('/admin/collections/articulos/create')
  await page.fill('#field-titulo', TITULO)
  await page.fill('#field-subtitulo', 'Texto de prueba automática. Se borra al terminar.')
  await page.locator('.ContentEditable__root').first().click()
  await page.keyboard.type(`La comunidad celebró la apertura. Palabra clave: ${PALABRA}.`)
  await elegir(page, 'categoria', 'Infraestructura')
  await elegir(page, 'estadoEditorial', 'En revisión')

  // A writer is never offered the Publish button, nor "Publicado"/"Archivado".
  await expect(page.locator('#action-save')).toHaveCount(0)

  await page.click('#action-save-draft')
  await expect(page).toHaveURL(/\/admin\/collections\/articulos\/\d+/)

  const api = await apiComo(request, CUENTAS.editor)
  await expect
    .poll(
      async () =>
        (await api.get<Lista>(`/api/articulos?where[slug][equals]=${SLUG}&draft=true&depth=0`))
          .docs[0]?.estadoEditorial,
      { timeout: 20_000 },
    )
    .toBe('en_revision')

  const { docs } = await api.get<Lista>(
    `/api/articulos?where[slug][equals]=${SLUG}&draft=true&depth=0`,
  )
  id = docs[0]!.id
  expect(docs[0]!._status).toBe('draft')

  // She closes the article. While someone has it open, Payload shows others
  // a "document locked" notice so two people don't overwrite each other.
  await page.goto('/admin/collections/articulos')
  await expect(page.locator('.collection-list')).toBeVisible()
  expect(bloqueos, 'el panel no debe tener contenido bloqueado').toEqual([])
})

test('el borrador no es público', async ({ page }) => {
  expect(await estadoPublico(page, RUTA)).toBe(404)
  await page.goto('/')
  await expect(page.getByText(MARCA)).toHaveCount(0)
  await page.goto(`/buscar?q=${PALABRA}`)
  await expect(page.locator('main').getByRole('status')).toContainText('No encontramos nada')
})

test('la colaboradora no puede publicarlo ni por la API', async () => {
  const respuesta = await colaboradora.request.patch(`/api/articulos/${id}`, {
    data: { _status: 'published' },
  })
  expect(respuesta.status()).toBe(403)
})

test('un editor lo publica desde el panel', async () => {
  const page = editor
  const bloqueos = vigilarCSP(page)

  await page.goto(`/admin/collections/articulos/${id}`)
  await expect(page.locator('#field-titulo')).toHaveValue(TITULO)
  // If the lock from the writer's session has not expired yet, take over.
  // The notice shows up a moment after the page loads, so wait briefly for it.
  await page
    .locator('#document-locked-take-over')
    .click({ timeout: 6000 })
    .catch(() => {})
  await expect(page.locator('#document-locked')).toHaveCount(0)
  await expect(page.locator('#action-save')).toBeEnabled()
  await page.click('#action-save')

  await expect.poll(() => estadoPublico(page, RUTA), { timeout: 30_000 }).toBe(200)
  expect(bloqueos, 'el panel no debe tener contenido bloqueado').toEqual([])
})

test('el artículo aparece en la portada, en su sección y firmado', async ({ page }) => {
  await expect(async () => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: TITULO }).first()).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 30_000 })

  await page.getByRole('link', { name: TITULO }).first().click()
  await expect(page).toHaveURL(new RegExp(`${RUTA}$`))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(TITULO)
  // Signed automatically with the writer's own author profile.
  await expect(page.locator('article header')).toContainText('Carmen Ortiz Vélez')
  await expect(page.getByRole('heading', { name: 'Quién firma' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Compartir por WhatsApp' })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/\?text=/,
  )

  await expect(async () => {
    await page.goto('/seccion/infraestructura')
    await expect(page.getByRole('link', { name: TITULO }).first()).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 30_000 })
})

test('la búsqueda lo encuentra', async ({ page }) => {
  await page.goto('/buscar')
  await page.getByRole('searchbox').fill(PALABRA)
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page).toHaveURL(new RegExp(`/buscar\\?q=${PALABRA}`))
  await expect(page.locator('main').getByRole('status')).toContainText('1 resultado')
  await expect(page.getByRole('link', { name: TITULO })).toBeVisible()
})

test('una vez publicado, la colaboradora ya no puede cambiarlo ni borrarlo', async () => {
  const cambio = await colaboradora.request.patch(`/api/articulos/${id}`, {
    data: { titulo: 'Cambio sin permiso' },
  })
  expect(cambio.status()).toBe(403)
  const borrado = await colaboradora.request.delete(`/api/articulos/${id}`)
  expect(borrado.status()).toBe(403)
  expect(await estadoPublico(colaboradora, RUTA)).toBe(200)
})

test('el editor lo borra desde el panel y desaparece del sitio', async ({ page: visitante }) => {
  const page = editor
  await page.goto(`/admin/collections/articulos/${id}`)
  await page.locator('.doc-controls__popup .popup-button').click()
  await page.click('#action-delete')
  await page.click('#confirm-action')
  await expect(page).toHaveURL(/\/admin\/collections\/articulos(\?.*)?$/)

  await expect.poll(() => estadoPublico(visitante, RUTA), { timeout: 30_000 }).toBe(404)
  await expect(async () => {
    await visitante.goto('/')
    await expect(visitante.getByText(MARCA)).toHaveCount(0, { timeout: 2000 })
  }).toPass({ timeout: 30_000 })
  await visitante.goto(`/buscar?q=${PALABRA}`)
  await expect(visitante.locator('main').getByRole('status')).toContainText('No encontramos nada')
})
