# Implementation Summary – Exterior AI Wizard

## Frontend Wizard (React + Vite)
- Thay đổi `frontend/src/App.jsx` để dựng wizard 4 bước: UploadSample → SelectRequirements → UploadHouse → Result.
- Tạo các component mới trong `frontend/src/components/` (`UploadSampleStep`, `SelectRequirementsStep`, `UploadHouseStep`, `ResultStep`) xử lý luồng nhập ảnh, yêu cầu và hiển thị gợi ý.
- Cập nhật `frontend/src/index.css` nhằm hỗ trợ layout toàn màn hình cho wizard.
- Build kiểm tra: `npm run build`.

## Router, Context & Hiệu ứng
- Tích hợp `react-router-dom` với `ProtectedRoute`, layout chung và route con cho từng bước wizard (`frontend/src/App.jsx`).
- Khởi tạo `AuthContext` & `WizardContext` để quản lý đăng nhập, dữ liệu wizard, lịch sử và gợi ý (`frontend/src/context/`).
- WizardContext hiện gọi trực tiếp các API mock của backend (`/api/upload-sample`, `/api/generate-style`, `/api/generate-final`) và quản lý trạng thái `loading`, `error`, `session`.
- Backend xử lý ảnh bằng `sharp` và Stability AI SDXL: trích xuất màu chủ đạo từ ảnh mẫu, gọi API `image-to-image` (qua biến môi trường `STABILITY_API_KEY`) để render lại ảnh nhà theo phong cách mẫu; khi API không khả dụng sẽ tự động fallback sang chế độ pha màu (`backend/src/routes/wizard.js`).
- Thêm `AnimatedOutlet` + CSS fade-in để chuyển cảnh mượt giữa các màn hình (`frontend/src/components/AnimatedOutlet.jsx`, `frontend/src/index.css`).
- Bổ sung `WizardNavigation.jsx` làm thanh điều hướng chung “Quay lại / Tiếp tục / Hoàn tất” cho từng bước wizard.

## Xác thực & Phân quyền
- Thêm luồng đăng nhập/đăng ký (`LoginPage.jsx`, `RegisterPage.jsx`) với lưu trữ vào `localStorage`.
- Mở rộng `App.jsx` để quản lý người dùng (admin/designer), điều hướng giữa `wizard`, `history`, `admin`, và xử lý đăng xuất.
- Tạo `HistoryViewer.jsx` để designer xem lại lịch sử dự án; admin xem toàn bộ và cập nhật trạng thái qua `AdminDashboard.jsx`.

## Trang quản trị
- Tạo `AdminDashboard.jsx` hiển thị thống kê, lọc trạng thái và cập nhật tiến độ từng dự án.
- Wizard lưu lịch sử với trạng thái ban đầu là `pending`, admin có thể đổi trạng thái hoặc xóa lịch sử demo.

## Các bước kiểm thử
- Chạy `npm run build` sau mỗi đợt chỉnh sửa lớn để đảm bảo ứng dụng build thành công.
