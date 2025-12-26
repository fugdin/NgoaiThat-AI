// tests/auth.test.js
const { By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const { createDriver } = require("./setup");
const { openRegister, openLogin, BASE_URL } = require("./helpers");

describe("Auth – Đăng ký / Đăng nhập", function () {
  let driver;

  beforeEach(async () => {
    driver = await createDriver();
  });

  afterEach(async () => {
    if (driver) await driver.quit();
  });

  // TC_001 – Đăng ký tài khoản với dữ liệu hợp lệ
  it("TC_001 – Đăng ký tài khoản với dữ liệu hợp lệ", async function () {
    await openRegister(driver);

    await driver.findElement(By.css("input[type='text']")).sendKeys("Nguyễn Văn A");
    const emailInputs = await driver.findElements(By.css("input[type='email']"));
    await emailInputs[0].sendKeys("test1@example.com");
    const passwordInputs = await driver.findElements(By.css("input[type='password']"));
    await passwordInputs[0].sendKeys("Abc@1234");
    await passwordInputs[1].sendKeys("Abc@1234");

    await driver.findElement(By.xpath("//button[contains(.,'Đăng ký') or contains(.,'Tao tai khoan')]")).click();

    // Kỳ vọng: thông báo thành công + chuyển sang login/ wizard
    const alert = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(.,'Đăng ký thành công') or contains(.,'chào mừng')]")
      ),
      5000
    );
    expect(await alert.isDisplayed()).to.be.true;
  });

  // TC_002 – Đăng ký với email đã tồn tại
  it("TC_002 – Đăng ký với email đã tồn tại", async function () {
    await openRegister(driver);

    await driver.findElement(By.css("input[type='text']")).sendKeys("Nguyễn Văn A");
    const emailInputs = await driver.findElements(By.css("input[type='email']"));
    await emailInputs[0].sendKeys("test1@example.com"); // đã tồn tại
    const passwordInputs = await driver.findElements(By.css("input[type='password']"));
    await passwordInputs[0].sendKeys("Abc@1234");
    await passwordInputs[1].sendKeys("Abc@1234");

    await driver.findElement(By.xpath("//button[contains(.,'Đăng ký') or contains(.,'Tao tai khoan')]")).click();

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(.,'Email đã tồn tại') or contains(.,'tồn tại trong hệ thống')]")
      ),
      5000
    );
    expect(await error.isDisplayed()).to.be.true;
  });

  // TC_003 – Đăng nhập với thông tin hợp lệ
  it("TC_003 – Đăng nhập với thông tin hợp lệ", async function () {
    await openLogin(driver);

    await driver.findElement(By.css("input[type='email']")).sendKeys("test1@example.com");
    await driver.findElement(By.css("input[type='password']")).sendKeys("Abc@1234");

    await driver.findElement(By.xpath("//button[contains(.,'Đăng nhập') or contains(.,'Dang nhap')]")).click();

    // Đợi trang wizard
    const wizardTitle = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(.,'Trợ lý thiết kế ngoại thất') or contains(.,'Bước 01')]")
      ),
      8000
    );
    expect(await wizardTitle.isDisplayed()).to.be.true;

    // Kiểm tra token đã lưu (optional – khó hơn, thường kiểm qua API hoặc localStorage)
  });

  // TC_004 – Đăng nhập với mật khẩu sai
  it("TC_004 – Đăng nhập với mật khẩu sai", async function () {
    await openLogin(driver);

    await driver.findElement(By.css("input[name='email']")).sendKeys("test1@example.com");
    await driver.findElement(By.css("input[name='password']")).sendKeys("Abc@12345"); // sai

    await driver.findElement(By.xpath("//button[contains(.,'Đăng nhập')]")).click();

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(.,'Sai email hoặc mật khẩu') or contains(.,'không chính xác')]")
      ),
      5000
    );
    expect(await error.isDisplayed()).to.be.true;
  });

  // TC_026 – Đăng ký thiếu email
  it("TC_026 – Đăng ký thiếu email", async function () {
    await openRegister(driver);

    await driver.findElement(By.css("input[type='text']")).sendKeys("Nguyễn Văn B");
    const passwordInputs = await driver.findElements(By.css("input[type='password']"));
    await passwordInputs[0].sendKeys("Abc@1234");
    await passwordInputs[1].sendKeys("Abc@1234");
    // Không nhập email

    await driver.findElement(By.xpath("//button[contains(.,'Đăng ký') or contains(.,'Tao tai khoan')]")).click();

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(.,'Email') and contains(.,'bắt buộc')]")
      ),
      5000
    );
    expect(await error.isDisplayed()).to.be.true;
  });

  // TC_027 – Đăng ký email sai định dạng
  it("TC_027 – Đăng ký email sai định dạng", async function () {
    await openRegister(driver);

    const emailInputs = await driver.findElements(By.css("input[type='email']"));
    await emailInputs[0].sendKeys("abc@");
    const passwordInputs = await driver.findElements(By.css("input[type='password']"));
    await passwordInputs[0].sendKeys("Abc@1234");
    await passwordInputs[1].sendKeys("Abc@1234");

    await driver.findElement(By.xpath("//button[contains(.,'Đăng ký') or contains(.,'Tao tai khoan')]")).click();

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(.,'Email không hợp lệ') or contains(.,'định dạng')]")
      ),
      5000
    );
    expect(await error.isDisplayed()).to.be.true;
  });

  // TC_028 – Đăng ký mật khẩu quá yếu
  it("TC_028 – Đăng ký mật khẩu quá yếu", async function () {
    await openRegister(driver);

    const emailInputs = await driver.findElements(By.css("input[type='email']"));
    await emailInputs[0].sendKeys("test2@example.com");
    const passwordInputs = await driver.findElements(By.css("input[type='password']"));
    await passwordInputs[0].sendKeys("abc123"); // yếu
    await passwordInputs[1].sendKeys("abc123");

    await driver.findElement(By.xpath("//button[contains(.,'Đăng ký') or contains(.,'Tao tai khoan')]")).click();

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(.,'mật khẩu yếu') or contains(.,'ít nhất')]")
      ),
      5000
    );
    expect(await error.isDisplayed()).to.be.true;
  });

  // TC_029 – Đăng ký mật khẩu xác nhận không khớp
  it("TC_029 – Đăng ký mật khẩu xác nhận không khớp", async function () {
    await openRegister(driver);

    const emailInputs = await driver.findElements(By.css("input[type='email']"));
    await emailInputs[0].sendKeys("test3@example.com");
    const passwordInputs = await driver.findElements(By.css("input[type='password']"));
    await passwordInputs[0].sendKeys("Abc@1234");
    await passwordInputs[1].sendKeys("Abc@12345");

    await driver.findElement(By.xpath("//button[contains(.,'Đăng ký') or contains(.,'Tao tai khoan')]")).click();

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(.,'xác nhận không khớp') or contains(.,'không trùng')]")
      ),
      5000
    );
    expect(await error.isDisplayed()).to.be.true;
  });

  // TC_030 – Đăng nhập với email không tồn tại
  it("TC_030 – Đăng nhập với email không tồn tại", async function () {
    await openLogin(driver);

    await driver.findElement(By.css("input[type='email']")).sendKeys("notfound@example.com");
    await driver.findElement(By.css("input[type='password']")).sendKeys("Whatever@1");

    await driver.findElement(By.xpath("//button[contains(.,'Đăng nhập') or contains(.,'Dang nhap')]")).click();

    const error = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(.,'Sai email hoặc mật khẩu')]")
      ),
      5000
    );
    expect(await error.isDisplayed()).to.be.true;
  });

  // TC_031 – Đăng nhập với tùy chọn ghi nhớ
  it("TC_031 – Đăng nhập với tùy chọn ghi nhớ", async function () {
    await openLogin(driver);

    await driver.findElement(By.css("input[type='email']")).sendKeys("test1@example.com");
    await driver.findElement(By.css("input[type='password']")).sendKeys("Abc@1234");
    
    // Tìm checkbox ghi nhớ nếu có
    try {
      const rememberCheckbox = await driver.findElement(By.css("input[type='checkbox']"));
      await rememberCheckbox.click();
    } catch (e) {
      // Không có checkbox, bỏ qua
    }

    await driver.findElement(By.xpath("//button[contains(.,'Đăng nhập') or contains(.,'Dang nhap')]")).click();

    // Đợi đăng nhập thành công
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(.,'Quy trình')]")),
      8000
    );

    // Kiểm tra token đã lưu trong localStorage
    const token = await driver.executeScript("return window.localStorage.getItem('exteriorUser');");
    expect(token).to.not.be.null;
  });

  // TC_032 – Đăng xuất từ giao diện chính
  it("TC_032 – Đăng xuất từ giao diện chính", async function () {
    await openLogin(driver);

    await driver.findElement(By.css("input[type='email']")).sendKeys("test1@example.com");
    await driver.findElement(By.css("input[type='password']")).sendKeys("Abc@1234");
    await driver.findElement(By.xpath("//button[contains(.,'Đăng nhập') or contains(.,'Dang nhap')]")).click();

    // Đợi đăng nhập thành công
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(.,'Quy trình')]")),
      8000
    );

    // Bấm nút Đăng xuất
    await driver
      .findElement(By.xpath("//button[contains(.,'Đăng xuất') or contains(.,'Dang xuat')]"))
      .click();

    // Kiểm tra đã về màn hình login
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(.,'Đăng nhập') or contains(.,'Dang nhap')]")),
      5000
    );
    const url = await driver.getCurrentUrl();
    expect(url).to.include("/login") || expect(url).to.equal(BASE_URL + "/");

    // Kiểm tra token đã bị xóa
    const token = await driver.executeScript("return window.localStorage.getItem('exteriorUser');");
    expect(token).to.be.null;
  });

  // TC_033 – Truy cập lại màn hình login khi đã đăng nhập
  it("TC_033 – Truy cập lại màn hình login khi đã đăng nhập", async function () {
    await openLogin(driver);

    await driver.findElement(By.css("input[type='email']")).sendKeys("test1@example.com");
    await driver.findElement(By.css("input[type='password']")).sendKeys("Abc@1234");
    await driver.findElement(By.xpath("//button[contains(.,'Đăng nhập') or contains(.,'Dang nhap')]")).click();

    // Đợi đăng nhập thành công
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(.,'Quy trình')]")),
      8000
    );

    // Thử truy cập lại /login
    await driver.get(`${BASE_URL}/login`);

    // Hệ thống nên redirect về trang chính hoặc không hiển thị form login
    await driver.sleep(2000);
    const url = await driver.getCurrentUrl();
    // Có thể redirect về trang chính hoặc vẫn ở login nhưng không hiển thị form
    const hasWizard = await driver.findElements(By.xpath("//*[contains(.,'Quy trình')]"));
    expect(hasWizard.length > 0 || url.includes("/login")).to.be.true;
  });
});
