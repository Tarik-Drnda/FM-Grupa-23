// helpers.js - Helper functions for tests

import { By, until } from "selenium-webdriver";
import { config } from "./config.js";

/**
 * Login function that automatically logs in the user
 * @param {WebDriver} driver - Selenium WebDriver instance
 */
export async function loginUser(driver) {
  // Navigate to page
  console.log("[1] Opening Temu page...");
  await driver.get(config.baseUrl);
  await driver.sleep(3000);

  // Close "Accept All" popup if it exists
  console.log("[2] Looking for 'Accept All' popup...");  try {
    let acceptAllButton = await driver.wait(
      until.elementLocated(By.xpath("//span/span[contains(text(), 'Accept All')]")),
      3000
    );
    if (acceptAllButton) {
      await driver.executeScript("arguments[0].click();", acceptAllButton);
      console.log("[OK] Accept All popup closed");
      await driver.sleep(2000);
    }
  } catch (e) {
    console.log("[i] Accept All popup not found");
  }

  // Click on "Sign in" button using aria-label
  console.log("[3] Looking for 'Sign in' button...");
  let signInButton = await driver.wait(
    until.elementLocated(By.xpath("//*[@aria-label='Sign in / Register Orders & Account']")),
    config.timeouts.explicit
  );
  console.log("[OK] Found 'Sign in' button - waiting for it to be visible...");
  await driver.wait(until.elementIsVisible(signInButton), config.timeouts.explicit);
  
  // Scroll element into view and try clicking using JavaScript
  await driver.executeScript("arguments[0].scrollIntoView(true);", signInButton);
  await driver.sleep(1500);
  
  console.log("[>] Clicking 'Sign in' button...");
  try {
    await signInButton.click();
  } catch (e) {
    console.log("[!] Regular click failed, using JavaScript click...");
    await driver.executeScript("arguments[0].click();", signInButton);
  }
  await driver.sleep(3000);

  // Enter email address - waiting for field to become visible
  console.log("[4] Looking for email field...");
  try {
    let emailField = await driver.wait(
      until.elementLocated(By.xpath("//input[@aria-label='Email or phone number']")),
      5000
    );
    console.log("[OK] Found email field - waiting for it to be visible...");
    await driver.wait(until.elementIsVisible(emailField), config.timeouts.explicit);
    await driver.sleep(1000);
    
    // Focus on field
    await driver.executeScript("arguments[0].focus();", emailField);
    await driver.sleep(500);
    
    console.log("[@] Clearing email field...");
    await emailField.clear();
    await driver.sleep(500);
    
    console.log("[@] Entering email: " + config.credentials.email);
    await emailField.sendKeys(config.credentials.email);
    
    // Check if email was entered
    let emailValue = await emailField.getAttribute("value");
    console.log("[OK] Email value in field: " + emailValue);
    await driver.sleep(2000);
  } catch (e) {
    console.log("[X] Error entering email: " + e.message);
    // Try with CSS selector
    console.log("[>>] Trying with CSS selector...");
    let emailField = await driver.wait(
      until.elementLocated(By.css("input[aria-label='Email or phone number']")),
      5000
    );
    await driver.executeScript("arguments[0].focus();", emailField);
    await emailField.clear();
    await emailField.sendKeys(config.credentials.email);
    console.log("[OK] Email entered via CSS selector");
    await driver.sleep(2000);
  }

  // Click on "Continue" button
  console.log("[5] Looking for 'Continue' button...");
  let continueButton = await driver.wait(
    until.elementLocated(By.xpath("//*[@id='submit-button']")),
    config.timeouts.explicit
  );
  console.log("[OK] Found 'Continue' button");
  await driver.wait(until.elementIsVisible(continueButton), config.timeouts.explicit);
  await driver.executeScript("arguments[0].scrollIntoView(true);", continueButton);
  await driver.sleep(1000);
  
  console.log("[>] Clicking 'Continue' button...");
  try {
    await continueButton.click();
  } catch (e) {
    console.log("[!] Regular click failed, using JavaScript click...");
    await driver.executeScript("arguments[0].click();", continueButton);
  }
  
  // Wait and check if CAPTCHA appears
  console.log("[*] Waiting for page to load... checking for CAPTCHA...");
  await driver.sleep(3000);
  
  // Try to detect CAPTCHA
  try {
    let captchaElement = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Verify') or contains(text(), 'CAPTCHA') or contains(text(), 'challenge') or contains(text(), 'puzzle')]")),
      3000
    );
    if (captchaElement) {
      console.log("[!!!] CAPTCHA DETECTED! [!!!]");
      console.log("[#] PLEASE MANUALLY SOLVE CAPTCHA IN BROWSER!");
      console.log("[*] Waiting 20 seconds for manual CAPTCHA solve...");
      await driver.sleep(20000); // 20 seconds for manual solving
      console.log("[OK] Continuing with test...");
    }
  } catch (e) {
    console.log("[i] CAPTCHA not detected, continuing...");
  }
  
  await driver.sleep(2000);

  // Enter password
  console.log("[6] Looking for password field...");
  let passwordField = await driver.wait(
    until.elementLocated(By.xpath("//input[@id='pwdInputInLoginDialog']")),
    config.timeouts.explicit
  );
  console.log("[OK] Found password field - waiting for it to be visible...");
  await driver.wait(until.elementIsVisible(passwordField), config.timeouts.explicit);
  await driver.sleep(1000);
  
  // Focus on field
  await driver.executeScript("arguments[0].focus();", passwordField);
  await driver.sleep(500);
  
  console.log("[#] Clearing password field...");
  await passwordField.clear();
  await driver.sleep(500);
  
  console.log("[#] Entering password...");
  await passwordField.sendKeys(config.credentials.password);
  
  // Check if password was entered
  let passwordValue = await passwordField.getAttribute("value");
  console.log("[OK] Password value in field: " + (passwordValue ? "***hidden***" : "NOT ENTERED!"));
  await driver.sleep(2000);

  // Click on "Sign in" button for login
  console.log("[7] Looking for 'Sign in' button for login...");
  let loginButton = await driver.wait(
    until.elementLocated(By.xpath("//*[@id='submit-button']")),
    config.timeouts.explicit
  );
  console.log("[OK] Found 'Sign in' button");
  await driver.wait(until.elementIsVisible(loginButton), config.timeouts.explicit);
  await driver.executeScript("arguments[0].scrollIntoView(true);", loginButton);
  await driver.sleep(1000);
  
  console.log("[>] Clicking 'Sign in' button for login...");
  try {
    await loginButton.click();
  } catch (e) {
    console.log("[!] Regular click failed, using JavaScript click...");
    await driver.executeScript("arguments[0].click();", loginButton);
  }

  // Wait for user to login
  console.log("[*] Waiting for user login - 10 seconds...");
  await driver.sleep(10000);
  console.log("[OK] User logged in!");
}

/**
 * Add product to cart
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} productName - Product name
 */
export async function addProductToCart(driver, productName) {
  // Find product
  let product = await driver.wait(
    until.elementLocated(By.xpath(`//div[contains(text(), '${productName}')]`)),
    config.timeouts.explicit
  );
  await driver.executeScript("arguments[0].scrollIntoView(true);", product);
  await driver.sleep(1000);
  await product.click();

  // Add to cart
  let addToCartButton = await driver.wait(
    until.elementLocated(By.xpath("//button[contains(., 'Add to cart') or contains(., 'Add')]")),
    config.timeouts.explicit
  );
  await addToCartButton.click();
  await driver.sleep(config.timeouts.sleep);

  // Return to main page
  await driver.navigate().back();
  await driver.sleep(config.timeouts.sleep);
}

/**
 * Add product to cart via direct URL
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} productUrl - Product URL
 */
export async function addProductToCartByUrl(driver, productUrl) {
  console.log("[>>] Opening product...");
  await driver.get(productUrl);
  await driver.sleep(4000);

  // Find and click "Add to cart" button
  console.log("[?] Looking for 'Add to cart' button...");
  try {
    // Try various possible selectors for button
    let addToCartButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(), 'Add to') or contains(text(), 'ADD TO') or contains(., 'cart')]")),
      8000
    );
    console.log("[OK] Found 'Add to cart' button!");
    
    await driver.executeScript("arguments[0].scrollIntoView(true);", addToCartButton);
    await driver.sleep(1500);
    
    console.log("[>] Clicking 'Add to cart'...");
    try {
      await addToCartButton.click();
    } catch (e) {
      console.log("[!] Regular click failed, using JavaScript...");
      await driver.executeScript("arguments[0].click();", addToCartButton);
    }
    
    await driver.sleep(4000);
    console.log("[OK] Product added to cart!");
    
  } catch (e) {
    console.log("[X] ERROR: Button not found! " + e.message);
    // Try to find button in different way
    console.log("[>>] Trying differently...");
    let buttons = await driver.findElements(By.tagName("button"));
    console.log("   Found " + buttons.length + " buttons on page");
    for (let i = 0; i < buttons.length; i++) {
      let text = await buttons[i].getText();
      if (text.toLowerCase().includes("add") || text.toLowerCase().includes("cart")) {
        console.log("   Button " + i + ": " + text);
      }
    }
  }
}

/**
 * Go to checkout page
 * @param {WebDriver} driver - Selenium WebDriver instance
 */
export async function goToCheckout(driver) {
  console.log("[=] Going to checkout...");
  try {
    let checkoutButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Checkout') or contains(., 'Check out') or contains(text(), 'checkout')]")),
      config.timeouts.explicit
    );
    console.log("[OK] Found Checkout button!");
    await driver.executeScript("arguments[0].scrollIntoView(true);", checkoutButton);
    await driver.sleep(1500);
    
    console.log("[>] Clicking Checkout...");
    try {
      await checkoutButton.click();
    } catch (e) {
      console.log("[!] Regular click failed, using JavaScript...");
      await driver.executeScript("arguments[0].click();", checkoutButton);
    }
    await driver.sleep(4000);
    console.log("[OK] Checkout page opened!");
  } catch (e) {
    console.log("[X] ERROR finding checkout button: " + e.message);
    // Try to find button in different way
    console.log("[>>] Searching all buttons on page...");
    let buttons = await driver.findElements(By.tagName("button"));
    console.log("   Found " + buttons.length + " buttons");
    for (let i = 0; i < buttons.length; i++) {
      let text = await buttons[i].getText();
      if (text.toLowerCase().includes("checkout") || text.toLowerCase().includes("cart")) {
        console.log("   Button " + i + ": " + text);
      }
    }
  }
}

/**
 * Fill payment card details
 * @param {WebDriver} driver - Selenium WebDriver instance
 */
export async function fillPaymentCardDetails(driver) {
  // Select Card payment method
  let cardPaymentMethod = await driver.findElement(
    By.xpath("//label[contains(., 'Card') or contains(., 'Credit')]")
  );
  await cardPaymentMethod.click();

  // Enter card number
  let cardNumberField = await driver.findElement(
    By.css("input[placeholder*='Card Number'], input[id*='cardNumber']")
  );
  await cardNumberField.click();
  await cardNumberField.clear();
  await cardNumberField.sendKeys(config.paymentData.cardNumber);

  // Enter expiration date
  let expirationField = await driver.findElement(
    By.css("input[placeholder*='Expiration'], input[placeholder*='MM/YY']")
  );
  await expirationField.click();
  await expirationField.clear();
  await expirationField.sendKeys(config.paymentData.expiryDate);

  // Enter CVV
  let cvvField = await driver.findElement(
    By.css("input[placeholder*='CVV'], input[placeholder*='Security']")
  );
  await cvvField.click();
  await cvvField.clear();
  await cvvField.sendKeys(config.paymentData.cvv);
}

/**
 * Set quantity for product
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {number} quantity - Number of units
 */
export async function setProductQuantity(driver, quantity) {
  console.log(`[#] Setting quantity to ${quantity}...`);
  let quantityDropdown = await driver.wait(
    until.elementLocated(By.css("select[name*='quantity'], select[id*='qty']")),
    config.timeouts.explicit
  );
  await quantityDropdown.click();
  await driver.sleep(config.timeouts.sleep);
  
  let quantityOption = await driver.findElement(
    By.xpath(`//option[@value='${quantity}' or text()='${quantity}']`)
  );
  await quantityOption.click();
  await driver.sleep(config.timeouts.sleep);
  console.log(`[OK] Quantity set to ${quantity}!`);
}

/**
 * Extract numeric price value from text
 * @param {string} priceText - Text containing price
 * @returns {number} - Numeric price value
 */
export function extractPriceValue(priceText) {
  return parseFloat(priceText.replace(/[^\d.]/g, ''));
}

/**
 * Wait for element to become visible
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForElement(driver, locator, timeout = config.timeouts.explicit) {
  let element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}