import { Page, chromium } from 'playwright'
import { runAccessibilityTest } from './axe-test'
import dummyUrls,{ DUMMY_DOMAIN } from './constants/urls'
// Get domain from environment variable or use default
const DOMAIN = process.env.DOMAIN || DUMMY_DOMAIN

// Get URLs from environment variable or use default
const urls = process.env.TEST_URLS 
    ? process.env.TEST_URLS.split(',') 
    : dummyUrls

// Get login credentials from environment variables
const LOGIN_USERNAME = process.env.LOGIN_USERNAME
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD

async function login({ page }: { page: Page }) {
    try {
        // Navigate to the domain
        await page.goto(DOMAIN)
        
        // Wait for the login form to be visible
        await page.waitForSelector('#kc-form-login', { timeout: 30000 })
        
        // Fill in the login form
        await page.fill('#username', LOGIN_USERNAME || '')
        await page.fill('#password', LOGIN_PASSWORD || '')
        
        // Click the login button
        await page.click('#kc-login')
        
        // Wait for the profile dropdown to be visible, indicating successful login
        await page.waitForSelector('[data-test-id="nav-profile-dropdown"]', {
            timeout: 300000,
        })
        
        console.log('Successfully logged in')
    } catch (error) {
        console.error('Login failed:', error)
        throw error
    }
}

async function runTests() {
    try {
        // Launch browser
        const browser = await chromium.launch({ 
            headless: process.env.HEADLESS === 'true' 
        })
        const context = await browser.newContext()
        const page = await context.newPage()

        // make sure that the user is logged in
        await login({ page })

        try {
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
