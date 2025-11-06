import { test, expect } from './fixtures/auth';

test.describe('Homepage', () => {
  test('should render the Treki logo and heading', async ({ page }) => {
    // Navigate to homepage (auth is bypassed via BYPASS_AUTH env var)
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify the logo is present with correct alt text
    const logo = page.locator('img[alt="Treki Logo"]');
    await expect(logo).toBeVisible();

    // Verify the page title contains Treki
    await expect(page).toHaveTitle(/Treki/);
  });

  test('should display the main description', async ({ page }) => {
    await page.goto('/');

    // Check for the tagline
    await expect(page.getByText(/extract travel recommendations/i)).toBeVisible();
  });

  test('should show the video input section', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for the video input form heading
    await expect(page.getByText(/add youtube videos/i)).toBeVisible();

    // Check for the textarea placeholder
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute('placeholder', /youtube\.com/i);
  });

  test('should have the Extract Places button', async ({ page }) => {
    await page.goto('/');

    // Check for the submit button
    const button = page.getByRole('button', { name: /extract places/i });
    await expect(button).toBeVisible();
  });

  test('should show user button in header', async ({ page }) => {
    await page.goto('/');

    // The Clerk UserButton should be present (even with auth bypass)
    // It's in the header's absolute top-right position
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
