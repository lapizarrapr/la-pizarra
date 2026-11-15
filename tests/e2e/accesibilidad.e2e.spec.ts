import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * Automated WCAG 2.2 AA checks (axe) on every kind of public page, in light
 * and dark mode, at phone and desktop widths. Automated tools catch roughly
 * a third of accessibility problems; the keyboard tests below cover some of
 * the rest, and a manual pass is still needed before launch.
 */
const PAGINAS = [
  ['portada', '/'],
  [
    'artículo',
    '/articulo/sin-terapias-desde-agosto-familias-de-educacion-especial-llevan-la-cuenta',
  ],
  ['artículo de estudiante', '/articulo/carta-a-quien-decide-el-menu-del-comedor'],
  ['sección', '/seccion/educacion-publica'],
  ['etiqueta', '/etiqueta/comunidad'],
  ['autor', '/autor/carmen-ortiz-velez'],
  ['búsqueda con resultados', '/buscar?q=escuela'],
  ['búsqueda sin resultados', '/buscar?q=xyzzy'],
  ['archivo', '/archivo'],
  ['contacto (formulario)', '/contacto'],
  ['cómo colaborar (formulario)', '/como-colaborar'],
  ['página 404', '/esta-pagina-no-existe'],
] as const

const revisar = async (page: Page) => {
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  const resumen = resultado.violations.map((v) => ({
    regla: v.id,
    impacto: v.impact,
    ayuda: v.help,
    elementos: v.nodes.slice(0, 4).map((n) => n.target.join(' ')),
  }))
  expect(resumen, JSON.stringify(resumen, null, 2)).toEqual([])
}

for (const esquema of ['light', 'dark'] as const) {
  for (const [ancho, alto] of [
    [390, 844],
    [1280, 900],
  ] as const) {
    test.describe(`accesibilidad · ${esquema} · ${ancho}px`, () => {
      test.use({ colorScheme: esquema, viewport: { width: ancho, height: alto } })

      for (const [nombre, ruta] of PAGINAS) {
        test(nombre, async ({ page }) => {
          await page.goto(ruta)
          await revisar(page)
          // No sideways scrolling at any width.
          const desborde = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          )
          expect(desborde).toBeLessThanOrEqual(0)
        })
      }
    })
  }
}

test.describe('teclado', () => {
  test('el primer Tab ofrece saltar al contenido', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const enfocado = page.locator(':focus')
    await expect(enfocado).toHaveText('Saltar al contenido')
    await expect(enfocado).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.locator('#contenido')).toBeFocused()
  })

  test('cada página tiene idioma, un solo h1 y título propio', async ({ page }) => {
    for (const [, ruta] of PAGINAS) {
      await page.goto(ruta)
      await expect(page.locator('html')).toHaveAttribute('lang', 'es')
      await expect(page.locator('h1')).toHaveCount(1)
      expect((await page.title()).length).toBeGreaterThan(3)
    }
  })

  test('el formulario de contacto anuncia los errores y enfoca con teclado', async ({ page }) => {
    await page.goto('/contacto')
    const formulario = page.locator('main form')
    await formulario.getByLabel('Asunto').fill('x')
    await page.waitForTimeout(2600)
    await formulario.getByRole('button', { name: 'Enviar' }).press('Enter')
    await expect(page.locator('main [role="alert"]')).toHaveText('Revisa los campos marcados.')
    const correo = formulario.getByLabel(/Correo electrónico/)
    await expect(correo).toHaveAttribute('aria-invalid', 'true')
    await expect(correo).toHaveAccessibleDescription(/correo/i)
  })
})
