import { Page, chromium } from 'playwright'
import { runAccessibilityTest } from './axe-test'

const DOMAIN = 'https://pr-24415.d3hx9hot5ivd2q.amplifyapp.com'

async function login({ page }: { page: Page }) {
    await page.goto(DOMAIN)
    // Wait for the profile dropdown to be visible, indicating successful login
    await page.waitForSelector('[data-test-id="nav-profile-dropdown"]', {
        timeout: 300000,
    })
}

async function runTests() {
    try {
        // Launch browser
        const browser = await chromium.launch({ headless: false })
        const context = await browser.newContext()
        const page = await context.newPage()

        // make sure that the user is logged in
        await login({ page })

        try {
            // Base domain for all URLs

            // List of URLs to test
            const urls = [
                `${DOMAIN}/insights`,
                `${DOMAIN}/workflows/monitor`,
                `${DOMAIN}/workflows/manage`,
                `${DOMAIN}/workflows/marketplace`,
                `${DOMAIN}/workflows/profile/csa-asset-term-link-1727948590/runs`,
                `${DOMAIN}/workflows/profile/csa-asset-term-link-1727948590/overview`,
                `${DOMAIN}/workflows/profile/csa-asset-term-link-1727948590/config`,
                `${DOMAIN}/workflows/setup/atlan-snowflake`,
                `${DOMAIN}/reporting/assets`,
                `${DOMAIN}/products/home/overview`,
                `${DOMAIN}/products/new-product`,
                `${DOMAIN}/products/domains`,
                `${DOMAIN}/products/c25c9149-9095-4f69-8e37-e723bf26de53/overview`,
                `${DOMAIN}/products/c25c9149-9095-4f69-8e37-e723bf26de53/productsAndAssets`,
                `${DOMAIN}/products/c25c9149-9095-4f69-8e37-e723bf26de53/reports`,
                `${DOMAIN}/products/c25c9149-9095-4f69-8e37-e723bf26de53/lineage`,
                `${DOMAIN}/playbooks-filters`,
                `${DOMAIN}/governance`,
                `${DOMAIN}/governance/governance-workflows/templates`,
                `${DOMAIN}/governance/governance-workflows/new-workflow`,
                `${DOMAIN}/governance/governance-workflows`,
                `${DOMAIN}/governance/tags/o8qeylQYVW5RlQyxNMnKPT/overview`,
                `${DOMAIN}/governance/tags/o8qeylQYVW5RlQyxNMnKPT/linked_assets`,
                `${DOMAIN}/governance/requests`,
                `${DOMAIN}/governance/readme-templates`,
                `${DOMAIN}/governance/purposes`,
                `${DOMAIN}/governance/purposes/eb58d6c4-dfbd-4aaa-943c-e4e8f9af0f52`,
                `${DOMAIN}/governance/policy-center`,
                `${DOMAIN}/governance/policy-center/ec0a6e92-f0c7-4010-ba05-cb8cd7fb904a/overview`,
                `${DOMAIN}/governance/policy-center/ec0a6e92-f0c7-4010-ba05-cb8cd7fb904a/policy`,
                `${DOMAIN}/governance/policy-center/ec0a6e92-f0c7-4010-ba05-cb8cd7fb904a/assets`,
                `${DOMAIN}/governance/policy-center/ec0a6e92-f0c7-4010-ba05-cb8cd7fb904a/relationships`,
                `${DOMAIN}/governance/playbooks`,
                `${DOMAIN}/governance/playbooks/new`,
                `${DOMAIN}/governance/playbooks/play-revolver/overview`,
                `${DOMAIN}/governance/playbooks/play-revolver/rules`,
                `${DOMAIN}/governance/personas`,
                `${DOMAIN}/governance/personas/f8e629dc-7c3d-438a-89ee-f61ab01471b5`,
                `${DOMAIN}/governance/options`,
                `${DOMAIN}/governance/custom-metadata/f23f39ee-fa04-4ab6-900c-7bf9fe391281/properties`,
                `${DOMAIN}/governance/custom-metadata/f23f39ee-fa04-4ab6-900c-7bf9fe391281/assets`,
                `${DOMAIN}/governance/connections`,
                `${DOMAIN}/governance/badges/f57f052c-88cc-4b73-9e30-1bf5fe3281cf`,
                `${DOMAIN}/governance/governance-workflows/overview`,
                `${DOMAIN}/governance/governance-workflows/definitions`,
                `${DOMAIN}/governance/governance-workflows/monitor`,
                `${DOMAIN}/governance/governance-workflows/profile/ddf453cd-402a-4033-a0d6-c42ec13b101a/workflow`,
                `${DOMAIN}/governance/governance-workflows/profile/ddf453cd-402a-4033-a0d6-c42ec13b101a/overview`,
                `${DOMAIN}/governance/governance-workflows/profile/ddf453cd-402a-4033-a0d6-c42ec13b101a/runs`,
                `${DOMAIN}/glossary/223e5746-80f8-4687-b689-b2ac5c932ba9/overview`,
                `${DOMAIN}/glossary/223e5746-80f8-4687-b689-b2ac5c932ba9/termsAndCategories`,
                `${DOMAIN}/glossary/223e5746-80f8-4687-b689-b2ac5c932ba9/uploadHistory`,
                `${DOMAIN}/assets`,
                `${DOMAIN}/assets/4423a34e-742b-4861-8947-542802aa246f/overview`,
                `${DOMAIN}/assets/4423a34e-742b-4861-8947-542802aa246f/columns`,
                `${DOMAIN}/assets/4423a34e-742b-4861-8947-542802aa246f/lineage`,
                `${DOMAIN}/assets/4423a34e-742b-4861-8947-542802aa246f/contract`,
                `${DOMAIN}/admin`,
                `${DOMAIN}/admin/sso`,
                `${DOMAIN}/admin/misc/warningpopover`,
                `${DOMAIN}/admin/misc/confirmationmodal`,
                `${DOMAIN}/admin/groups`,
                `${DOMAIN}/admin/webhooks`,
                `${DOMAIN}/admin/users`,
                `${DOMAIN}/admin/smtp`,
                `${DOMAIN}/admin/query-logs`,
                `${DOMAIN}/admin/overview`,
                `${DOMAIN}/admin/labs`,
                `${DOMAIN}/admin/integrations`,
                `${DOMAIN}/admin/event-logs`,
                `${DOMAIN}/admin/api-tokens`,
                `${DOMAIN}/404`,
                // Add more URLs here as needed
            ]

            const adminUrls = [
                `${DOMAIN}/admin`,
                `${DOMAIN}/admin/sso`,
                `${DOMAIN}/admin/misc/warningpopover`,
                `${DOMAIN}/admin/misc/confirmationmodal`,
                `${DOMAIN}/admin/groups`,
                `${DOMAIN}/admin/webhooks`,
                `${DOMAIN}/admin/users`,
                `${DOMAIN}/admin/smtp`,
                `${DOMAIN}/admin/query-logs`,
                `${DOMAIN}/admin/overview`,
                `${DOMAIN}/admin/labs`,
                `${DOMAIN}/admin/integrations`,
                `${DOMAIN}/admin/event-logs`,
                `${DOMAIN}/admin/api-tokens`,
                `${DOMAIN}/404`,
            ]

            // Run tests for each URL
            for (const url of adminUrls) {
                console.log(
                    `\n=== Starting accessibility test for ${url} ===\n`
                )
                console.log(
                    'Please confirm when the page is fully loaded and ready for testing.'
                )
                await runAccessibilityTest(url, page)
                console.log(
                    `\n✓ Accessibility test completed successfully for ${url}\n`
                )
            }
        } finally {
            // Close browser after all tests are complete
            page.close()
            await browser.close()
        }
    } catch (error) {
        console.error('Error running tests:', error)
        process.exit(1)
    }
}

// Run the tests
runTests()
