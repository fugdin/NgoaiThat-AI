# E2E Tests cho NgoaiThat-AI

Bộ test tự động end-to-end dựa trên test cases trong file CSV.

## Cấu trúc Test Files

- `auth.test.js` - Test đăng ký, đăng nhập, đăng xuất (TC_001-TC_004, TC_026-TC_033)
- `upload-house.test.js` - Test upload ảnh nhà và ảnh mẫu (TC_005-TC_008)
- `wizard-requirements.test.js` - Test chọn yêu cầu phối màu (TC_009-TC_010, TC_038-TC_040)
- `wizard-ai.test.js` - Test gọi API AI và xử lý kết quả (TC_011-TC_012, TC_041-TC_044)
- `wizard-navigation.test.js` - Test điều hướng wizard và UI (TC_023-TC_025, TC_034-TC_037, TC_062-TC_065)
- `history.test.js` - Test quản lý lịch sử (TC_013-TC_016, TC_045-TC_048)
- `profile.test.js` - Test quản lý profile (TC_017-TC_018, TC_049-TC_051)
- `admin.test.js` - Test tính năng admin (TC_019-TC_022, TC_054-TC_057)
- `security.test.js` - Test bảo mật (TC_024-TC_025, TC_058-TC_061)

## Yêu cầu

- Node.js >= 14
- Chrome browser
- ChromeDriver (tự động cài qua npm)

## Cài đặt

```bash
cd tests-e2e
npm install
```

## Cấu hình

Mặc định test sẽ chạy với `http://localhost:5173`. Có thể thay đổi bằng biến môi trường:

```bash
BASE_URL=http://localhost:3000 npm test
```

## Chạy Tests

### Chạy tất cả tests:
```bash
npm test
```

### Chạy từng nhóm test:
```bash
npm run test:auth        # Test authentication
npm run test:upload      # Test upload
npm run test:wizard      # Test wizard
npm run test:history     # Test history
npm run test:profile     # Test profile
npm run test:admin       # Test admin
npm run test:security    # Test security
```

### Chạy test cụ thể:
```bash
npx mocha tests/auth.test.js --timeout 60000
```

## Test Images

Một số test cần file ảnh test. Tạo thư mục `test-images` trong `tests-e2e` với các file:

- `house_ok.jpg` - Ảnh nhà hợp lệ (< 10MB)
- `house_big_25mb.jpg` - Ảnh nhà lớn (> 10MB) để test giới hạn
- `style_ok.png` - Ảnh mẫu phong cách hợp lệ
- `document.pdf` - File PDF để test sai định dạng
- `test-avatar.jpg` - Avatar để test upload

Nếu không có file test, một số test sẽ skip với thông báo.

## Lưu ý

1. **Frontend phải đang chạy**: Đảm bảo frontend đang chạy trên port mặc định (5173) hoặc port bạn đã cấu hình.

2. **Backend phải đang chạy**: Một số test cần backend API hoạt động.

3. **Dữ liệu test**: Một số test cần dữ liệu có sẵn trong database (ví dụ: user test1@example.com).

4. **Timeout**: Một số test có thể timeout nếu API chậm. Có thể tăng timeout trong file test nếu cần.

5. **Test Environment**: Một số test có thể cần môi trường test riêng để không ảnh hưởng dữ liệu production.

## Troubleshooting

### ChromeDriver không tìm thấy:
```bash
npm install chromedriver --save-dev
```

### Test fail với timeout:
- Kiểm tra frontend/backend đang chạy
- Tăng timeout trong file test
- Kiểm tra network connection

### Element không tìm thấy:
- Kiểm tra selector trong code có đúng với UI thực tế không
- Thêm wait time nếu element load chậm
- Kiểm tra UI có thay đổi không

## Mapping Test Cases

Tất cả test cases từ CSV đã được map vào các file test tương ứng. Một số test case có thể cần điều chỉnh selector hoặc logic dựa trên UI thực tế của ứng dụng.





