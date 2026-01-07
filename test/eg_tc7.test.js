import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import { 
  loginUser, 
  addProductToCartByUrl,
  goToCheckout, 
  fillPaymentCardDetails,
  waitForElement
} from "../support/helpers.js";

describe("Double Click Prevention Test - Order Button (REQ-EG-03)", function () {
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

  // Test Case ID: 20260501-03
  // REQ-EG-03: Application should prevent double/multiple clicks on payment button
  it("Should prevent double click on 'Order and Pay' button", async function () {
    await loginUser(driver);

    // Add products to meet minimum checkout amount
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

    // Fill payment details
    try {
      await fillPaymentCardDetails(driver);
    } catch (e) {
      // Continue even if payment fill fails
    }
    await driver.sleep(2000);

    // Find order button
    let orderButton = await driver.findElement(
      By.xpath("//button[contains(., 'Order') or contains(., 'Pay') or contains(., 'Place order')]")
    );

    await driver.executeScript("arguments[0].scrollIntoView(true);", orderButton);
    await driver.sleep(1500);

    // Save initial state
    let initialButtonText = await orderButton.getText();
    let initialDisabledState = await orderButton.getAttribute("disabled");

    // First click
    try {
      await orderButton.click();
    } catch (e) {
      await driver.executeScript("arguments[0].click();", orderButton);
    }

    await driver.sleep(100);

    // Check state after first click
    let isDoubleClickPrevented = false;

    // Check if button became disabled
    let afterClickDisabled = await orderButton.getAttribute("disabled");
    if (afterClickDisabled === "true") {
      isDoubleClickPrevented = true;
    }

    // Check if button has loading class
    let afterClickClass = await orderButton.getAttribute("class");
    if (afterClickClass && (afterClickClass.includes("loading") || afterClickClass.includes("processing") || afterClickClass.includes("disabled"))) {
      isDoubleClickPrevented = true;
    }

    // Check if button text changed to loading state
    try {
      let afterClickText = await orderButton.getText();
      if (afterClickText !== initialButtonText && (afterClickText.toLowerCase().includes("processing") || afterClickText.toLowerCase().includes("loading"))) {
        isDoubleClickPrevented = true;
      }
    } catch (e) {
      // Element may no longer be available - page changed
      isDoubleClickPrevented = true;
    }

    expect(isDoubleClickPrevented, "Application has NO double click protection!").to.be.true;
  });
});
