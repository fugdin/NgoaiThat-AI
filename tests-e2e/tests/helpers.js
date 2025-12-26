// tests/helpers.js
const { By, until } = require("selenium-webdriver");

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

async function openLogin(driver) {
  await driver.get(`${BASE_URL}/login`);
}

async function openRegister(driver) {
  await driver.get(`${BASE_URL}/register`);
}

async function openWizard(driver) {
  await driver.get(`${BASE_URL}/`);
}

async function login(driver, email, password) {
  await openLogin(driver);
  await driver.findElement(By.css("input[type='email']")).sendKeys(email);
  await driver.findElement(By.css("input[type='password']")).sendKeys(password);
  await driver.findElement(By.xpath("//button[contains(.,'Đăng nhập') or contains(.,'Dang nhap')]")).click();
  // Đợi đăng nhập thành công
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(.,'Quy trình') or contains(.,'wizard')]")),
    10000
  );
}

async function register(driver, fullName, email, password, confirmPassword) {
  await openRegister(driver);
  await driver.findElement(By.css("input[type='text']")).sendKeys(fullName);
  await driver.findElement(By.css("input[type='email']")).sendKeys(email);
  await driver.findElement(By.css("input[type='password']")).then(async (inputs) => {
    const passwordInputs = await driver.findElements(By.css("input[type='password']"));
    await passwordInputs[0].sendKeys(password);
    await passwordInputs[1].sendKeys(confirmPassword);
  });
  await driver.findElement(By.xpath("//button[contains(.,'Đăng ký') or contains(.,'Tao tai khoan')]")).click();
}

async function logout(driver) {
  try {
    const logoutBtn = await driver.findElement(
      By.xpath("//button[contains(.,'Đăng xuất') or contains(.,'Dang xuat')]")
    );
    await logoutBtn.click();
    await driver.wait(until.elementLocated(By.xpath("//*[contains(.,'Đăng nhập')]")), 5000);
  } catch (e) {
    // Có thể đã logout rồi
  }
}

async function waitForElement(driver, selector, timeout = 10000) {
  return await driver.wait(until.elementLocated(selector), timeout);
}

async function waitForText(driver, text, timeout = 10000) {
  return await driver.wait(
    until.elementLocated(By.xpath(`//*[contains(.,'${text}')]`)),
    timeout
  );
}

async function clickByText(driver, text) {
  const element = await driver.findElement(By.xpath(`//*[contains(.,'${text}')]`));
  await driver.executeScript("arguments[0].scrollIntoView(true);", element);
  await element.click();
}

async function goToWizardStep(driver, stepName) {
  // Điều hướng đến bước cụ thể trong wizard
  const stepMap = {
    sample: "Ảnh mẫu",
    requirements: "Yêu cầu",
    house: "Ảnh hiện trạng",
    result: "Kết quả"
  };
  const stepLabel = stepMap[stepName] || stepName;
  await clickByText(driver, stepLabel);
}

async function uploadFile(driver, fileInputSelector, filePath) {
  const fileInput = await driver.findElement(By.css(fileInputSelector));
  await fileInput.sendKeys(filePath);
}

async function fillInput(driver, selector, value) {
  const input = await driver.findElement(By.css(selector));
  await input.clear();
  await input.sendKeys(value);
}

async function selectOption(driver, optionText) {
  await clickByText(driver, optionText);
}

async function goToProfile(driver) {
  await clickByText(driver, "Hồ sơ");
  await driver.wait(until.elementLocated(By.xpath("//*[contains(.,'Hồ sơ') or contains(.,'Profile')]")), 5000);
}

async function goToHistory(driver) {
  await clickByText(driver, "Lịch sử");
  await driver.wait(until.elementLocated(By.xpath("//*[contains(.,'Lịch sử')]")), 5000);
}

async function goToAdmin(driver) {
  await clickByText(driver, "Quản trị");
  await driver.wait(until.elementLocated(By.xpath("//*[contains(.,'Quản trị') or contains(.,'Admin')]")), 5000);
}

async function getCurrentUrl(driver) {
  return await driver.getCurrentUrl();
}

async function waitForUrl(driver, urlPattern, timeout = 10000) {
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes(urlPattern);
  }, timeout);
}

async function isElementDisplayed(driver, selector) {
  try {
    const element = await driver.findElement(selector);
    return await element.isDisplayed();
  } catch (e) {
    return false;
  }
}

async function getElementText(driver, selector) {
  try {
    const element = await driver.findElement(selector);
    return await element.getText();
  } catch (e) {
    return "";
  }
}

async function waitForAlert(driver, text, timeout = 5000) {
  return await driver.wait(
    until.elementLocated(
      By.xpath(`//*[contains(@class,'alert') and contains(.,'${text}')]`)
    ),
    timeout
  );
}

async function clearLocalStorage(driver) {
  await driver.executeScript("window.localStorage.clear();");
}

module.exports = {
  BASE_URL,
  openLogin,
  openRegister,
  openWizard,
  login,
  register,
  logout,
  waitForElement,
  waitForText,
  clickByText,
  goToWizardStep,
  uploadFile,
  fillInput,
  selectOption,
  goToProfile,
  goToHistory,
  goToAdmin,
  getCurrentUrl,
  waitForUrl,
  isElementDisplayed,
  getElementText,
  waitForAlert,
  clearLocalStorage,
};
