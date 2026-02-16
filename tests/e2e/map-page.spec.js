const { test, expect } = require('@playwright/test');

test.describe('Map Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/map');
  });

  test('should render map page with header and footer', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Interactive Map - Dispersed Camping Locations/);
    
    // Verify header is present
    await expect(page.locator('header')).toBeVisible();
    
    // Verify footer is present
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should show map instructions', async ({ page }) => {
    await expect(page.locator('text=Click on the map to view details')).toBeVisible();
  });

  test('should load map component', async ({ page }) => {
    // Wait for map to load (ArcGIS map container)
    const mapContainer = page.locator('[role="application"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });

  test('should have zoom controls', async ({ page }) => {
    // Verify zoom buttons are present
    await expect(page.getByRole('button', { name: /Zoom in/ })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Zoom out/ })).toBeVisible({ timeout: 10000 });
  });

  test('should load ArcGIS API', async ({ page }) => {
    // Wait for console message about ArcGIS API
    const messages = [];
    page.on('console', msg => {
      messages.push(msg.text());
    });
    
    // Wait a bit for the map to initialize
    await page.waitForTimeout(3000);
    
    // Check if ArcGIS loaded
    const arcgisLoaded = messages.some(msg => msg.includes('ArcGIS API'));
    expect(arcgisLoaded).toBeTruthy();
  });

  test('should have no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Wait for map to load
    await page.waitForTimeout(3000);
    
    // Filter out known issues (if any)
    const criticalErrors = errors.filter(err => 
      !err.includes('React Router Future Flag')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Map Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should render map on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/map');
    
    // Verify map loads on mobile
    const mapContainer = page.locator('[role="application"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
    
    // Verify instructions are visible
    await expect(page.locator('text=Click on the map to view details')).toBeVisible();
  });

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/map');
    
    const hamburger = page.getByRole('button', { name: 'Toggle navigation menu' });
    await expect(hamburger).toBeVisible();
  });
});
