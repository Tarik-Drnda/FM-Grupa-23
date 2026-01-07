import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import { 
  loginUser, 
  addProductToCartByUrl,
  goToCheckout, 
  waitForElement
} from "../support/helpers.js";

describe("SQL Injection Test - Address Field (REQ-EG-01)", function () {
  this.timeout(150000);
  let driver;

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

  // Test Case ID: 20260501-01
  // REQ-EG-01: Application should prevent SQL injection in address field
  it("Should prevent SQL injection in delivery address field on checkout page", async function () {
    await loginUser(driver);

    // Add product to cart (min 50 KM)
    await addProductToCartByUrl(driver, config.testProducts.product3.url);
    await driver.sleep(2000);

    await goToCheckout(driver);
    await driver.sleep(3000);

    // Verify checkout page is open
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

    // SQL Injection payload
    const sqlPayload = config.sqlInjectionPayloads[0]; // "' OR '1'='1"

    await addressField.click();
    await addressField.clear();
    await addressField.sendKeys(sqlPayload);
    await driver.sleep(2000);

    let fieldValue = await addressField.getAttribute("value");

    // Check if input was sanitized
    let isSanitized = fieldValue !== sqlPayload;

    // Check for validation error message
    let hasValidationError = false;
    try {
      let errorMessage = await driver.findElement(
        By.xpath("//*[contains(text(), 'invalid') or contains(text(), 'error') or contains(text(), 'not allowed')]")
      );
      hasValidationError = await errorMessage.isDisplayed();
    } catch (e) {
      // No error message
    }

    // Check if field is marked invalid
    let isFieldInvalid = false;
    try {
      let ariaInvalid = await addressField.getAttribute("aria-invalid");
      let fieldClass = await addressField.getAttribute("class");
      isFieldInvalid = ariaInvalid === "true" || fieldClass.includes("error") || fieldClass.includes("invalid");
    } catch (e) {
      // Ignore
    }

    // Check if submit is blocked
    let isSubmitBlocked = false;
    let submitButton = await driver.findElement(
      By.xpath("//button[contains(., 'Save') or contains(., 'Continue') or contains(., 'Order') or contains(., 'Pay')]")
    );
    let isDisabled = await submitButton.getAttribute("disabled");
    isSubmitBlocked = isDisabled === "true";

    // Assert - At least one protection mechanism must be active
    let isProtected = isSanitized || hasValidationError || isFieldInvalid || isSubmitBlocked;
    expect(isProtected, "Application has NO protection against SQL injection!").to.be.true;
  });
});
