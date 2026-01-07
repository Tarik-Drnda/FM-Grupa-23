import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import { 
  loginUser, 
  addProductToCartByUrl,
  goToCheckout, 
  waitForElement
} from "../support/helpers.js";

describe("Buffer Overflow Prevention Test - Address Field (REQ-EG-04)", function () {
  this.timeout(150000);
  let driver;

  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Setup
  beforeEach(async function () {
    driver = await new Builder().forBrowser(Browser.FIREFOX).build();
    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: config.timeouts.implicit });
  });

  // Teardown
  afterEach(async function () {
    await driver.quit();
  });

  // Test Case ID: 20260501-04
  // REQ-EG-04: Application should prevent buffer overflow in address field
  it("Should prevent buffer overflow when entering string over 100 characters in address field", async function () {
    await loginUser(driver);

    // Add products to cart
    await addProductToCartByUrl(driver, config.testProducts.product1.url);
    await addProductToCartByUrl(driver, config.testProducts.product2.url);
    await driver.sleep(2000);

    await goToCheckout(driver);
    await driver.sleep(3000);

    // Verify checkout page
    let checkoutPage = await waitForElement(
      driver,
      By.xpath("//*[contains(text(), 'Checkout') or contains(@class, 'checkout')]")
    );
    expect(await checkoutPage.isDisplayed()).to.be.true;

    // Find address field
    let addressField = await driver.findElement(
      By.css("input[placeholder*='address'], input[placeholder*='street'], input[name*='address'], textarea[placeholder*='address']")
    );

    await driver.executeScript("arguments[0].scrollIntoView(true);", addressField);
    await driver.sleep(1000);

    // Generate overflow string (150 characters)
    const overflowString = generateRandomString(150);

    // Check if field has maxlength attribute
    let maxLengthAttr = await addressField.getAttribute("maxlength");
    let hasMaxLength = maxLengthAttr && parseInt(maxLengthAttr) > 0;

    // Enter overflow string
    await addressField.click();
    await addressField.clear();
    await addressField.sendKeys(overflowString);
    await driver.sleep(2000);

    let fieldValue = await addressField.getAttribute("value");

    // Check protection mechanisms
    let isBufferOverflowPrevented = false;

    // Check if string was truncated
    if (fieldValue.length < overflowString.length) {
      isBufferOverflowPrevented = true;
    }

    // Check if maxlength attribute exists
    if (hasMaxLength) {
      isBufferOverflowPrevented = true;
    }

    // Check for validation error
    try {
      let errorMsg = await driver.findElement(
        By.xpath("//*[contains(text(), 'too long') or contains(text(), 'maximum') or contains(text(), 'limit')]")
      );
      if (await errorMsg.isDisplayed()) {
        isBufferOverflowPrevented = true;
      }
    } catch (e) {
      // No error message
    }

    // Check if page is still responsive
    let pageTitle = await driver.getTitle();
    let isPageResponsive = pageTitle && pageTitle.length > 0;
    expect(isPageResponsive, "Page is not responsive after entering long string!").to.be.true;

    expect(isBufferOverflowPrevented, "Application has NO buffer overflow protection!").to.be.true;
  });
});
