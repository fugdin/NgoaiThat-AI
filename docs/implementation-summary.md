# Implementation Summary – Exterior AI Wizard

## Frontend Wizard (React + Vite)
- Thay đổi `frontend/src/App.jsx` để dựng wizard 4 bước: UploadSample → SelectRequirements → UploadHouse → Result.
- Tạo các component mới trong `frontend/src/components/` (`UploadSampleStep`, `SelectRequirementsStep`, `UploadHouseStep`, `ResultStep`) xử lý luồng nhập ảnh, yêu cầu và hiển thị gợi ý.
- Cập nhật `frontend/src/index.css` nhằm hỗ trợ layout toàn màn hình cho wizard.
- Build kiểm tra: `npm run build`.

## Xác thực & Phân quyền
- Thêm luồng đăng nhập/đăng ký (`LoginPage.jsx`, `RegisterPage.jsx`) với lưu trữ vào `localStorage`.
- Mở rộng `App.jsx` để quản lý người dùng (admin/designer), điều hướng giữa `wizard`, `history`, `admin`, và xử lý đăng xuất.
- Tạo `HistoryViewer.jsx` để designer xem lại lịch sử dự án; admin xem toàn bộ và cập nhật trạng thái qua `AdminDashboard.jsx`.

## Trang quản trị
- Tạo `AdminDashboard.jsx` hiển thị thống kê, lọc trạng thái và cập nhật tiến độ từng dự án.
- Wizard lưu lịch sử với trạng thái ban đầu là `pending`, admin có thể đổi trạng thái hoặc xóa lịch sử demo.

## Các bước kiểm thử
- Chạy `npm run build` sau mỗi đợt chỉnh sửa lớn để đảm bảo ứng dụng build thành công.
