import { expect, type APIRequestContext, type Browser, type Page } from '@playwright/test'

/**
 * The sample accounts created by `pnpm seed`. Their shared password is read
 * from SEED_PASSWORD in .env; it is never written in the tests.
 */
export const CUENTAS = {
  admin: 'admin@lapizarra.test',
  editor: 'editor@lapizarra.test',
  colaboradora: 'maestra@lapizarra.test',
} as const

const contrasena = (): string => {
  const valor = process.env.SEED_PASSWORD
  if (!valor) throw new Error('Falta SEED_PASSWORD en .env (y correr `pnpm seed`).')
  return valor
}

/** Opens a separate browser session logged in to the admin as one of the sample accounts. */
export const sesionDe = async (browser: Browser, email: string): Promise<Page> => {
  const contexto = await browser.newContext()
  const page = await contexto.newPage()
  await page.goto('/admin/login')
  await page.fill('#field-email', email)
  await page.fill('#field-password', contrasena())
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/admin\/?$/)
  return page
}

/** Authenticated REST client, used to verify results and clean up. */
export const apiComo = async (request: APIRequestContext, email: string) => {
  const login = await request.post('/api/usuarios/login', {
    data: { email, password: contrasena() },
  })
  expect(login.ok(), 'login por API').toBe(true)
  const { token } = (await login.json()) as { token: string }
  const headers = { Authorization: `JWT ${token}` }

  return {
    get: async <T>(ruta: string): Promise<T> =>
      (await (await request.get(ruta, { headers })).json()) as T,
    borrarArticulosCon: async (marca: string): Promise<void> => {
      await request.delete(
        `/api/articulos?where[titulo][like]=${encodeURIComponent(marca)}&draft=true`,
        { headers },
      )
    },
  }
}

/** Picks an option in one of the admin's dropdowns (react-select). */
export const elegir = async (page: Page, campo: string, opcion: string | RegExp): Promise<void> => {
  const control = page.locator(`#field-${campo}`)
  await control.locator('.rs__control').click()
  await control.locator('.rs__option').filter({ hasText: opcion }).first().click()
}

/** Collects browser-console errors about blocked content (Content-Security-Policy). */
export const vigilarCSP = (page: Page): string[] => {
  const bloqueos: string[] = []
  page.on('console', (mensaje) => {
    if (mensaje.type() === 'error' && /Content Security Policy/i.test(mensaje.text())) {
      bloqueos.push(mensaje.text().slice(0, 300))
    }
  })
  return bloqueos
}
