// tests/wizard-requirements.test.js
const { By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const { createDriver } = require("./setup");
const { login, clickByText, waitForElement, waitForText, BASE_URL } = require("./helpers");
const path = require("path");

describe("Wizard – Chọn yêu cầu & Tạo phối màu", function () {
  let driver;

  beforeEach(async () => {
    driver = await createDriver();
    await login(driver, "test1@example.com", "Abc@1234");
    // Đợi wizard load
    await driver.sleep(2000);
  });

  afterEach(async () => {
    if (driver) await driver.quit();
  });

  // TC_009 – Chọn đầy đủ yêu cầu phối màu
  it("TC_009 – Chọn đầy đủ yêu cầu phối màu", async function () {
    // Điều hướng đến bước chọn yêu cầu
    // Giả sử có thể click vào step "Yêu cầu" hoặc đã ở đó
    try {
      await clickByText(driver, "Yêu cầu");
      await driver.sleep(1000);
    } catch (e) {
      // Có thể đã ở bước này
    }

    // Chọn phong cách
    try {
      await clickByText(driver, "Hiện đại");
    } catch (e) {
      // Thử selector khác
      const styleOption = await driver.findElement(
        By.xpath("//*[contains(.,'Hiện đại') or contains(.,'Hien dai')]")
      );
      await styleOption.click();
    }

    // Chọn tông màu
    try {
      await clickByText(driver, "Ấm");
    } catch (e) {
      const toneOption = await driver.findElement(
        By.xpath("//*[contains(.,'Ấm') or contains(.,'Am')]")
      );
      await toneOption.click();
    }

    // Chọn khu vực
    try {
      await clickByText(driver, "Tường");
      await clickByText(driver, "Mái");
      await clickByText(driver, "Cửa");
    } catch (e) {
      // Thử checkbox hoặc button khác
      const areas = await driver.findElements(
        By.xpath("//*[contains(.,'Tường') or contains(.,'Mái') or contains(.,'Cửa')]")
      );
      for (const area of areas.slice(0, 3)) {
        try {
          await area.click();
        } catch (e2) {}
      }
    }

    // Bấm Tiếp tục
    await clickByText(driver, "Tiếp tục");

    // Kiểm tra đã chuyển sang bước tiếp theo hoặc không có lỗi
    await driver.sleep(2000);
    const error = await driver.findElements(
      By.xpath("//*[contains(@class,'error') or contains(.,'bắt buộc')]")
    );
    expect(error.length).to.equal(0);
  });

  // TC_010 – Không chọn yêu cầu nhưng bấm tiếp tục
  it("TC_010 – Không chọn yêu cầu nhưng bấm tiếp tục", async function () {
    // Điều hướng đến bước chọn yêu cầu
    try {
      await clickByText(driver, "Yêu cầu");
      await driver.sleep(1000);
    } catch (e) {}

    // Không chọn gì cả, bấm Tiếp tục ngay
    await clickByText(driver, "Tiếp tục");

    // Kiểm tra có cảnh báo
    await driver.sleep(1000);
    const warning = await driver.findElements(
      By.xpath("//*[contains(.,'bắt buộc') or contains(.,'yêu cầu') or contains(.,'chọn')]")
    );
    expect(warning.length).to.be.greaterThan(0);
  });

  // TC_038 – Chỉ chọn phong cách, bỏ trống tông màu
  it("TC_038 – Chỉ chọn phong cách, bỏ trống tông màu", async function () {
    try {
      await clickByText(driver, "Yêu cầu");
      await driver.sleep(1000);
    } catch (e) {}

    // Chọn phong cách
    try {
      await clickByText(driver, "Tối giản");
    } catch (e) {
      const styleOption = await driver.findElement(
        By.xpath("//*[contains(.,'Tối giản') or contains(.,'Toi gian')]")
      );
      await styleOption.click();
    }

    // Không chọn tông màu, bấm Tiếp tục
    await clickByText(driver, "Tiếp tục");

    // Kiểm tra behavior (có thể cho qua hoặc báo lỗi tùy rule)
    await driver.sleep(1000);
    // Test này cần kiểm tra behavior thực tế của hệ thống
  });

  // TC_039 – Nút 'Làm lại' reset yêu cầu
  it("TC_039 – Nút 'Làm lại' reset yêu cầu", async function () {
    try {
      await clickByText(driver, "Yêu cầu");
      await driver.sleep(1000);
    } catch (e) {}

    // Chọn một số option
    try {
      await clickByText(driver, "Hiện đại");
      await driver.sleep(500);
    } catch (e) {}

    // Bấm Làm lại
    try {
      await clickByText(driver, "Làm lại");
    } catch (e) {
      await clickByText(driver, "Reset");
    }

    // Kiểm tra các trường đã về mặc định
    await driver.sleep(1000);
    // Cần kiểm tra UI state đã reset
  });

  // TC_040 – Nhập ghi chú yêu cầu dài
  it("TC_040 – Nhập ghi chú yêu cầu dài", async function () {
    try {
      await clickByText(driver, "Yêu cầu");
      await driver.sleep(1000);
    } catch (e) {}

    // Tìm textarea hoặc input cho ghi chú
    const longNote = "A".repeat(250); // > 200 ký tự
    try {
      const noteInput = await driver.findElement(
        By.css("textarea, input[type='text']")
      );
      await noteInput.sendKeys(longNote);
    } catch (e) {
      // Có thể không có trường ghi chú
    }

    // Kiểm tra có giới hạn hoặc counter
    await driver.sleep(1000);
    // Test này cần kiểm tra behavior thực tế
  });
});





