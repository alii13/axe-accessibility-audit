import { chromium } from 'playwright';
import { runAccessibilityTest } from './axe-test';

async function runTests() {
  try {
    // Launch browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();

    try {
      // List of URLs to test
      const urls = [
        'https://field-sandbox.atlan.com/',
        'https://field-sandbox.atlan.com/admin/users',
        // Add more URLs here as needed
      ];

      // Run tests for each URL
      for (const url of urls) {
        console.log(`\n=== Starting accessibility test for ${url} ===\n`);
        console.log('Please confirm when the page is fully loaded and ready for testing.');
        await runAccessibilityTest(url, context);
        console.log(`\n✓ Accessibility test completed successfully for ${url}\n`);
      }
    } finally {
      // Close browser after all tests are complete
      await browser.close();
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();