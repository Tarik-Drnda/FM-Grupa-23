import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import { 
  loginUser, 
  waitForElement
} from "../support/helpers.js";

describe("Checkout Test - Sign In Required (REQ-CHECKOUT-SIGNIN)", function () {
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

  // Test Case ID: 20253012-04
  // REQ-CHECKOUT-SIGNIN
  it("Should show sign in popup when user tries to checkout without being signed in", async function () {
    // Navigate directly to WiFi extender product page WITHOUT logging in
    console.log("\n[>>] NAVIGATING TO WIFI EXTENDER PRODUCT (NOT SIGNED IN)...\n");
    await driver.get(config.baseUrl);
    await driver.sleep(2000);// Added because website detects too fast actions
    
    // Navigate to product page directly
    await driver.get(config.testProducts.product4.url);
    await driver.sleep(3000); // Added because website detects too fast actions

    // Find quantity input field
    console.log("[#] Looking for quantity field...");
    let quantityInput = await waitForElement(
      driver,
      By.id("selectCount")
    );
    await driver.sleep(1000);// Added because website detects too fast actions

    // Set quantity to 5
    console.log("[#] Setting quantity to 5...");
    await driver.executeScript(
      `arguments[0].value = '5'; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));`,
      quantityInput
    );
    await driver.sleep(2000); // Added because website detects too fast actions
    console.log("[OK] Quantity set to 5\n");

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
    await driver.sleep(2000); // Added because website detects too fast actions
    
    console.log("[OK] Checkout button clicked\n");

    // Wait for sign in popup with "Sign in to checkout" message
    console.log("[*] Waiting for 'Sign in to checkout' popup...\n");
    let signInPopup = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'Sign in to checkout')]")
      ),
      config.timeouts.explicit
    );
    
    // Verify popup is displayed
    expect(await signInPopup.isDisplayed()).to.be.true;
    
    let popupText = await signInPopup.getText();
    console.log("[OK] Sign-in popup displayed: " + popupText);
    
    // Assert - Popup should contain "Sign in to checkout"
    expect(popupText).to.include("Sign in to checkout");
    
    console.log("[OK] Test successful - Sign in required for checkout\n");
  });
});
