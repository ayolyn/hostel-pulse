const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
    page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure().errorText));

    await page.goto('http://localhost:3000/join');
    console.log("Navigated to /join");

    // Fill email and password for a sign in attempt
    await page.click('button:has-text("Sign In")'); // Switch to Sign In mode
    await page.waitForTimeout(500);

    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');

    console.log("Submitting form...");
    await page.click('button[type="submit"]');

    // Wait to capture network requests and console logs
    await page.waitForTimeout(5000);

    await browser.close();
})();
