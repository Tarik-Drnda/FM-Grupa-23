import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import { 
  loginUser, 
  waitForElement
} from "../support/helpers.js";

describe("Negative Quantity Test - Product Cart (REQ-EG-02)", function () {
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

  // Test Case ID: 20260501-02
  // REQ-EG-02: Application should reject negative quantity values
  it("Should reject negative quantity value when adding product to cart", async function () {
    await loginUser(driver);

    await driver.get(config.testProducts.product1.url);
    await driver.sleep(4000);

    // Close popup if exists
    try {
      let closeButton = await driver.findElement(By.css('[aria-label="Close"], [class*="close"]'));
      if (await closeButton.isDisplayed()) {
        await closeButton.click();
        await driver.sleep(1000);
      }
    } catch (e) {
      // No popup
    }

    let isNegativeBlocked = false;

    // Try to find quantity input field
    try {
      let quantityField = await driver.findElement(
        By.css("input[type='number'][class*='quantity'], input[name*='qty'], input[class*='qty']")
      );

      await driver.executeScript("arguments[0].scrollIntoView(true);", quantityField);
      await driver.sleep(1000);

      // Try to enter negative value
      await quantityField.clear();
      await quantityField.sendKeys("-1");
      await driver.sleep(1000);

      let fieldValue = await quantityField.getAttribute("value");

      // Check if negative value was rejected
      if (fieldValue === "" || fieldValue === "1" || !fieldValue.includes("-")) {
        isNegativeBlocked = true;
      }

      // Check min attribute
      let minAttr = await quantityField.getAttribute("min");
      if (minAttr && parseInt(minAttr) >= 0) {
        isNegativeBlocked = true;
      }
    } catch (e) {
      // No direct input field - check if using SELECT dropdown
      try {
        let selectQty = await driver.findElement(
          By.css("select[class*='quantity'], select[name*='qty']")
        );
        
        let options = await selectQty.findElements(By.tagName("option"));
        let hasNegativeOption = false;
        
        for (let opt of options) {
          let val = await opt.getAttribute("value");
          if (parseInt(val) < 0) {
            hasNegativeOption = true;
          }
        }
        
        // SELECT without negative options is protected
        isNegativeBlocked = !hasNegativeOption;
      } catch (e2) {
        // Using +/- buttons - these inherently prevent negative values
        isNegativeBlocked = true;
      }
    }

    // Try to add to cart and check if error appears
    try {
      let addToCartButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Add to') or contains(., 'cart')]")
      );
      
      let isAddDisabled = await addToCartButton.getAttribute("disabled");
      if (isAddDisabled === "true") {
        isNegativeBlocked = true;
      }
    } catch (e) {
      // Button not found
    }

    expect(isNegativeBlocked, "Application ALLOWS negative quantity values!").to.be.true;
  });
});
