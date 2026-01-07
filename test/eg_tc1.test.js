import { Browser, Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { config } from "../support/config.js";
import { 
  loginUser, 
  addProductToCartByUrl,
  goToCheckout, 
  waitForElement
} from "../support/helpers.js";

describe("Checkout Test - Minimum Amount (REQ-CHECKOUT-MIN-40)", function () {
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

  // Test Case ID: 20253012-01
  // REQ-CHECKOUT-MIN-40
  it("Should disable checkout when total amount is less than 40 KM", async function () {
    // User login
    await loginUser(driver);

    console.log("\n[*] ADDING PRODUCTS TO CART...\n");
    
    // Adding first product to cart 
    console.log("[1] Adding first product...");
    await addProductToCartByUrl(driver, config.testProducts.product1.url);
    console.log("[OK] First product added\n");

    // Adding second product to cart
    console.log("[2] Adding second product...");
    await addProductToCartByUrl(driver, config.testProducts.product2.url);
    console.log("[OK] Second product added\n");

    console.log("[*] Waiting 2 seconds before proceeding to checkout...");
    await driver.sleep(2000); // Added because website detects too fast actions

    // Click checkout button with "Min. to checkout" text
    console.log("[=] LOOKING FOR 'Min. to checkout' BUTTON...\n");
    let minCheckoutButton = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'to checkout')]")
      ),
      config.timeouts.explicit
    );
    
    // Scroll button into view
    await driver.executeScript("arguments[0].scrollIntoView(true);", minCheckoutButton);
    await driver.sleep(1000);// Added because website detects too fast actions, smart page i guess :)
    
    console.log("[*] Clicking 'Min. to checkout' button...");
    await minCheckoutButton.click();
    await driver.sleep(2000);// Added because website detects too fast actions, you know the drill :)
    
    // Wait for popup with minimum amount message
    console.log("[*] Waiting for popup with minimum amount message...\n");
    let popupMessage = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'away from the 40')]")
      ),
      config.timeouts.explicit
    );
    
    // Verify popup is displayed
    expect(await popupMessage.isDisplayed()).to.be.true;
    
    let popupText = await popupMessage.getText();
    console.log("[OK] Popup displayed: " + popupText);
    
    // Assert - Popup should contain "away from the 40,00 KM order min."
    expect(popupText).to.include("away from the 40");
    expect(popupText).to.include("KM order min");
    
    console.log("[OK] Test successful - Minimum order amount validation working correctly\n");
  });
});