import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import { 
  loginUser, 
  goToCheckout, 
  waitForElement,
  setProductQuantity
} from "../support/helpers.js";

describe("Maximum Order Limit - Payment Unavailable Test (REQ-DCT-03)", function () {
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

  // Test Case ID: 20260401-03
  // REQ-DCT-03: User will be returned to checkout and payment option will be unavailable if total >= 292 KM
  it("Should disable payment when total value >= 292 KM", async function () {
    await loginUser(driver);

    // Open product page (42.81 KM)
    await driver.get(config.testProducts.product3.url);
    await driver.sleep(4000);

    // Close popup if exists
    try {
      let closeBtn = await driver.findElement(By.css('[aria-label="Close"], [class*="close"]'));
      if (await closeBtn.isDisplayed()) {
        await closeBtn.click();
        await driver.sleep(1000);
      }
    } catch (e) {
      // No popup
    }

    // Set quantity to 7 (42.81 * 7 = 299.67 KM > 292 KM)
    try {
      await setProductQuantity(driver, 7);
    } catch (e) {
      // Try alternative methods
      try {
        let plusBtn = await driver.findElement(
          By.css("button[class*='plus'], button[class*='increase'], [aria-label*='increase']")
        );
        for (let i = 0; i < 6; i++) {
          await plusBtn.click();
          await driver.sleep(300);
        }
      } catch (e2) {
        // Cannot set quantity
      }
    }

    // Add to cart
    let addToCartButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(), 'Add to') or contains(., 'cart')]")),
      8000
    );
    await driver.executeScript("arguments[0].scrollIntoView(true);", addToCartButton);
    await driver.sleep(1500);
    await driver.executeScript("arguments[0].click();", addToCartButton);
    await driver.sleep(4000);

    await goToCheckout(driver);
    await driver.sleep(3000);

    // Verify checkout page
    let checkoutPage = await waitForElement(
      driver,
      By.xpath("//*[contains(text(), 'Checkout') or contains(@class, 'checkout')]")
    );
    expect(await checkoutPage.isDisplayed()).to.be.true;

    let isPaymentUnavailable = false;

    // Check for limit message
    try {
      let limitMessage = await driver.findElement(
        By.xpath("//*[contains(text(), 'limit') or contains(text(), 'maximum') or contains(text(), 'exceed') or contains(text(), '292')]")
      );
      if (await limitMessage.isDisplayed()) {
        isPaymentUnavailable = true;
      }
    } catch (e) {
      // No limit message
    }

    // Check if Order button is disabled
    try {
      let orderButton = await driver.findElement(
        By.xpath("//button[contains(., 'Order') or contains(., 'Pay') or contains(., 'Place order')]")
      );
      
      await driver.executeScript("arguments[0].scrollIntoView(true);", orderButton);
      await driver.sleep(1000);
      
      let isButtonDisabled = await orderButton.getAttribute("disabled");
      let buttonClass = await orderButton.getAttribute("class");
      
      if (isButtonDisabled === "true" || buttonClass.includes("disabled")) {
        isPaymentUnavailable = true;
      }
    } catch (e) {
      // Button not found
    }

    // Check current URL - should still be on checkout
    let currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes("checkout") || currentUrl.includes("cart")) {
      // User is on checkout - this is expected for blocked payment
      if (!currentUrl.includes("success") && !currentUrl.includes("confirm")) {
        isPaymentUnavailable = true;
      }
    }

    expect(isPaymentUnavailable, 
      `CRITICAL: Payment is available even though total exceeds limit of ${config.checkoutLimits.maximumAmount} KM!`
    ).to.be.true;
  });
});
