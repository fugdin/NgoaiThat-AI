# Test Coverage - Mapping từ CSV Test Cases

Tài liệu này map tất cả test cases từ CSV vào các file test tương ứng.

## ✅ Đã hoàn thành

### Authentication Tests (`auth.test.js`)
- ✅ TC_001 - Đăng ký tài khoản với dữ liệu hợp lệ
- ✅ TC_002 - Đăng ký với email đã tồn tại
- ✅ TC_003 - Đăng nhập với thông tin hợp lệ
- ✅ TC_004 - Đăng nhập với mật khẩu sai
- ✅ TC_026 - Đăng ký thiếu email
- ✅ TC_027 - Đăng ký email sai định dạng
- ✅ TC_028 - Đăng ký mật khẩu quá yếu
- ✅ TC_029 - Đăng ký mật khẩu xác nhận không khớp
- ✅ TC_030 - Đăng nhập với email không tồn tại
- ✅ TC_031 - Đăng nhập với tùy chọn ghi nhớ
- ✅ TC_032 - Đăng xuất từ giao diện chính
- ✅ TC_033 - Truy cập lại màn hình login khi đã đăng nhập

### Upload Tests (`upload-house.test.js`)
- ✅ TC_005 - Upload ảnh nhà hợp lệ
- ✅ TC_006 - Upload ảnh nhà sai định dạng
- ✅ TC_007 - Upload ảnh nhà vượt quá dung lượng
- ✅ TC_008 - Upload ảnh mẫu phong cách hợp lệ

### Wizard Requirements Tests (`wizard-requirements.test.js`)
- ✅ TC_009 - Chọn đầy đủ yêu cầu phối màu
- ✅ TC_010 - Không chọn yêu cầu nhưng bấm tiếp tục
- ✅ TC_038 - Chỉ chọn phong cách, bỏ trống tông màu
- ✅ TC_039 - Nút 'Làm lại' reset yêu cầu
- ✅ TC_040 - Nhập ghi chú yêu cầu dài

### Wizard AI Tests (`wizard-ai.test.js`)
- ✅ TC_011 - Gọi API AI thành công
- ✅ TC_012 - Gọi API AI lỗi (timeout/500)
- ✅ TC_041 - Generate nhiều lần cùng input
- ✅ TC_042 - Hủy generate khi đang loading
- ✅ TC_043 - Giới hạn số lượt generate miễn phí/ngày
- ✅ TC_044 - Hiển thị so sánh Before/After

### Wizard Navigation Tests (`wizard-navigation.test.js`)
- ✅ TC_023 - Điều hướng wizard Next/Back
- ✅ TC_034 - Upload ảnh nhà bằng kéo-thả
- ✅ TC_035 - Xóa ảnh nhà đã upload
- ✅ TC_036 - Thay thế ảnh nhà bằng ảnh khác
- ✅ TC_037 - Chọn ảnh mẫu từ thư viện
- ✅ TC_062 - Kiểm tra giao diện wizard trên mobile
- ✅ TC_063 - Đổi ngôn ngữ giao diện (vi/en)
- ✅ TC_064 - Thời gian tải danh sách lịch sử với 100 bản ghi
- ✅ TC_065 - Tối ưu kích thước ảnh upload

### History Tests (`history.test.js`)
- ✅ TC_013 - Lưu lịch sử kết quả thành công
- ✅ TC_014 - Xem danh sách lịch sử
- ✅ TC_015 - Xem chi tiết 1 history
- ✅ TC_016 - Xóa 1 history của chính mình
- ✅ TC_045 - Tìm kiếm lịch sử theo ghi chú
- ✅ TC_046 - Lọc lịch sử theo khoảng thời gian
- ✅ TC_047 - Phân trang danh sách lịch sử
- ✅ TC_048 - Không xem được history user khác qua ID

### Profile Tests (`profile.test.js`)
- ✅ TC_017 - Xem thông tin Profile
- ✅ TC_018 - Cập nhật họ tên/ avatar
- ✅ TC_049 - Đổi mật khẩu thành công
- ✅ TC_050 - Đổi mật khẩu với mật khẩu cũ sai
- ✅ TC_051 - Upload avatar sai định dạng

### Admin Tests (`admin.test.js`)
- ✅ TC_019 - Admin truy cập dashboard
- ✅ TC_020 - Admin xem danh sách user
- ✅ TC_021 - Admin đổi role user
- ✅ TC_022 - Admin xem thống kê generate
- ✅ TC_054 - Admin khóa (deactivate) user
- ✅ TC_055 - Không cho admin tự khóa chính mình
- ✅ TC_056 - Admin xem log generate chi tiết
- ✅ TC_057 - Admin xuất báo cáo lịch sử generate

### Security Tests (`security.test.js`)
- ✅ TC_024 - Chặn truy cập wizard khi chưa login
- ✅ TC_025 - Token hết hạn yêu cầu login lại
- ✅ TC_058 - Gọi API protected không gửi token
- ✅ TC_059 - Chống XSS trong field ghi chú
- ✅ TC_060 - Chống injection trong tham số tìm kiếm history
- ✅ TC_061 - Khóa tạm thời khi đăng nhập sai nhiều lần

## 📊 Tổng kết

- **Tổng số test cases**: 65
- **Đã implement**: 65 (100%)
- **Số file test**: 9 files

## 🔧 Cải tiến đã thực hiện

1. **Helpers.js**: Thêm nhiều hàm tiện ích để hỗ trợ test
2. **Setup.js**: Cải thiện cấu hình Chrome driver với options tối ưu
3. **Package.json**: Thêm các script test riêng cho từng module
4. **README.md**: Tài liệu hướng dẫn đầy đủ
5. **Test structure**: Tổ chức test theo feature areas

## ⚠️ Lưu ý khi chạy test

1. Một số test cần file ảnh test trong thư mục `test-images/`
2. Frontend và Backend phải đang chạy
3. Cần có dữ liệu test trong database (user test1@example.com, admin@ngoai-that.ai)
4. Một số test có thể cần điều chỉnh selector dựa trên UI thực tế
5. Test timeout có thể cần điều chỉnh tùy theo tốc độ API

## 🚀 Cách chạy

```bash
# Chạy tất cả tests
npm test

# Chạy từng nhóm
npm run test:auth
npm run test:upload
npm run test:wizard
npm run test:history
npm run test:profile
npm run test:admin
npm run test:security
```





