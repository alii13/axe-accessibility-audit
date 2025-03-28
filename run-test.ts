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
        'https://field-sandbox.atlan.com/insights',
        'https://field-sandbox.atlan.com/workflows/monitor',
        'https://field-sandbox.atlan.com/workflows/manage',
        'https://field-sandbox.atlan.com/workflows/marketplace',
        'https://field-sandbox.atlan.com/workflows/profile/csa-asset-term-link-1727948590/runs',
        'https://field-sandbox.atlan.com/workflows/profile/csa-asset-term-link-1727948590/overview',
        'https://field-sandbox.atlan.com/workflows/profile/csa-asset-term-link-1727948590/config',
        'https://field-sandbox.atlan.com/workflows/setup/atlan-snowflake',
        'https://field-sandbox.atlan.com/reporting/assets',
        'https://field-sandbox.atlan.com/products/home/overview',
        'https://field-sandbox.atlan.com/products/new-product',
        'https://field-sandbox.atlan.com/products/domains',
        'https://field-sandbox.atlan.com/products/c25c9149-9095-4f69-8e37-e723bf26de53/overview',
        'https://field-sandbox.atlan.com/products/c25c9149-9095-4f69-8e37-e723bf26de53/productsAndAssets',
        'https://field-sandbox.atlan.com/products/c25c9149-9095-4f69-8e37-e723bf26de53/reports',
        'https://field-sandbox.atlan.com/products/c25c9149-9095-4f69-8e37-e723bf26de53/lineage',
        'https://field-sandbox.atlan.com/playbooks-filters',
        'https://field-sandbox.atlan.com/governance',
        'https://field-sandbox.atlan.com/governance/governance-workflows/templates',
        'https://field-sandbox.atlan.com/governance/governance-workflows/new-workflow',
        'https://field-sandbox.atlan.com/governance/governance-workflows',
       'https://field-sandbox.atlan.com/governance/tags/o8qeylQYVW5RlQyxNMnKPT/overview',
       'https://field-sandbox.atlan.com/governance/tags/o8qeylQYVW5RlQyxNMnKPT/linked_assets',
        'https://field-sandbox.atlan.com/governance/requests',
        'https://field-sandbox.atlan.com/governance/readme-templates',
        'https://field-sandbox.atlan.com/governance/purposes',
        'https://field-sandbox.atlan.com/governance/purposes/eb58d6c4-dfbd-4aaa-943c-e4e8f9af0f52',
        'https://field-sandbox.atlan.com/governance/policy-center',
        'https://field-sandbox.atlan.com/governance/policy-center/ec0a6e92-f0c7-4010-ba05-cb8cd7fb904a/overview',
        'https://field-sandbox.atlan.com/governance/policy-center/ec0a6e92-f0c7-4010-ba05-cb8cd7fb904a/policy',
        'https://field-sandbox.atlan.com/governance/policy-center/ec0a6e92-f0c7-4010-ba05-cb8cd7fb904a/assets',
        'https://field-sandbox.atlan.com/governance/policy-center/ec0a6e92-f0c7-4010-ba05-cb8cd7fb904a/relationships',
        'https://field-sandbox.atlan.com/governance/playbooks',
        'https://field-sandbox.atlan.com/governance/playbooks/new',
        'https://field-sandbox.atlan.com/governance/playbooks/play-revolver/overview',
        'https://field-sandbox.atlan.com/governance/playbooks/play-revolver/rules',
        'https://field-sandbox.atlan.com/governance/personas',
        'https://field-sandbox.atlan.com/governance/personas/f8e629dc-7c3d-438a-89ee-f61ab01471b5',
        'https://field-sandbox.atlan.com/governance/options',
        'https://field-sandbox.atlan.com/governance/custom-metadata/f23f39ee-fa04-4ab6-900c-7bf9fe391281/properties',
        'https://field-sandbox.atlan.com/governance/custom-metadata/f23f39ee-fa04-4ab6-900c-7bf9fe391281/assets',
        'https://field-sandbox.atlan.com/governance/connections',
        'https://field-sandbox.atlan.com/governance/badges/f57f052c-88cc-4b73-9e30-1bf5fe3281cf',
        'https://field-sandbox.atlan.com/governance/governance-workflows/overview',
        'https://field-sandbox.atlan.com/governance/governance-workflows/definitions',
        'https://field-sandbox.atlan.com/governance/governance-workflows/monitor',
        'https://field-sandbox.atlan.com/governance/governance-workflows/profile/ddf453cd-402a-4033-a0d6-c42ec13b101a/workflow',
        'https://field-sandbox.atlan.com/governance/governance-workflows/profile/ddf453cd-402a-4033-a0d6-c42ec13b101a/overview',
        'https://field-sandbox.atlan.com/governance/governance-workflows/profile/ddf453cd-402a-4033-a0d6-c42ec13b101a/runs',
        'https://field-sandbox.atlan.com/glossary/223e5746-80f8-4687-b689-b2ac5c932ba9/overview',
        'https://field-sandbox.atlan.com/glossary/223e5746-80f8-4687-b689-b2ac5c932ba9/termsAndCategories',
        'https://field-sandbox.atlan.com/glossary/223e5746-80f8-4687-b689-b2ac5c932ba9/uploadHistory',
        'https://field-sandbox.atlan.com/assets',
        'https://field-sandbox.atlan.com/assets/4423a34e-742b-4861-8947-542802aa246f/overview',
        'https://field-sandbox.atlan.com/assets/4423a34e-742b-4861-8947-542802aa246f/columns',
        'https://field-sandbox.atlan.com/assets/4423a34e-742b-4861-8947-542802aa246f/lineage',
        'https://field-sandbox.atlan.com/assets/4423a34e-742b-4861-8947-542802aa246f/contract',
        'https://field-sandbox.atlan.com/admin',
        'https://field-sandbox.atlan.com/admin/sso',
        'https://field-sandbox.atlan.com/admin/misc/warningpopover',
        'https://field-sandbox.atlan.com/admin/misc/confirmationmodal',
        'https://field-sandbox.atlan.com/admin/groups',
        'https://field-sandbox.atlan.com/admin/webhooks',
        'https://field-sandbox.atlan.com/admin/users',
        'https://field-sandbox.atlan.com/admin/smtp',
        'https://field-sandbox.atlan.com/admin/query-logs',
        'https://field-sandbox.atlan.com/admin/overview',
        'https://field-sandbox.atlan.com/admin/labs',
        'https://field-sandbox.atlan.com/admin/integrations',
        'https://field-sandbox.atlan.com/admin/event-logs',
        'https://field-sandbox.atlan.com/admin/api-tokens',
        'https://field-sandbox.atlan.com/404',
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