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
                `${DOMAIN}/assets/291db465-21bf-40c4-8106-f026b5c7d0c4/overview`,
                `${DOMAIN}/assets/291db465-21bf-40c4-8106-f026b5c7d0c4/columns`,
                `${DOMAIN}/assets/291db465-21bf-40c4-8106-f026b5c7d0c4/lineage`,
                `${DOMAIN}/assets/291db465-21bf-40c4-8106-f026b5c7d0c4/contract`,
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


            // Run tests for each URL
            for (const url of urls) {
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
