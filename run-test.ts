import { runAccessibilityTest } from './axe-test';

const url = 'https://field-sandbox.atlan.com/';

console.log(`Starting accessibility test for ${url}`);
console.log('Please confirm when the page is fully loaded and ready for testing.');

runAccessibilityTest(url)
  .then(() => {
    console.log('Accessibility test completed successfully.');
  })
  .catch((error) => {
    console.error('Error running accessibility test:', error);
    process.exit(1);
  });