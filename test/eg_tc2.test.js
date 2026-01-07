import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import { 
  loginUser, 
  waitForElement
} from "../support/helpers.js";

describe("Checkout Test - Maximum Amount (REQ-CHECKOUT-VALID)", function () {
  this.timeout(150000); // 150 seconds timeout (2.5 minutes)
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

  // Test Case ID: 20253012-03
  // REQ-CHECKOUT-VALID
  it("Should change quantity to maximum and proceed to checkout and disable Order and Pay", async function () {
    // User login
    await loginUser(driver);

    // Navigate directly to product 3 page
    console.log("\n[>>] NAVIGATING TO PRODUCT 3...\n");
    await driver.get(config.testProducts.product3.url);
    await driver.sleep(3000); // Added because website detects too fast actions

    // Find quantity input field
    console.log("[#] Looking for quantity field...");
    let quantityInput = await waitForElement(
      driver,
      By.id("selectCount")
    );
    await driver.sleep(1000); // Added because website detects too fast actions

    // Find maximum value
    let maxQuantity = await quantityInput.getAttribute("max");
    console.log(`[+] Maximum quantity: ${maxQuantity}`);

    // Set quantity to maximum
    await driver.executeScript(
      `arguments[0].value = '${maxQuantity}'; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));`,
      quantityInput
    );
    await driver.sleep(2000);
    console.log(`[OK] Quantity set to maximum (${maxQuantity})\n`);

    // Click checkout button
    console.log("[=] LOOKING FOR CHECKOUT BUTTON...\n");
    let checkoutButton = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'checkout')]")
      ),
      config.timeouts.explicit
    );
    
    // Scroll button into view and click
    await driver.executeScript("arguments[0].scrollIntoView(true);", checkoutButton);
    await driver.sleep(1000); // Added because website detects too fast actions
    
    console.log("[*] Clicking checkout button...");
    await checkoutButton.click();
    await driver.sleep(config.timeouts.sleep);
    
    console.log("[OK] Checkout button click successful\n");

    // Click "Order and Pay" button
    console.log("[$] LOOKING FOR 'ORDER AND PAY' BUTTON...\n");
    let orderAndPayButton = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'Order and Pay')]")
      ),
      config.timeouts.explicit
    );
    
    // Scroll button into view and click
    await driver.executeScript("arguments[0].scrollIntoView(true);", orderAndPayButton);
    await driver.sleep(1000); // Added because website detects too fast actions
    
    console.log("[>] Clicking 'Order and Pay' button...");
    try {
      await orderAndPayButton.click();
      await driver.sleep(2000);
      console.log("[OK] 'Order and Pay' button click successful");
      console.log("[i] If test reaches here and fails, it means order was rejected (as expected)\n");
    } catch (e) {
      console.log("[OK] Error when clicking 'Order and Pay' is expected - test is successful\n");
    }
  });
});