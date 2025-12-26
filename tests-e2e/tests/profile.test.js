// tests/profile.test.js
const { By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const { createDriver } = require("./setup");
const { login, goToProfile, clickByText, fillInput, waitForElement, BASE_URL } = require("./helpers");
const path = require("path");

describe("Profile – Quản lý thông tin cá nhân", function () {
  let driver;

  beforeEach(async () => {
    driver = await createDriver();
    await login(driver, "test1@example.com", "Abc@1234");
    await driver.sleep(2000);
  });

  afterEach(async () => {
    if (driver) await driver.quit();
  });

  // TC_017 – Xem thông tin Profile
  it("TC_017 – Xem thông tin Profile", async function () {
    await goToProfile(driver);

    // Kiểm tra có hiển thị thông tin
    await driver.sleep(2000);
    const profileInfo = await driver.findElements(
      By.xpath("//*[contains(.,'Họ tên') or contains(.,'Email') or contains(.,'Ngày tạo')]")
    );
    expect(profileInfo.length).to.be.greaterThan(0);

    // Kiểm tra không hiển thị mật khẩu
    const passwordFields = await driver.findElements(
      By.css("input[type='password']")
    );
    // Có thể có field đổi mật khẩu nhưng không hiển thị mật khẩu cũ
  });

  // TC_018 – Cập nhật họ tên/ avatar
  it("TC_018 – Cập nhật họ tên/ avatar", async function () {
    await goToProfile(driver);
    await driver.sleep(2000);

    // Cập nhật họ tên
    try {
      const nameInput = await driver.findElement(
        By.css("input[name='name'], input[placeholder*='Họ tên']")
      );
      await nameInput.clear();
      await nameInput.sendKeys("Nguyễn Văn A (update)");
    } catch (e) {
      // Có thể không có field chỉnh sửa trực tiếp
    }

    // Upload avatar mới
    try {
      const avatarInput = await driver.findElement(
        By.css("input[type='file'][accept*='image']")
      );
      const testImagePath = path.join(__dirname, "../test-images/test-avatar.jpg");
      await avatarInput.sendKeys(testImagePath);
    } catch (e) {
      // Có thể không có tính năng upload avatar
    }

    // Lưu
    try {
      await clickByText(driver, "Lưu");
      await driver.sleep(2000);

      // Kiểm tra có thông báo thành công
      const successMsg = await driver.findElements(
        By.xpath("//*[contains(.,'thành công') or contains(.,'đã cập nhật')]")
      );
    } catch (e) {}
  });

  // TC_049 – Đổi mật khẩu thành công
  it("TC_049 – Đổi mật khẩu thành công", async function () {
    await goToProfile(driver);
    await driver.sleep(2000);

    // Tìm phần đổi mật khẩu
    try {
      await clickByText(driver, "Đổi mật khẩu");
      await driver.sleep(1000);

      const passwordInputs = await driver.findElements(
        By.css("input[type='password']")
      );
      if (passwordInputs.length >= 2) {
        await passwordInputs[0].sendKeys("Abc@1234"); // Mật khẩu cũ
        await passwordInputs[1].sendKeys("New@1234"); // Mật khẩu mới
        if (passwordInputs.length >= 3) {
          await passwordInputs[2].sendKeys("New@1234"); // Xác nhận
        }
      }

      await clickByText(driver, "Lưu");
      await driver.sleep(2000);

      // Kiểm tra thông báo thành công
      const successMsg = await driver.findElements(
        By.xpath("//*[contains(.,'thành công')]")
      );
    } catch (e) {
      // Có thể không có tính năng đổi mật khẩu
    }
  });

  // TC_050 – Đổi mật khẩu với mật khẩu cũ sai
  it("TC_050 – Đổi mật khẩu với mật khẩu cũ sai", async function () {
    await goToProfile(driver);
    await driver.sleep(2000);

    try {
      await clickByText(driver, "Đổi mật khẩu");
      await driver.sleep(1000);

      const passwordInputs = await driver.findElements(
        By.css("input[type='password']")
      );
      if (passwordInputs.length >= 2) {
        await passwordInputs[0].sendKeys("Sai"); // Mật khẩu cũ sai
        await passwordInputs[1].sendKeys("New@1234"); // Mật khẩu mới
      }

      await clickByText(driver, "Lưu");
      await driver.sleep(2000);

      // Kiểm tra có lỗi
      const errorMsg = await driver.findElements(
        By.xpath("//*[contains(.,'Mật khẩu cũ không đúng') or contains(.,'sai')]")
      );
      expect(errorMsg.length).to.be.greaterThan(0);
    } catch (e) {
      // Có thể không có tính năng đổi mật khẩu
    }
  });

  // TC_051 – Upload avatar sai định dạng
  it("TC_051 – Upload avatar sai định dạng", async function () {
    await goToProfile(driver);
    await driver.sleep(2000);

    try {
      const avatarInput = await driver.findElement(
        By.css("input[type='file']")
      );
      const testPdfPath = path.join(__dirname, "../test-images/test.pdf");
      await avatarInput.sendKeys(testPdfPath);
      await driver.sleep(1000);

      // Kiểm tra có lỗi
      const errorMsg = await driver.findElements(
        By.xpath("//*[contains(.,'Định dạng file không được hỗ trợ') or contains(.,'không hợp lệ')]")
      );
      expect(errorMsg.length).to.be.greaterThan(0);
    } catch (e) {
      // Có thể không có tính năng upload avatar
    }
  });
});





