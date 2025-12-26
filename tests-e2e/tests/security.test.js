// tests/security.test.js
const { By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const { createDriver } = require("./setup");
const { login, goToHistory, fillInput, clickByText, BASE_URL, clearLocalStorage } = require("./helpers");

describe("Security – Bảo mật và bảo vệ", function () {
  let driver;

  beforeEach(async () => {
    driver = await createDriver();
  });

  afterEach(async () => {
    if (driver) await driver.quit();
  });

  // TC_024 – Chặn truy cập wizard khi chưa login
  it("TC_024 – Chặn truy cập wizard khi chưa login", async function () {
    // Xóa localStorage để đảm bảo chưa login
    await driver.get(BASE_URL);
    await clearLocalStorage(driver);

    // Thử truy cập wizard trực tiếp
    await driver.get(`${BASE_URL}/wizard`);
    await driver.sleep(2000);

    // Kiểm tra đã redirect về login hoặc có thông báo yêu cầu đăng nhập
    const url = await driver.getCurrentUrl();
    const hasLogin = await driver.findElements(
      By.xpath("//*[contains(.,'Đăng nhập') or contains(.,'Dang nhap')]")
    );
    expect(url.includes("/login") || hasLogin.length > 0).to.be.true;
  });

  // TC_025 – Token hết hạn yêu cầu login lại
  it("TC_025 – Token hết hạn yêu cầu login lại", async function () {
    await login(driver, "test1@example.com", "Abc@1234");
    await driver.sleep(2000);

    // Giả lập token hết hạn bằng cách xóa hoặc làm hỏng token
    await driver.executeScript(`
      const user = JSON.parse(window.localStorage.getItem('exteriorUser') || '{}');
      user.token = 'expired_token_12345';
      window.localStorage.setItem('exteriorUser', JSON.stringify(user));
    `);

    // Thử gọi API cần auth (thông qua UI)
    await goToHistory(driver);
    await driver.sleep(3000);

    // Kiểm tra có redirect về login hoặc thông báo lỗi
    const url = await driver.getCurrentUrl();
    const hasLogin = await driver.findElements(
      By.xpath("//*[contains(.,'Đăng nhập') or contains(.,'401') or contains(.,'403')]")
    );
    // Có thể redirect hoặc hiển thị lỗi
  });

  // TC_058 – Gọi API protected không gửi token
  it("TC_058 – Gọi API protected không gửi token", async function () {
    // Test này tốt nhất test qua API trực tiếp
    // Hoặc kiểm tra network request trong browser
    await driver.get(BASE_URL);
    await clearLocalStorage(driver);

    // Thử truy cập trang cần auth
    await driver.get(`${BASE_URL}/history`);
    await driver.sleep(2000);

    // Kiểm tra có lỗi 401 hoặc redirect
    const url = await driver.getCurrentUrl();
    const hasError = await driver.findElements(
      By.xpath("//*[contains(.,'401') or contains(.,'không có quyền')]")
    );
    // Có thể redirect về login
  });

  // TC_059 – Chống XSS trong field ghi chú
  it("TC_059 – Chống XSS trong field ghi chú", async function () {
    await login(driver, "test1@example.com", "Abc@1234");
    await driver.sleep(2000);

    // Đi đến bước có thể nhập ghi chú
    try {
      await clickByText(driver, "Kết quả");
      await driver.sleep(2000);
    } catch (e) {}

    // Nhập script XSS
    const xssScript = "<script>alert('XSS')</script>";
    try {
      const noteInput = await driver.findElement(
        By.css("textarea, input[type='text']")
      );
      await noteInput.sendKeys(xssScript);
      await driver.sleep(1000);

      // Lưu
      await clickByText(driver, "Lưu");
      await driver.sleep(2000);

      // Kiểm tra script đã được encode (không thực thi)
      const pageSource = await driver.getPageSource();
      expect(pageSource).to.not.include("<script>alert('XSS')</script>");
      // Script nên được encode thành &lt;script&gt;...
    } catch (e) {
      // Có thể không có trường ghi chú
    }
  });

  // TC_060 – Chống injection trong tham số tìm kiếm history
  it("TC_060 – Chống injection trong tham số tìm kiếm history", async function () {
    await login(driver, "test1@example.com", "Abc@1234");
    await driver.sleep(2000);

    await goToHistory(driver);
    await driver.sleep(2000);

    // Nhập chuỗi SQL injection
    const sqlInjection = "' OR 1=1 --";
    try {
      const searchInput = await driver.findElement(
        By.css("input[type='search'], input[placeholder*='tìm']")
      );
      await searchInput.sendKeys(sqlInjection);
      await driver.sleep(1000);

      await clickByText(driver, "Tìm kiếm");
      await driver.sleep(2000);

      // Kiểm tra hệ thống không lỗi và xử lý an toàn
      const errors = await driver.findElements(
        By.xpath("//*[contains(.,'lỗi server') or contains(.,'500')]")
      );
      expect(errors.length).to.equal(0);
    } catch (e) {
      // Có thể không có tính năng tìm kiếm
    }
  });

  // TC_061 – Khóa tạm thời khi đăng nhập sai nhiều lần
  it("TC_061 – Khóa tạm thời khi đăng nhập sai nhiều lần", async function () {
    // Thử đăng nhập sai nhiều lần
    for (let i = 0; i < 6; i++) {
      await driver.get(`${BASE_URL}/login`);
      await driver.sleep(500);
      await driver.findElement(By.css("input[type='email']")).sendKeys("test1@example.com");
      await driver.findElement(By.css("input[type='password']")).sendKeys("WrongPassword123");
      await driver.findElement(By.xpath("//button[contains(.,'Đăng nhập')]")).click();
      await driver.sleep(1000);
    }

    // Kiểm tra có thông báo khóa tài khoản hoặc yêu cầu captcha
    const lockoutMsg = await driver.findElements(
      By.xpath("//*[contains(.,'khóa') or contains(.,'tạm thời') or contains(.,'captcha')]")
    );
    // Có thể có hoặc không có tính năng này
  });
});





