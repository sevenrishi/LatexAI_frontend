import { test, expect } from '@playwright/test'

test.describe('E2E: History & Settings Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate with demo credentials
    await page.goto('/login')
    const demoBtn = page.getByRole('button', { name: /Instant Demo Sign In/i })
    if (await demoBtn.isVisible()) {
      await demoBtn.click()
    }
  })

  test('history page filters and displays resumes list', async ({ page }) => {
    await page.goto('/history')
    await expect(page.locator('text=Tailored Resumes History')).toBeVisible()

    const searchInput = page.locator('[data-testid="history-search-input"]')
    await expect(searchInput).toBeVisible()

    // Resumes list should be rendered
    const list = page.locator('[data-testid="history-items-list"]')
    await expect(list).toBeVisible()
  })

  test('settings page allows theme switching and displays all sections', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('text=Account Settings')).toBeVisible()

    // Sections are visible
    await expect(page.locator('[data-testid="account-details-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="appearance-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="security-password-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="data-export-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="danger-zone-section"]')).toBeVisible()

    // Theme switching
    const darkOption = page.locator('[data-testid="theme-option-dark"]')
    await darkOption.click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    const lightOption = page.locator('[data-testid="theme-option-light"]')
    await lightOption.click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('danger zone enforces typed DELETE before enabling delete button', async ({ page }) => {
    await page.goto('/settings')

    // Open typed delete modal
    const openBtn = page.locator('[data-testid="open-delete-account-dialog"]')
    await openBtn.click()

    const dialog = page.locator('[data-testid="typed-delete-dialog"]')
    await expect(dialog).toBeVisible()

    const confirmBtn = page.locator('[data-testid="confirm-typed-delete-btn"]')
    await expect(confirmBtn).toBeDisabled()

    const input = page.locator('[data-testid="input-typed-delete"]')
    await input.fill('wrong')
    await expect(confirmBtn).toBeDisabled()

    await input.fill('DELETE')
    await expect(confirmBtn).toBeEnabled()
  })
})
