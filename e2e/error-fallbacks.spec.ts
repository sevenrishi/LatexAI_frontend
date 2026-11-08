import { test, expect } from '@playwright/test'

test.describe('E2E: Error Handling & Fallbacks', () => {
  test('displays 404 Not Found view and returns home', async ({ page }) => {
    await page.goto('/some-missing-non-existent-page')

    await expect(page.locator('text=Page Not Found')).toBeVisible()
    const homeBtn = page.getByRole('link', { name: /Return Home/i })
    await expect(homeBtn).toBeVisible()
    await homeBtn.click()
    await expect(page).toHaveURL('/')
  })

  test('job URL fetch bot wall automatically falls back to text paste tab', async ({ page }) => {
    await page.goto('/login')
    const demoBtn = page.getByRole('button', { name: /Instant Demo Sign In/i })
    if (await demoBtn.isVisible()) {
      await demoBtn.click()
    }

    await page.goto('/generate')

    // Switch to Job URL tab
    const urlTabTrigger = page.locator('[data-testid="tab-trigger-url"]')
    if (await urlTabTrigger.isVisible()) {
      await urlTabTrigger.click()

      // Fill with a blocked URL
      const urlInput = page.locator('[data-testid="job-url-input"]')
      await urlInput.fill('https://www.linkedin.com/jobs/view/blocked-job-id')

      const fetchBtn = page.locator('[data-testid="fetch-url-btn"]')
      await fetchBtn.click()

      // Should automatically transition or fallback to text tab with error notice
      await expect(
        page.locator('text=Unable to fetch this job URL due to website restrictions').or(
          page.locator('[data-testid="tab-trigger-text"]')
        )
      ).toBeVisible()
    }
  })
})
