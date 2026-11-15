import { expect, test } from '@playwright/test'

test.describe('Sitio público', () => {
  test('la portada carga en español', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/La Pizarra/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.locator('h1').first()).toHaveText('La Pizarra')
  })
})
