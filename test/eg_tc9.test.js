import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import { 
  loginUser, 
  addProductToCartByUrl,
  goToCheckout, 
  waitForElement
} from "../support/helpers.js";

describe("Payment Failure Order Prevention Test (REQ-DCT-05)", function () {
  this.timeout(150000);
  let driver;

  const invalidCardNumber = "1234567890123456";

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

  // Test Case ID: 20260401-04
  // REQ-DCT-05: Valid order will not be created if there is a payment problem
  it("Should prevent order creation when invalid card number is entered", async function () {
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

    // Select Card payment method
    try {
      let cardPaymentOption = await driver.findElement(
        By.xpath("//label[contains(., 'Card') or contains(., 'Credit')]")
      );
      await cardPaymentOption.click();
      await driver.sleep(1000);
    } catch (e) {
      // Card payment already selected
    }

    // Enter invalid card number
    let cardNumberField = await driver.findElement(
      By.css("input[placeholder*='Card'], input[placeholder*='card'], input[name*='cardNumber'], input[autocomplete='cc-number']")
    );
    await cardNumberField.click();
    await cardNumberField.clear();
    await cardNumberField.sendKeys(invalidCardNumber);
    await driver.sleep(1000);

    // Enter expiry date
    try {
      let expiryField = await driver.findElement(
        By.css("input[placeholder*='MM'], input[placeholder*='Expir'], input[autocomplete='cc-exp']")
      );
      await expiryField.clear();
      await expiryField.sendKeys("12/28");
    } catch (e) {
      // Expiry field not found
    }

    // Enter CVV
    try {
      let cvvField = await driver.findElement(
        By.css("input[placeholder*='CVV'], input[placeholder*='CVC'], input[autocomplete='cc-csc']")
      );
      await cvvField.clear();
      await cvvField.sendKeys("123");
    } catch (e) {
      // CVV field not found
    }

    await driver.sleep(2000);

    // Find order button
    let orderButton = await driver.findElement(
      By.xpath("//button[contains(., 'Order') or contains(., 'Pay') or contains(., 'Place order')]")
    );
    await driver.executeScript("arguments[0].scrollIntoView(true);", orderButton);
    await driver.sleep(1000);

    let urlBeforeSubmit = await driver.getCurrentUrl();
    let isOrderPrevented = false;

    // Check if button is disabled
    let isButtonDisabled = await orderButton.getAttribute("disabled");
    if (isButtonDisabled === "true") {
      isOrderPrevented = true;
    }

    // Check for validation error
    try {
      let cardError = await driver.findElement(
        By.xpath("//*[contains(text(), 'invalid') or contains(text(), 'Invalid')][contains(text(), 'card') or contains(text(), 'Card')]")
      );
      if (await cardError.isDisplayed()) {
        isOrderPrevented = true;
      }
    } catch (e) {
      // No inline error
    }

    // If not prevented yet, try clicking and check result
    if (!isOrderPrevented) {
      await orderButton.click();
      await driver.sleep(5000);

      let urlAfterSubmit = await driver.getCurrentUrl();
      
      // Check if still on checkout (order didn't go through)
      if (urlAfterSubmit.includes("checkout") || urlAfterSubmit === urlBeforeSubmit) {
        isOrderPrevented = true;
      }

      // Check if NOT on success page
      if (!urlAfterSubmit.includes("confirm") && !urlAfterSubmit.includes("success") && !urlAfterSubmit.includes("thank")) {
        isOrderPrevented = true;
      }
    }

    expect(isOrderPrevented, "CRITICAL: Order was created with invalid card number!").to.be.true;
  });
});
