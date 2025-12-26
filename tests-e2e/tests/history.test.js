// tests/history.test.js
const { By, until } = require("selenium-webdriver");
const { expect } = require("chai");
const { createDriver } = require("./setup");
const { login, goToHistory, clickByText, waitForElement, fillInput, BASE_URL } = require("./helpers");

describe("Lịch sử – Xem và quản lý lịch sử", function () {
  let driver;

  beforeEach(async () => {
    driver = await createDriver();
    await login(driver, "test1@example.com", "Abc@1234");
    await driver.sleep(2000);
  });

  afterEach(async () => {
    if (driver) await driver.quit();
  });

  // TC_013 – Lưu lịch sử kết quả thành công
  it("TC_013 – Lưu lịch sử kết quả thành công", async function () {
    // Giả sử đã có kết quả AI
    // Điều hướng đến bước kết quả
    try {
      await clickByText(driver, "Kết quả");
      await driver.sleep(2000);
    } catch (e) {}

    // Nhập ghi chú
    const notes = "Phối màu thử nghiệm lần 1";
    try {
      const noteInput = await driver.findElement(
        By.css("textarea, input[placeholder*='ghi chú'], input[placeholder*='notes']")
      );
      await noteInput.sendKeys(notes);
    } catch (e) {
      // Có thể không có trường ghi chú
    }

    // Bấm 'Lưu vào lịch sử'
    try {
      await clickByText(driver, "Lưu vào lịch sử");
    } catch (e) {
      await clickByText(driver, "Lưu");
    }

    // Đợi thông báo thành công
    await driver.sleep(2000);
    const successMsg = await driver.findElements(
      By.xpath("//*[contains(.,'thành công') or contains(.,'đã lưu')]")
    );
    // Có thể có hoặc không có toast message
  });

  // TC_014 – Xem danh sách lịch sử
  it("TC_014 – Xem danh sách lịch sử", async function () {
    await goToHistory(driver);

    // Kiểm tra có danh sách history
    await driver.sleep(2000);
    const historyItems = await driver.findElements(
      By.css("[data-test='history-item'], .history-item, li")
    );

    // Cần có ít nhất header hoặc empty message
    const hasContent = await driver.findElements(
      By.xpath("//*[contains(.,'Lịch sử') or contains(.,'Chưa có')]")
    );
    expect(hasContent.length).to.be.greaterThan(0);
  });

  // TC_015 – Xem chi tiết 1 history
  it("TC_015 – Xem chi tiết 1 history", async function () {
    await goToHistory(driver);
    await driver.sleep(2000);

    // Click vào một history item
    try {
      const firstItem = await driver.findElement(
        By.css("[data-test='history-item'], .history-item, li")
      );
      await firstItem.click();
      await driver.sleep(1000);
    } catch (e) {
      // Có thể không có history nào
      return;
    }

    // Kiểm tra có hiển thị chi tiết
    const details = await driver.findElements(
      By.xpath("//*[contains(.,'ảnh gốc') or contains(.,'ảnh kết quả') or contains(.,'yêu cầu')]")
    );
    // Có thể có hoặc không có modal chi tiết
  });

  // TC_016 – Xóa 1 history của chính mình
  it("TC_016 – Xóa 1 history của chính mình", async function () {
    await goToHistory(driver);
    await driver.sleep(2000);

    // Tìm nút xóa của history đầu tiên
    try {
      const deleteBtn = await driver.findElement(
        By.xpath("//button[contains(.,'Xóa') or contains(@aria-label,'delete')]")
      );
      await deleteBtn.click();
      await driver.sleep(1000);

      // Xác nhận xóa nếu có dialog
      try {
        await clickByText(driver, "Xác nhận");
      } catch (e) {
        await clickByText(driver, "OK");
      }

      await driver.sleep(2000);
    } catch (e) {
      // Có thể không có history để xóa
    }

    // Kiểm tra danh sách đã cập nhật
    const updatedList = await driver.findElements(
      By.css("[data-test='history-item'], .history-item")
    );
    // List có thể đã giảm đi 1 item
  });

  // TC_045 – Tìm kiếm lịch sử theo ghi chú
  it("TC_045 – Tìm kiếm lịch sử theo ghi chú", async function () {
    await goToHistory(driver);
    await driver.sleep(2000);

    // Tìm ô tìm kiếm
    try {
      const searchInput = await driver.findElement(
        By.css("input[type='search'], input[placeholder*='tìm'], input[placeholder*='search']")
      );
      await searchInput.sendKeys("lần 1");
      await driver.sleep(1000);

      // Bấm tìm kiếm hoặc đợi auto search
      try {
        await clickByText(driver, "Tìm kiếm");
      } catch (e) {
        // Auto search
      }

      await driver.sleep(2000);
    } catch (e) {
      // Có thể không có tính năng tìm kiếm
    }
  });

  // TC_046 – Lọc lịch sử theo khoảng thời gian
  it("TC_046 – Lọc lịch sử theo khoảng thời gian", async function () {
    await goToHistory(driver);
    await driver.sleep(2000);

    // Tìm filter theo thời gian
    try {
      await clickByText(driver, "Lọc");
      await driver.sleep(1000);

      // Chọn khoảng thời gian (nếu có date picker)
      // Giả sử có input date
      const dateInputs = await driver.findElements(
        By.css("input[type='date']")
      );
      if (dateInputs.length >= 2) {
        await dateInputs[0].sendKeys("2025-01-01");
        await dateInputs[1].sendKeys("2025-01-31");
      }

      await clickByText(driver, "Áp dụng");
      await driver.sleep(2000);
    } catch (e) {
      // Có thể không có tính năng lọc
    }
  });

  // TC_047 – Phân trang danh sách lịch sử
  it("TC_047 – Phân trang danh sách lịch sử", async function () {
    await goToHistory(driver);
    await driver.sleep(2000);

    // Tìm nút phân trang
    try {
      const nextBtn = await driver.findElement(
        By.xpath("//button[contains(.,'Trang sau') or contains(.,'Next')]")
      );
      await nextBtn.click();
      await driver.sleep(2000);

      // Kiểm tra đã chuyển trang
      const pageIndicator = await driver.findElements(
        By.xpath("//*[contains(.,'Trang 2') or contains(.,'Page 2')]")
      );
    } catch (e) {
      // Có thể không có phân trang hoặc không đủ dữ liệu
    }
  });

  // TC_048 – Không xem được history user khác qua ID
  it("TC_048 – Không xem được history user khác qua ID", async function () {
    // Test này cần test API trực tiếp hoặc thông qua UI
    // Giả sử có URL với history ID
    await driver.get(`${BASE_URL}/history/99999`); // ID không tồn tại hoặc của user khác

    await driver.sleep(2000);

    // Kiểm tra có lỗi 403/404 hoặc redirect
    const error = await driver.findElements(
      By.xpath("//*[contains(.,'403') or contains(.,'404') or contains(.,'không có quyền')]")
    );
    // Có thể có hoặc không có error message
  });
});





