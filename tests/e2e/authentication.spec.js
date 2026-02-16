const { test, expect } = require('@playwright/test');

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
  });

  test('should render sign in form correctly', async ({ page }) => {
    // Verify heading
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    
    // Verify form fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Verify labels
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Password')).toBeVisible();
    
    // Verify submit button
    await expect(page.getByRole('button', { name: 'Sign In' }).first()).toBeVisible();
    
    // Verify link to sign up
    await expect(page.locator('text=Need to create an account?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  });

  test('should show error for empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).first().click();
    
    // Wait for error message
    await expect(page.locator('.error-message, .errors')).toBeVisible({ timeout: 5000 });
  });

  test('should have correct SEO metadata', async ({ page }) => {
    await expect(page).toHaveTitle(/Sign In - Dispersed/);
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Sign in to save your favorite');
  });
});

test.describe('Sign Up Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
  });

  test('should render sign up form correctly', async ({ page }) => {
    // Verify heading
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    
    // Verify all form fields
    const displayNameInput = page.locator('input[placeholder="How you\'ll appear to others"]');
    await expect(displayNameInput).toBeVisible();
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(2); // Password and Confirm Password
    
    // Verify labels
    await expect(page.locator('text=Display Name (Optional)')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Password').first()).toBeVisible();
    await expect(page.locator('text=Confirm Password')).toBeVisible();
    
    // Verify submit button
    await expect(page.getByRole('button', { name: 'Sign Up' }).first()).toBeVisible();
    
    // Verify link to sign in
    await expect(page.locator('text=Already have an account?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should show error for password mismatch', async ({ page }) => {
    await page.locator('input[type="email"]').fill('test@example.com');
    
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('password123');
    await passwordInputs[1].fill('differentpassword');
    
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    
    // Wait for error message about password mismatch
    await expect(page.locator('text=Passwords do not match')).toBeVisible({ timeout: 2000 });
  });

  test('should show error for short password', async ({ page }) => {
    await page.locator('input[type="email"]').fill('test@example.com');
    
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('short');
    await passwordInputs[1].fill('short');
    
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    
    // Wait for error message about password length
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible({ timeout: 2000 });
  });

  test('should show error for invalid email', async ({ page }) => {
    await page.locator('input[type="email"]').fill('invalidemail');
    
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('password123');
    await passwordInputs[1].fill('password123');
    
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    
    // Wait for error message about invalid email
    await expect(page.locator('text=valid email')).toBeVisible({ timeout: 2000 });
  });

  test('should have correct SEO metadata', async ({ page }) => {
    await expect(page).toHaveTitle(/Sign Up - Dispersed/);
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Create an account');
  });
});

test.describe('Authentication Flow', () => {
  test('should toggle between sign in and sign up pages', async ({ page }) => {
    // Start at sign in
    await page.goto('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    
    // Navigate to sign up
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    
    // Navigate back to sign in
    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });
});
