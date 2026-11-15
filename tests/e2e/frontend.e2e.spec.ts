import { expect, test } from '@playwright/test'

test.describe('Sitio público', () => {
  test('la portada carga en español con la noticia principal', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/La Pizarra/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.locator('h1').first()).toHaveText('La Pizarra')
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible()
  })

  test('envía las cabeceras de seguridad', async ({ request }) => {
    const respuesta = await request.get('/')
    const cabeceras = respuesta.headers()
    expect(cabeceras['content-security-policy']).toContain("default-src 'self'")
    expect(cabeceras['content-security-policy']).toContain("object-src 'none'")
    expect(cabeceras['x-content-type-options']).toBe('nosniff')
    expect(cabeceras['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(cabeceras['x-powered-by']).toBeUndefined()
  })
})
