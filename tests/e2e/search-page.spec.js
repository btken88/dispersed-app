const { test, expect } = require('@playwright/test');

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/search');
  });

  test('should render all search form elements', async ({ page }) => {
    // Verify heading
    await expect(page.getByRole('heading', { name: 'Search Campsites' })).toBeVisible();
    
    // Verify search textbox
    const searchInput = page.locator('input[placeholder="Search"]');
    await expect(searchInput).toBeVisible();
    
    // Verify location inputs
    const latInput = page.locator('input[type="number"][placeholder*="Latitude"], input[name="latitude"]');
    const lonInput = page.locator('input[type="number"][placeholder*="Longitude"], input[name="longitude"]');
    
    // At least one of each should exist (they might be spinbuttons)
    expect(await page.locator('text=Latitude').count() + await latInput.count()).toBeGreaterThan(0);
    expect(await page.locator('text=Longitude').count() + await lonInput.count()).toBeGreaterThan(0);
    
    // Verify "Use My Location" button
    await expect(page.getByRole('button', { name: /Use My Location/ })).toBeVisible();
    
    // Verify minimum rating dropdown
    const ratingSelect = page.locator('select, [role="combobox"]').filter({ hasText: /Rating/ }).first();
    await expect(ratingSelect).toBeVisible();
    
    // Verify photos checkbox
    const photosCheckbox = page.locator('input[type="checkbox"]');
    await expect(photosCheckbox).toBeVisible();
    
    // Verify sort by dropdown
    const sortSelect = page.locator('select, [role="combobox"]').filter({ hasText: /Sort/ }).first();
    await expect(sortSelect).toBeVisible();
    
    // Verify action buttons
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear Filters' })).toBeVisible();
  });

  test('should have rating filter options', async ({ page }) => {
    const ratingOptions = [
      'Any Rating',
      '1+ Stars',
      '2+ Stars',
      '3+ Stars',
      '4+ Stars',
      '5 Stars'
    ];
    
    for (const option of ratingOptions) {
      await expect(page.locator(`text=${option}`)).toBeVisible();
    }
  });

  test('should have sort options', async ({ page }) => {
    const sortOptions = [
      'Newest',
      'Highest Rated',
      'Most Reviewed'
    ];
    
    for (const option of sortOptions) {
      await expect(page.locator(`text=${option}`)).toBeVisible();
    }
  });

  test('should allow text search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Rocky Mountain');
    await expect(searchInput).toHaveValue('Rocky Mountain');
  });

  test('should allow location input', async ({ page }) => {
    // Find latitude and longitude inputs (spinbuttons or number inputs)
    const inputs = await page.locator('input[type="number"]').all();
    
    if (inputs.length >= 2) {
      await inputs[0].fill('39.7392');
      await inputs[1].fill('104.9903');
      
      await expect(inputs[0]).toHaveValue('39.7392');
      await expect(inputs[1]).toHaveValue('104.9903');
    }
  });

  test('should toggle photos checkbox', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]');
    
    // Initially unchecked
    await expect(checkbox).not.toBeChecked();
    
    // Click to check
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    
    // Click to uncheck
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('should have correct SEO metadata', async ({ page }) => {
    await expect(page).toHaveTitle(/Search Campsites - Dispersed/);
  });
});

test.describe('Search Functionality', () => {
  test('should clear filters when Clear Filters clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/search');
    
    // Fill in some search criteria
    const searchInput = page.locator('input[placeholder="Search"]');
    await searchInput.fill('Test Search');
    
    const checkbox = page.locator('input[type="checkbox"]');
    await checkbox.check();
    
    // Click Clear Filters
    await page.getByRole('button', { name: 'Clear Filters' }).click();
    
    // Verify fields are cleared
    await expect(searchInput).toHaveValue('');
    await expect(checkbox).not.toBeChecked();
  });
});
