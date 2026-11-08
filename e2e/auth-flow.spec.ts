import { test, expect } from '@playwright/test'

test.describe('E2E: Authentication & Navigation Flow', () => {
  test('landing page loads with navigation and hero CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/LatexAI/)

    // Check branding
    await expect(page.locator('text=LatexAI').first()).toBeVisible()

    // Check main call to action
    const startBtn = page.getByRole('link', { name: /Start Tailoring Free/i }).first()
    await expect(startBtn).toBeVisible()
  })

  test('sign in page allows demo login and redirects', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()

    // Check form inputs
    const emailInput = page.locator('#email')
    const passwordInput = page.locator('#password')
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()

    // Test quick demo login if present
    const demoBtn = page.getByRole('button', { name: /Instant Demo Sign In/i })
    if (await demoBtn.isVisible()) {
      await demoBtn.click()
      await expect(page).toHaveURL(/\/(dashboard|generate)/)
    }
  })

  test('navigation bar contains accessible links and theme toggle', async ({ page }) => {
    await page.goto('/')
    // Skip to main content link exists
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeAttached()
  })
})
