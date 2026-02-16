# End-to-End Testing with Playwright

## Overview
Comprehensive test suites for the Dispersed camping app covering navigation, authentication, and page functionality.

## Test Files
- `navigation.spec.js` - Navigation, routing, and mobile menu tests
- `authentication.spec.js` - Sign in/sign up form validation and flows
- `about-page.spec.js` - About page content and layout tests
- `search-page.spec.js` - Search functionality and form elements
- `map-page.spec.js` - Map loading and interaction tests

## Prerequisites
### System Dependencies (Linux)
Playwright requires certain system libraries. Install them:

```bash
# Ubuntu/Debian
sudo apt-get install libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2

# Or use Playwright's install command
npx playwright install-deps
```

### Install Playwright
```bash
npm install --save-dev @playwright/test --legacy-peer-deps
npx playwright install chromium
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test navigation.spec.js
```

### Run specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View test report
```bash
npm run test:e2e:report
```

## Test Coverage

### Navigation & Routing (7 tests)
- ✅ Navigate between all main pages
- ✅ Consistent header across pages
- ✅ Consistent footer across pages
- ✅ Logo navigation to homepage
- ✅ Mobile hamburger menu visibility
- ✅ Mobile menu toggle functionality
- ✅ Mobile menu closes on navigation

### Authentication (8 tests)
**Sign In Page:**
- ✅ Form renders correctly
- ✅ Navigate to sign up page
- ✅ Empty form validation
- ✅ Invalid credentials error
- ✅ SEO metadata

**Sign Up Page:**
- ✅ Form renders with all fields
- ✅ Navigate to sign in page
- ✅ Password mismatch validation
- ✅ Short password validation
- ✅ Invalid email validation
- ✅ SEO metadata

### About Page (8 tests)
- ✅ All content sections render
- ✅ Technology section removed
- ✅ Camping image displays
- ✅ Image positioned next to intro
- ✅ All 7 features listed
- ✅ Leave No Trace section highlighted
- ✅ SEO metadata correct
- ✅ No personal attribution
- ✅ Mobile responsive layout

### Search Page (7 tests)
- ✅ All form elements render
- ✅ Rating filter options
- ✅ Sort options
- ✅ Text search input
- ✅ Location input
- ✅ Photos checkbox toggle
- ✅ Clear filters functionality

### Map Page (6 tests)
- ✅ Page structure with header/footer
- ✅ Map instructions visible
- ✅ Map component loads
- ✅ Zoom controls present
- ✅ ArcGIS API loads
- ✅ Mobile responsive
- ✅ Mobile hamburger menu

## Manual Testing Completed via Chrome DevTools

### ✅ Homepage
- Header with "Dispersed" logo
- "View Map" and "Sign In" links functional
- Clean layout

### ✅ Sign In Page
- Email and password fields
- "Sign In" button
- Link to Sign Up page
- Proper navigation

### ✅ Sign Up Page (NEW - Issue #34)
- Display Name field (optional)
- Email field (required)
- Password field (required)
- Confirm Password field (required)
- "Sign Up" button
- Link back to Sign In
- Creates Firestore user profile (Issue #14)

### ✅ About Page (REDESIGNED)
- Technology section removed ✅
- Smaller image (250px) positioned left ✅
- Image next to "What is Dispersed Camping?" content ✅
- All content sections present
- Mobile responsive (stacks vertically)
- No "Bryce Kennedy" attribution ✅

### ✅ Map Page
- Interactive ArcGIS map loads
- "Click on the map to view details" instruction
- Zoom in/out controls
- Consistent header/footer
- ArcGIS API 4.16 loads successfully

### ✅ Search Page
- Search textbox
- Latitude/Longitude inputs
- "Use My Location" button
- Minimum Rating dropdown (6 options)
- Photos checkbox
- Sort By dropdown (3 options)
- Search and Clear Filters buttons

### ✅ Mobile Responsive
- Hamburger menu button appears at 768px width
- All pages tested at 375x667 (iPhone size)
- Navigation accessible on mobile

## Configuration
See `playwright.config.js` for:
- Test directory: `./tests/e2e`
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, Edge, Chrome
- Timeout: 30s per test
- Screenshots on failure
- HTML report generation

## Known Issues
- System dependencies required for Linux environments (libnspr4, libnss3, etc.)
- Use `npx playwright install-deps` to install automatically

## Future Test Additions
- User profile page tests (verify userUID not displayed)
- Authenticated user flows
- Campsite creation and management
- Photo upload functionality
- Review submission
- Firestore user profile creation validation
