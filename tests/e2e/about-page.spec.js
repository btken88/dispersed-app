const { test, expect } = require('@playwright/test');

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/about');
  });

  test('should render all content sections', async ({ page }) => {
    // Verify main sections are present
    await expect(page.getByRole('heading', { name: 'What is Dispersed Camping?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Challenge' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Our Solution' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Leave No Trace' })).toBeVisible();
  });

  test('should NOT show Technology section', async ({ page }) => {
    // Verify Technology section was removed
    const technologyHeading = page.getByRole('heading', { name: 'Technology' });
    await expect(technologyHeading).not.toBeVisible();
    
    // Verify technology-related text is not present
    await expect(page.locator('text=React 18')).not.toBeVisible();
    await expect(page.locator('text=Firebase Functions')).not.toBeVisible();
  });

  test('should display camping image', async ({ page }) => {
    // Verify image is present and has correct alt text
    const image = page.locator('img[alt*="Tent overlooking mountain vista"]');
    await expect(image).toBeVisible();
    
    // Verify image is loaded
    await expect(image).toHaveJSProperty('complete', true);
    await expect(image).not.toHaveJSProperty('naturalHeight', 0);
  });

  test('should have image next to intro content', async ({ page }) => {
    // Verify layout structure with image and intro text side by side
    const introWithImage = page.locator('.intro-with-image');
    await expect(introWithImage).toBeVisible();
    
    const image = introWithImage.locator('img');
    const introText = introWithImage.locator('.intro-text');
    
    await expect(image).toBeVisible();
    await expect(introText).toBeVisible();
  });

  test('should display all 7 features', async ({ page }) => {
    // Verify all feature items are present
    const features = [
      'Interactive Maps',
      'Real-Time Weather',
      'Community Reviews',
      'Photo Galleries',
      'Smart Search',
      'Personal Collections',
      'Share Locations'
    ];
    
    for (const feature of features) {
      await expect(page.locator(`text=${feature}`)).toBeVisible();
    }
  });

  test('should have Leave No Trace section with highlighted styling', async ({ page }) => {
    const leaveNoTrace = page.locator('.responsible-camping');
    await expect(leaveNoTrace).toBeVisible();
    
    await expect(page.getByRole('heading', { name: 'Leave No Trace' })).toBeVisible();
    await expect(page.locator('text=Pack out everything you pack in')).toBeVisible();
  });

  test('should have correct SEO metadata', async ({ page }) => {
    await expect(page).toHaveTitle(/About Dispersed - Interactive Camping Map/);
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Learn about Dispersed');
    expect(description).toContain('dispersed camping locations');
  });

  test('should have no personal attribution', async ({ page }) => {
    // Verify no references to Bryce Kennedy
    await expect(page.locator('text=Bryce Kennedy')).not.toBeVisible();
    await expect(page.locator('text=By Bryce')).not.toBeVisible();
  });
});

test.describe('About Page Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should stack image and text vertically on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    
    // Verify content is still visible
    const introWithImage = page.locator('.intro-with-image');
    await expect(introWithImage).toBeVisible();
    
    const image = introWithImage.locator('img');
    await expect(image).toBeVisible();
    
    // Verify image loads on mobile
    await expect(image).toHaveJSProperty('complete', true);
  });

  test('should have readable text on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    
    // Verify all headings are visible and readable
    await expect(page.getByRole('heading', { name: 'What is Dispersed Camping?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Features' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Leave No Trace' })).toBeVisible();
  });
});
