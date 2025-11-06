import { test as base } from '@playwright/test';

/**
 * Custom test fixture that extends Playwright's base test.
 *
 * This fixture can be extended in the future to add:
 * - Mock user data
 * - API mocking utilities
 * - Authentication state management
 *
 * For now, auth bypass is handled via BYPASS_AUTH environment variable
 * in middleware.ts
 */

export const test = base.extend({
  // Future: Add custom fixtures here
});

export { expect } from '@playwright/test';
