const { test, expect } = require('@playwright/test');

test.describe('Navigation and Routing', () => {
  test('should navigate to all main pages from homepage', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verify homepage loaded
    await expect(page.locator('h1')).toContainText('Dispersed');
    await expect(page.getByRole('link', { name: 'View Map' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    
    // Navigate to Map page
    await page.getByRole('link', { name: 'View Map' }).click();
    await expect(page).toHaveURL(/.*map/);
    await expect(page.locator('text=Click on the map to view details')).toBeVisible();
    
    // Navigate to About page
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/.*about/);
    await expect(page.getByRole('heading', { name: 'What is Dispersed Camping?' })).toBeVisible();
    
    // Navigate to Search page
    await page.getByRole('link', { name: 'Search' }).click();
    await expect(page).toHaveURL(/.*search/);
    await expect(page.getByRole('heading', { name: 'Search Campsites' })).toBeVisible();
    
    // Navigate to Sign In page
    await page.getByRole('link', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should have consistent header across all pages', async ({ page }) => {
    const pages = ['/map', '/about', '/search', '/login', '/signup'];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:3000${pagePath}`);
      
      // Verify header elements are present
      await expect(page.locator('header')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Dispersed' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Map' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Search' })).toBeVisible();
    }
  });

  test('should have consistent footer across all pages', async ({ page }) => {
    const pages = ['/map', '/about', '/search', '/login', '/signup'];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:3000${pagePath}`);
      
      // Verify footer elements are present
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('text=Dispersed Camping Finder')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Report a Bug' })).toBeVisible();
    }
  });

  test('should navigate from logo click', async ({ page }) => {
    await page.goto('http://localhost:3000/map');
    
    // Click on logo to return to homepage
    await page.getByRole('link', { name: 'Dispersed' }).first().click();
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/map');
    
    // Verify hamburger button is visible on mobile
    const hamburger = page.getByRole('button', { name: 'Toggle navigation menu' });
    await expect(hamburger).toBeVisible();
  });

  test('should toggle mobile menu', async ({ page }) => {
    await page.goto('http://localhost:3000/map');
    
    const hamburger = page.getByRole('button', { name: 'Toggle navigation menu' });
    const navigation = page.locator('.navigation');
    
    // Click hamburger to open menu
    await hamburger.click();
    
    // Verify navigation has mobile-open class
    await expect(navigation).toHaveClass(/mobile-open/);
    
    // Click hamburger again to close menu
    await hamburger.click();
    
    // Verify mobile-open class is removed
    await expect(navigation).not.toHaveClass(/mobile-open/);
  });

  test('should close mobile menu when navigating', async ({ page }) => {
    await page.goto('http://localhost:3000/map');
    
    const hamburger = page.getByRole('button', { name: 'Toggle navigation menu' });
    
    // Open mobile menu
    await hamburger.click();
    
    // Click a navigation link
    await page.getByRole('link', { name: 'About' }).click();
    
    // Verify we navigated
    await expect(page).toHaveURL(/.*about/);
    
    // Verify mobile menu is closed (navigation should not have mobile-open class)
    const navigation = page.locator('.navigation');
    await expect(navigation).not.toHaveClass(/mobile-open/);
  });
});
