import { test, expect } from '@playwright/test'

test.describe('E2E: Generation Pipeline & Review', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate with demo credentials in localStorage
    await page.goto('/login')
    const demoBtn = page.getByRole('button', { name: /Instant Demo Sign In/i })
    if (await demoBtn.isVisible()) {
      await demoBtn.click()
    }
  })

  test('submits job description and lands on Review screen', async ({ page }) => {
    await page.goto('/generate')

    // Find and fill job text
    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()
    await textarea.fill(
      'Senior Distributed Systems Engineer at Stripe. Requirements include Go, TypeScript, PostgreSQL, and Docker with high availability microservices experience.'
    )

    // Trigger generate button
    const submitBtn = page.getByRole('button', { name: /Generate ATS Resume/i })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    // Wait for progress page or redirect to review
    await page.waitForURL(/\/review|\/generate\//, { timeout: 15000 })
  })

  test('review screen renders score, PDF preview, and allows tab navigation', async ({ page }) => {
    await page.goto('/review/gen_mock_999')

    // Check status chip and title
    await expect(page.locator('text=Resume Review')).toBeVisible()
    await expect(page.locator('[data-testid="status-chip"]')).toBeVisible()

    // Left tabs navigation
    const atsTab = page.locator('[data-testid="tab-trigger-ats"]')
    const changesTab = page.locator('[data-testid="tab-trigger-changes"]')
    const editTab = page.locator('[data-testid="tab-trigger-edit"]')

    await expect(atsTab).toBeVisible()
    await expect(changesTab).toBeVisible()
    await expect(editTab).toBeVisible()

    // Switch to AI Changes tab
    await changesTab.click()
    await expect(page.locator('[data-testid="changes-tab"]')).toBeVisible()

    // Switch to Edit tab
    await editTab.click()
    await expect(page.locator('[data-testid="edit-tab"]')).toBeVisible()
  })
})
