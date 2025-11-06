import { test, expect } from './fixtures/auth';

test.describe('Health Check Endpoint', () => {
  test('should return OK status', async ({ page }) => {
    // Navigate to the health check endpoint
    await page.goto('/health');

    // Verify the page loaded and contains the expected content
    await expect(page.locator('body')).toContainText('OK');

    // Verify the response status is 200
    const response = await page.goto('/health');
    expect(response?.status()).toBe(200);
  });

  test('should be publicly accessible without authentication', async ({ page }) => {
    // The health endpoint should be accessible even without auth
    // This tests that it's properly configured in the public routes
    const response = await page.goto('/health');

    expect(response?.status()).toBe(200);
    expect(response?.ok()).toBeTruthy();
  });
});
