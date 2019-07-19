// Require modules used in the logic below
const {Builder, By, Key, until} = require('selenium-webdriver');

// You can use a remote Selenium Hub, but we are not doing that here
require('chromedriver');
const driver = new Builder()
    .forBrowser('chrome')
    .build();

// Get environment variables for Skuid site credentials
const baseUrl = process.env.SKUID_HOST
const username = process.env.SKUID_UN
const password = process.env.SKUID_PW

// Logic to login to a Skuid site using the above credentials
// Note: This function does not check if already logged in. 
var login = async function() {
    // Define login elements
    let loginContainer = By.css('.public-main-wrapper');
    let inpUsername = By.xpath('//*[@id="username-input-field"]//input');
    let inpPassword = By.xpath('//*[@id="password-input-field"]//input');
    let btnLoginWithoutSso = By.id('login-without-sso-button');
    let btnLogin = By.id('userpass-login-button');
    var enterCredentialsAndLogin = async function() {
        console.log('Entering credentials...')
        // Wait until an input element appears
        await driver.wait(until.elementLocated(inpUsername), 10 * 1000);
        // Enter credentials and log in
        await driver.findElement(inpUsername).sendKeys(username);
        await driver.findElement(inpPassword).sendKeys(password);
        await driver.findElement(btnLogin).click();
    }

    // Load the login page
    await driver.get(baseUrl + '/ui/login');

    // Wait until the page is loaded
    await driver.wait(until.elementLocated(loginContainer), 10 * 1000);
    console.log('Login screen loaded.')

    // console.log(await driver.findElement(By.css('body')).getAttribute('innerHTML'))

    // Check to see if SSO has been enabled for this site.
    // If it has, click through to log in with credentials instead.
    await driver.findElement(btnLoginWithoutSso).then(async function(){
        console.log ('SSO enabled. Logging in with username and password instead.')
        await driver.findElement(btnLoginWithoutSso).click()
        enterCredentialsAndLogin()
    }, async function(){
        await enterCredentialsAndLogin()
    })

    // Wait to be logged in, assuming it was was successful 
    // once the Log in button has gone "stale."
    await driver.wait(until.stalenessOf(driver.findElement(btnLogin)));
    console.log('Logged in.')
}
// Configure Jasmine's timeout value to account for longer tests.
// Adjust this value if you find our tests failing due to timeouts.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20 * 1000;

// Define a category of tests using test framework, in this case Jasmine
describe("Basic element tests", function() {
    // Before every test, open a browser and login
    // using the logic written above.
    beforeEach(async function() {
        await login();
        console.log('Test beginning.')

    });
    // After each test, close the browser.
    afterAll(async function() {
        await driver.quit();
    });

    // Specify a test
    it("Click the button, Verify Correct UI Block Message", async function() {
        // Provide basic data used to evaluate the test.
        // This test should pass.
        var testData = {
            pageName: 'SeleniumTest',
            button: By.css('#test-button'),
            blockMessage: By.css('div.blockUI.blockMsg')
        }
        console.log('Running test...')
        console.log('Going to '+ baseUrl + '/ui/page/preview/' + testData.pageName)

        // Preview the test page
        await driver.get(baseUrl + '/ui/page/preview/' + testData.pageName);

        console.log(await driver.getCurrentUrl())

        console.log(await driver.getTitle())

        // Wait for button
        await driver.wait(until.elementLocated(testData.button), 10 * 1000);

        // Verify button is present
        expect(await driver.findElement(testData.button).isDisplayed()).toBe(true);

        // Click button
        await driver.findElement(testData.button).click();

        // Wait for the blocked UI message to appear
        await driver.wait(until.elementLocated(testData.blockMessage), 10 * 1000);

        // Verify the text of the message, which should match the example page XML
        expect(await driver.findElement(testData.blockMessage).getText()).toBe('The button renders and is clickable.');
    });

    // // Specify a second test
    // it("Click the button, Verify Incorrect UI Block Message", async function() {
    //     // Provide basic data used to evaluate the test.
    //     // This test should fail.
    //     var testData = {
    //         pageName: 'SeleniumTest',
    //         button: By.css('#test-button'),
    //         blockMessage: By.css('div.blockUI.blockMsg')
    //     }

    //     // Preview the test page
    //     await driver.get(baseUrl + '/ui/page/preview/' + testData.pageName);

    //     // Wait for button
    //     await driver.wait(until.elementLocated(testData.button), 10 * 1000);

    //     // Verify button is present
    //     expect(await driver.findElement(testData.button).isDisplayed()).toBe(true);

    //     // Click button
    //     await driver.findElement(testData.button).click();

    //     // Wait for and Verify Correct UI Block Message
    //     await driver.wait(until.elementLocated(testData.blockMessage), 10 * 1000);

    //     // Verify the text of the message, which should *not* match the example page XML
    //     expect(await driver.findElement(testData.blockMessage).getText()).toBe('These aren\'t the Droids you\'re looking for..');
    // });
});