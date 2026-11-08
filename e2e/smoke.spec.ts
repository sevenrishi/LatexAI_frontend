import { test, expect } from '@playwright/test'

test.describe('LatexAI App Smoke Tests', () => {
  test('loads landing page successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/LatexAI/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /Start Tailoring Free/i })).toBeVisible()
  })

  test('navigates to login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
  })

  test('displays 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page-route')
    await expect(page.getByRole('heading', { name: /Page does not exist/i })).toBeVisible()
  })
})
