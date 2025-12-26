// tests/setup.js
const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function createDriver() {
  const options = new chrome.Options();
  
  // Cấu hình Chrome options
  if (process.env.HEADLESS === "true") {
    options.addArguments("--headless");
  }
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");
  options.addArguments("--window-size=1920,1080");
  
  // Tắt thông báo và popup
  options.addArguments("--disable-notifications");
  options.addArguments("--disable-popup-blocking");
  
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  
  // Set timeouts
  await driver.manage().setTimeouts({ 
    implicit: 5000,
    pageLoad: 30000,
    script: 30000
  });
  
  // Maximize window nếu không headless
  if (process.env.HEADLESS !== "true") {
    await driver.manage().window().maximize();
  }
  
  return driver;
}

module.exports = { createDriver };
