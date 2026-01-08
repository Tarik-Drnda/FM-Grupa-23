import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import {
  loginUser,
  setProductQuantity,
  waitForElement,
} from "../support/helpers.js";

describe("Checkout Test - Close Checkout failed window (REQ-CHECKOUT-CFW)", function () {
  this.timeout(config.timeouts.longWaitMs);

  let driver;

  // Setup - runs before each test
  beforeEach(async function () {
    driver = await new Builder().forBrowser(Browser.FIREFOX).build();
    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: config.timeouts.implicit });
  });

  // Teardown - runs after each test
  afterEach(async function () {
    await driver.quit();
  });

  // Test Case ID: 20260101-02
  // REQ-CHECKOUT-CFW
  it("signs in, triggers checkout popup and closes it", async function () {
    // Sign in at the start of the test
    await loginUser(driver);

    // Navigate directly to the product4 page
    await driver.get(config.testProducts.product4.url);
    await driver.sleep(2000); // Added because website detects too fast actions

    // Ensure quantity input exists and set to 5
    await waitForElement(driver, By.id("selectCount"));
    await setProductQuantity(driver, "5");
    await driver.sleep(1000); // Added because website detects too fast actions

    // Find and click the checkout-triggering element
    const checkoutBtn = await waitForElement(
      driver,
      By.xpath(
        "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'checkout') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'checkout')]"
      )
    );

    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      checkoutBtn
    );

    try {
      await checkoutBtn.click();
    } catch (err) {
      await driver.executeScript("arguments[0].click();", checkoutBtn);
    }

    // Wait for popup with minimum amount message
    console.log("[*] Waiting for popup with minimum amount message...\n");

    const popupLocator = By.xpath("//*[contains(text(), 'away from the 40')]");

    const popup = await driver.wait(
      until.elementLocated(popupLocator),
      config.timeouts.explicit
    );

    // Verify popup is displayed
    expect(await popup.isDisplayed()).to.be.true;

    const popupText = await popup.getText();
    console.log("[OK] Popup displayed: " + popupText);

    // Assert popup text
    expect(popupText).to.include("away from the 40");
    expect(popupText).to.include("KM order min");

    // Close the popup using the X button
    const closeBtnXPath = "/html/body/div[9]/div/div[2]/div/div/div[1]/div/svg";
    const closeBtn = await waitForElement(driver, By.xpath(closeBtnXPath));

    await driver.executeScript("arguments[0].scrollIntoView(true);", closeBtn);

    try {
      await closeBtn.click();
    } catch (err) {
      await driver.executeScript("arguments[0].click();", closeBtn);
    }

    // Assert the popup is gone
    await driver.wait(until.stalenessOf(popup), config.timeouts.longWaitMs);
  });
});
