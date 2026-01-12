# 📋 TÀI LIỆU CHI TIẾT HỆ THỐNG NGOẠI THẤT AI

## 🎯 TỔNG QUAN HỆ THỐNG

**Tên hệ thống:** Hệ thống gợi ý thiết kế ngoại thất căn nhà bằng AI  
**Mục đích:** Giúp người dùng tạo phương án thiết kế ngoại thất dựa trên ảnh mẫu, ảnh nhà thật và yêu cầu cụ thể  
**Đối tượng:** Người dùng (User) và Quản trị viên (Admin)

---

## 🧩 PHÂN RÃ CHỨC NĂNG HỆ THỐNG

Dựa trên yêu cầu và thiết kế mới nhất:

| Nhóm Tính Năng | Chức Năng Cụ Thể | Người Dùng (Khách hàng) | Quản trị Hệ thống (Admin) |
| :--- | :--- | :--- | :--- |
| **1. Quản lý Tài khoản & Hồ sơ** | Đăng ký / Đăng nhập | Tạo tài khoản bằng email, đăng nhập hệ thống | Xem danh sách tài khoản, phân quyền (user/admin) |
| | Quản lý Hồ sơ người dùng | Cập nhật diện tích đất, loại nhà, phong cách yêu thích, ngân sách | Quản trị xem/sửa thông tin hồ sơ để hỗ trợ tư vấn |
| **2. Tư vấn Ngoại thất theo Ngũ Hành** | Upload ảnh mẫu | Tải ảnh nhà mẫu của khách hàng mà họ muốn phong cách và màu sơn của nhà mẫu đó | Kiểm tra dung lượng ảnh, đảm bảo không spam |
| | Phân tích & Gợi ý mệnh | Chọn bản mệnh (Kim, Mộc, Thủy, Hỏa, Thổ). Hệ thống tự động trích xuất bộ từ khóa màu sắc tương sinh. | Cấu hình bộ từ khóa (Keywords) màu sắc cho từng mệnh để tối ưu Prompt. |
| | Upload ảnh mặt tiền | Tải ảnh nhà thô (nhà chưa tô màu hiện tại) của khách hàng | Kiểm tra dung lượng ảnh, đảm bảo không spam |
| | Sinh ảnh từ AI | Nhận 1 ảnh gợi ý từ API AI (Gemini) | Cấu hình API key, giám sát số lần gọi API |
| | Lưu ảnh & quản lý URL | Ảnh gợi ý được lưu, có thể tải về | Quản trị xem lịch sử generate, quản lý Cloudinary |
| **3. Thư viện Kiến trúc Vùng miền** | Khám phá mẫu nhà 3 miền | Xem 10 mẫu nhà đặc trưng (Bắc, Trung, Nam, Âu). Xem mô tả đặc điểm kiến trúc từng vùng. | Cập nhật hình ảnh, mô tả đặc điểm (StyleData) cho 10 mẫu nhà thư viện. |
| **4. Thiết kế phối hợp (Mix & Match)** | Kết hợp nhà thô & Thư viện | Chọn nhà thô + Chọn nhà mẫu vùng miền + Tùy chỉnh màu bộ phận (Tường, Mái, Cột) -> Sinh ảnh. | Quản lý danh mục mã màu thực tế (HEX) gắn liền với các thương hiệu sơn. |
| **8. Quản lý & Giám sát hệ thống** | Quản lý người dùng | - | Xem tổng số user, thống kê lượt sinh ảnh |
| | Quản lý log | - | Giám sát log API, số lần gọi |
| | Báo cáo thống kê | - | Xem thống kê: các phong cách và màu sắc được người dùng quan tâm nhất. |
| | Giám sát tài nguyên | - | Theo dõi dung lượng lưu trữ JSON (rất nhẹ) vs Ảnh (nặng) để tối ưu Cloudinary. |

## 🔀 LUỒNG ĐI HỆ THỐNG (FLOWCHART)

### 1. Luồng Tổng Quát
*   **Vào Web** -> **Đăng nhập**
    *   Nếu chưa có tài khoản -> **Đăng ký** -> Quay lại Đăng nhập.
    *   Nếu đăng nhập thành công -> **Kiểm tra Quyền (Role)**.

### 2. Luồng User (Khách hàng)
*   Sau khi phân quyền là **User**, chuyển đến trang **Khám phá tính năng**.
*   Các chức năng chính:
    *   **Cá nhân**: Xem thông tin, **Lịch sử** sinh ảnh -> **Đăng xuất**.
    *   **Quy trình Tạo ảnh (Wizard Flow)**:
        1.  **Trang Tạo ảnh** -> **Upload ảnh mẫu**.
        2.  **Yêu cầu**: Chọn/nhập yêu cầu thiết kế -> Phân tích.
        3.  **Upload ảnh nhà của bản thân** (Mặt tiền thô).
        4.  **AI Sinh ảnh**: Hệ thống xử lý và trả về kết quả.
        5.  **Lưu/Quản lý ảnh**: Kết quả lưu vào lịch sử -> **Kết thúc**.
    *   **Quy trình Thư viện Mẫu (Mix & Match)**:
        1.  **Trang Thư viện mẫu** -> **Lựa chọn Ảnh trong thư viện**.
        2.  **Click vào vùng cần đổi màu** -> **Chọn Màu** (từ bảng màu/hãng sơn).
        3.  **AI Sinh ảnh**: Kết hợp nhà thô + màu đã chọn.
        4.  **Lưu/Quản lý ảnh** -> **Kết thúc**.

### 3. Luồng Admin (Quản trị viên)
*   Sau khi phân quyền là **Admin**, chuyển đến **Admin Dashboard**.
*   Các chức năng quản trị:
    *   **Quản lý người dùng**: Xem danh sách, sửa, xóa, phân quyền.
    *   **Quản lý log/giao dịch**: Xem lịch sử hoạt động hệ thống.
    *   **Quản lý Thư Viện Mẫu**: Cập nhật ảnh mẫu, StyleData.
    *   **Báo cáo thống kê**: Xem biểu đồ, metrics.
    *   **Quản lý Danh mục Màu & Vật liệu**: CRUD mã màu, hãng sơn.
    *   **Quản lý Prompt của mệnh**: Cấu hình keywords cho ngũ hành.
*   **Chuyển sang giao diện User**: Admin có thể switch view để test tính năng User.
*   **Kết thúc**: Đăng xuất.

---

## 📊 MODEL CHÍNH (DATABASE)

Hệ thống sử dụng **SQL Server** với 3 bảng chính:

### 1. **Users** (Bảng người dùng)

```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- Email (NVARCHAR(191), UNIQUE, NOT NULL)
- PasswordHash (NVARCHAR(255), NOT NULL) - Mật khẩu đã hash bằng bcrypt
- Role (NVARCHAR(20), DEFAULT 'user') - 'user' hoặc 'admin'
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### 2. **Profiles** (Bảng thông tin cá nhân)

```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- UserId (BIGINT, FOREIGN KEY → Users.Id)
- AreaSqm (INT) - Diện tích nhà (m²)
- HouseType (NVARCHAR(100)) - Loại nhà
- Style (NVARCHAR(200)) - Phong cách yêu thích
- Budget (NVARCHAR(50)) - Ngân sách
- UpdatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### 3. **Generations** (Bảng lịch sử sinh ảnh)

```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- UserId (BIGINT, FOREIGN KEY → Users.Id)
- InputDesc (NVARCHAR(MAX)) - Mô tả đầu vào
- InputImageUrl (NVARCHAR(500)) - URL ảnh nhà thô (lưu trên Cloudinary)
- OutputImageUrl (NVARCHAR(500)) - URL ảnh kết quả (lưu trên Cloudinary)
- Style (NVARCHAR(200)) - Phong cách đã chọn
- Palette (NVARCHAR(200)) - Bảng màu
- Seed (BIGINT) - Seed cho random generation (nếu có)
- PromptUsed (NVARCHAR(MAX)) - Prompt đã dùng để sinh ảnh
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### 4. **DesignConfigs** (Bảng cấu hình phối màu - được tạo động)

```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- GenerationId (BIGINT, FOREIGN KEY → Generations.Id, ON DELETE CASCADE) - Liên kết với ảnh gốc
- UserId (BIGINT, FOREIGN KEY → Users.Id) - Chủ sở hữu bản phối màu
- ConfigJson (NVARCHAR(MAX)) - Lưu trữ JSON phối màu (Vd: {"wall": "#F2F4F0", "roof": "#333333"})
- IsFinal (BIT, DEFAULT 0) - Đánh dấu bản phối chốt để xuất báo cáo PDF
- UpdatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### 5. **ColorPalette** (Bảng màu sắc - được tạo động)

```sql
- Id (INT, PRIMARY KEY, IDENTITY)
- ColorName (NVARCHAR(100)) - Tên thương mại của màu (Vd: Trắng Sứ, Xám Ghi)
- HexCode (NVARCHAR(7)) - Mã màu kỹ thuật (Vd: #f0f0f0)
- Brand (NVARCHAR(100)) - Hãng sơn (Vd: Dulux, Jotun)
- Category (NVARCHAR(50)) - Phân loại vật liệu hoặc công năng (Vd: Sơn phủ, Gạch ốp, Mệnh Kim)
```
### 6. **ImageMasks** (Dữ liệu phân vùng AI - được tạo động)
```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- GenerationId (BIGINT, FOREIGN KEY → Generations.Id, ON DELETE CASCADE)
- Label (NVARCHAR(100)) - Tên vùng nhận diện (Vd: wall, roof, window)
- PolygonData (NVARCHAR(MAX)) - Mảng tọa độ JSON (Vd: [[x1,y1], [x2,y2]...])
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### 7. **RegionalLibrary** (Thư viện mẫu nhà vùng miền)

```sql
- Id (INT, PRIMARY KEY, IDENTITY)
- RegionName (NVARCHAR(50)) - Tên vùng miền (Bắc, Trung, Nam, Âu)
- ImageUrl (NVARCHAR(500)) - URL ảnh mẫu nhà (lưu trên Cloudinary)
- StyleData (NVARCHAR(MAX)) - JSON mô tả đặc điểm kiến trúc
- Description (NVARCHAR(MAX)) - Mô tả chi tiết về mẫu nhà
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### 8. **ElementMenh** (Cấu hình màu theo Ngũ Hành - Dự kiến)

```sql
- Id (INT, PRIMARY KEY, IDENTITY)
- MenhName (NVARCHAR(50)) - Tên mệnh (Kim, Mộc, Thủy, Hỏa, Thổ)
- Keywords (NVARCHAR(MAX)) - Các từ khóa màu sắc tương sinh (JSON array)
- PromptTemplate (NVARCHAR(MAX)) - Template prompt cho AI
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

---

## 🛠️ TECH STACK

### **Backend**

- **Framework:** Node.js + Express.js
- **Database Driver:** mssql (SQL Server)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **File Upload:** multer, express-fileupload
- **HTTP Client:** axios
- **Image Processing:** Cloudinary SDK
- **AI Services:**
  - Google Gemini AI (@google/generative-ai, @google/genai)(một cái free dùng cho text, một cái tính phí dùng để sinh ảnh)
  - Stability AI API
  - Replicate API
  - Hugging Face Inference API
- **Logging:** morgan
- **PDF Generation:** pdfkit
- **Environment:** dotenv

### **Database**

- **Hệ quản trị:** Microsoft SQL Server
- **Connection Pool:** mssql ConnectionPool
- **Authentication:** Hỗ trợ cả SQL Authentication và Windows Authentication (NTLM)

### **Frontend**

- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.7
- **Styling:** Tailwind CSS 4.1.13
- **State Management:** React Hooks (useState, useEffect, custom hooks)
- **HTTP Client:** Fetch API (native)

### **Image Storage**

- **Service:** Cloudinary
- **Upload Method:** Stream upload từ buffer
- **Folders:**
  - `exterior_ai/samples` - Ảnh mẫu (bao gồm ảnh thư viện vùng miền)
  - `exterior_ai/houses` - Ảnh nhà thô
  - `exterior_ai/outputs` - Ảnh kết quả

---

## 📁 CẤU TRÚC THƯ MỤC

### **Backend** (`backend/`)

```
backend/
├── src/
│   ├── app.js                    # Cấu hình Express app, routes, middlewares
│   ├── server.js                 # Entry point, khởi động server
│   ├── db.js                     # Quản lý connection pool SQL Server
│   ├── middlewares/              # Các middleware
│   │   ├── auth.js               # JWT authentication middleware
│   │   ├── isAdmin.js            # Kiểm tra quyền admin
│   │   ├── error.js              # Error handler
│   │   ├── respond.js            # Chuẩn hóa response format
│   │   ├── activityLogger.js     # Log hoạt động
│   │   └── asyncHandler.js       # Wrapper xử lý async errors
│   ├── routes/                   # API routes
│   │   ├── wizard.js             # Wizard flow (upload-sample, generate-style, generate-final)
│   │   ├── users.js              # Authentication (register, login, list users)
│   │   ├── histories.js          # Lịch sử sinh ảnh
│   │   ├── admin.js              # Admin APIs (stats, users, generations, library)
│   │   ├── library.js            # [MỚI] Public API lấy thư viện vùng miền
│   │   ├── designs.js            # Lưu/lấy cấu hình phối màu
│   │   └── colors.js             # Lấy danh sách màu
│   └── services/                 # Business logic services
│       ├── cloud.js              # Cloudinary upload service
│       ├── external-ai.js        # AI services (Gemini, Stability, Replicate, HuggingFace)
│       ├── gemini.js             # Gemini AI service (nếu có)
│       ├── aws.js                # [MỚI] AWS services (S3, nếu dùng)
│       ├── designService.js      # Service quản lý DesignConfigs
│       ├── colorService.js       # Service quản lý ColorPalette
│       └── adminSeeder.js        # Tạo tài khoản admin mặc định
├── package.json
└── .env                          # Environment variables
```

### **Frontend** (`frontend/`)

```
frontend/
├── src/
│   ├── main.jsx                  # Entry point React app
│   ├── App.jsx                   # Main app component, routing logic
│   ├── App.css                   # Global styles
│   ├── index.css                 # Tailwind CSS imports
│   ├── api/                      # API client functions
│   │   ├── auth.js               # Authentication APIs
│   │   ├── wizard.js             # Wizard flow APIs
│   │   └── admin.js              # Admin APIs (users, generations, library)
│   ├── components/               # React components
│   │   ├── LoginPage.jsx         # Trang đăng nhập
│   │   ├── RegisterPage.jsx      # Trang đăng ký
│   │   ├── UploadSampleStep.jsx  # Bước 1: Upload ảnh mẫu
│   │   ├── SelectRequirementsStep.jsx # Bước 2: Chọn yêu cầu
│   │   ├── UploadHouseStep.jsx    # Bước 3: Upload ảnh nhà thật
│   │   ├── ResultStep.jsx        # Bước 4: Hiển thị kết quả
│   │   ├── WizardNavigation.jsx  # Navigation bar cho wizard
│   │   ├── HistoryViewer.jsx     # Xem lịch sử sinh ảnh
│   │   ├── ProfilePage.jsx       # Trang cá nhân
│   │   ├── AdminDashboard.jsx    # Dashboard admin
│   │   ├── AdminDashboardPage.jsx # Trang admin dashboard
│   │   ├── AdminLayout.jsx       # Layout cho admin pages
│   │   ├── AdminUserManagement.jsx # Quản lý users (admin)
│   │   ├── AdminLibraryManager.jsx # [MỚI] Quản lý thư viện mẫu nhà vùng miền
│   │   └── ToastList.jsx         # Toast notifications
│   ├── hooks/                    # Custom React hooks
│   │   ├── useWizardFlow.js      # Hook quản lý wizard flow
│   │   ├── useHistoryManager.js  # Hook quản lý lịch sử
│   │   ├── useAdminUsers.js      # Hook quản lý users (admin)
│   │   └── useToasts.js          # Hook quản lý toast notifications
│   └── utils/                    # Utility functions
│       └── wizard.js             # Helper functions cho wizard
├── public/                       # Static assets
├── package.json
└── vite.config.js                # Vite configuration
```

### **Tests** (`tests-e2e/`)

```
tests-e2e/
├── tests/
│   ├── setup.js                  # Test setup
│   ├── helpers.js                # Test helper functions
│   ├── auth.test.js              # Test authentication
│   ├── wizard-ai.test.js         # Test wizard AI flow
│   ├── wizard-navigation.test.js  # Test wizard navigation
│   ├── wizard-requirements.test.js # Test requirements step
│   ├── upload-house.test.js       # Test upload house
│   ├── history.test.js            # Test history
│   ├── profile.test.js            # Test profile
│   ├── admin.test.js              # Test admin functions
│   └── security.test.js           # Test security
└── package.json
```

### **Docs** (`docs/`)

```
docs/
├── db-schema.sql                 # Database schema
├── implementation-summary.md     # Tóm tắt implementation
├── backend_mockapi/              # Mock API documentation
└── HE_THONG_CHI_TIET.md          # File này
```

---

## 🔑 VAI TRÒ CÁC FILE ĐẶC BIỆT

### **Backend**

#### `db.js`

- **Vai trò:** Quản lý connection pool kết nối SQL Server
- **Chức năng:**
  - Tạo singleton connection pool
  - Hỗ trợ cả SQL Authentication và Windows Authentication (NTLM)
  - Export `getPool()` để lấy pool instance
  - Export `testDb()` để kiểm tra kết nối
  - Export `sql` để sử dụng các kiểu dữ liệu SQL

#### `middlewares/auth.js`

- **Vai trò:** Middleware xác thực JWT token
- **Chức năng:**
  - Kiểm tra header `Authorization: Bearer <token>`
  - Verify JWT token với `JWT_SECRET`
  - Lấy thông tin user từ database
  - Gắn `req.user` với thông tin user (id, email, role)
  - Trả 401 nếu token không hợp lệ hoặc user không tồn tại

#### `middlewares/isAdmin.js`

- **Vai trò:** Middleware kiểm tra quyền admin
- **Chức năng:**
  - Kiểm tra `req.user.role === 'admin'`
  - Trả 403 nếu không phải admin
  - Phải đặt sau middleware `auth`

#### `middlewares/respond.js`

- **Vai trò:** Chuẩn hóa format response
- **Chức năng:**
  - Thêm `res.ok(data, message, status)` để trả về success response
  - Thêm `res.err(message, status, extra)` để trả về error response
  - Format: `{ ok: true/false, data: ..., message: ... }`

#### `middlewares/error.js`

- **Vai trò:** Global error handler
- **Chức năng:**
  - Bắt tất cả lỗi không được xử lý
  - Log lỗi ra console
  - Trả về 500 với message "Internal Server Error"

#### `middlewares/asyncHandler.js`

- **Vai trò:** Wrapper xử lý async errors
- **Chức năng:**
  - Bọc async route handlers
  - Tự động catch errors và trả về 500 response
  - Giúp code gọn hơn, không cần try-catch trong mỗi route

#### `services/cloud.js`

- **Vai trò:** Service upload ảnh lên Cloudinary
- **Chức năng:**
  - `uploadBufferToCloudinary(buffer, folder)` - Upload buffer lên Cloudinary
  - Sử dụng stream upload
  - Trả về object chứa `secure_url` và các metadata

#### `services/external-ai.js`

- **Vai trò:** Service tích hợp các AI services để phân tích và tạo ảnh
- **Chức năng:**
  - `analyzeImage()` - Phân tích ảnh bằng Google Gemini
  - `generateImageExternal()` - Tạo ảnh tự động chọn service
  - `generateImageFromThreeServices()` - Tạo ảnh từ nhiều services (Gemini, Stability, Replicate, HuggingFace)
  - `generateImageFromImages()` - Image-to-image generation
  - Hỗ trợ fallback nếu service này fail thì thử service khác

#### `services/adminSeeder.js`

- **Vai trò:** Tự động tạo tài khoản admin mặc định khi server khởi động
- **Chức năng:**
  - Kiểm tra xem đã có admin chưa
  - Nếu chưa có, tạo admin với email/password từ env
  - Nếu có nhưng role không phải admin, cập nhật role
  - Mặc định: `admin@ngoai-that.ai` / `Admin@123456`

### **Frontend**

#### `api/auth.js`

- **Vai trò:** API client cho authentication
- **Chức năng:**
  - `registerUser()` - Đăng ký tài khoản mới
  - `loginUser()` - Đăng nhập, trả về token và user info

#### `api/wizard.js`

- **Vai trò:** API client cho wizard flow
- **Chức năng:**
  - `uploadSample()` - Upload ảnh mẫu
  - `generateStyle()` - Gửi yêu cầu phong cách
  - `generateFinal()` - Upload ảnh nhà thật và sinh ảnh kết quả
  - `getHistories()` - Lấy lịch sử sinh ảnh

#### `api/admin.js` - [MỚI/CẬP NHẬT]

- **Vai trò:** API client cho các chức năng admin
- **Chức năng:**
  - **User Management:**
    - `fetchAdminUsers()` - Lấy danh sách users (có phân trang, filter)
    - `createAdminUser()` - Tạo user mới
    - `updateAdminUser()` - Cập nhật thông tin user
    - `deleteAdminUser()` - Xóa user
  - **Generation Management:**
    - `fetchAdminStats()` - Lấy thống kê tổng quan
    - `fetchAdminGenerations()` - Lấy danh sách lượt sinh ảnh
    - `fetchGenerationsByUser()` - Thống kê lượt sinh theo user
    - `deleteAdminGeneration()` - Xóa lượt sinh ảnh
  - **Library Management (MỚI):**
    - `createLibraryItem(formData, token)` - Thêm mẫu nhà vào thư viện
    - `fetchAdminLibrary(token)` - Lấy danh sách thư viện vùng miền
    - `updateLibraryItem(id, formData, token)` - Cập nhật mẫu nhà
    - `deleteLibraryItem(id, token)` - Xóa mẫu nhà

#### `hooks/useWizardFlow.js`

- **Vai trò:** Custom hook quản lý state và flow của wizard
- **Chức năng:**
  - Quản lý step hiện tại
  - Lưu trữ data qua các bước (tempId, sample, requirements, results)
  - Xử lý navigation giữa các bước

---

## 📡 CHI TIẾT API ROUTES

### **1. File: `wizard.js`** (`/api/*`)

#### **POST `/api/upload-sample`**

- **Mô tả:** Upload ảnh mẫu và phân tích bằng AI
- **Authentication:** Không cần
- **Request:**
  - Method: `POST`
  - Content-Type: `multipart/form-data`
  - Body: `{ sample: File }`
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "tempId": "uuid-string",
      "aiSummary": "JSON string phân tích từ AI",
      "sampleImageUrl": "https://cloudinary.com/...",
      "sampleImageBuffer": Buffer,
      "sampleMimeType": "image/jpeg"
    }
  }
  ```
- **Lỗi:**
  ```json
  {
    "ok": false,
    "message": "Thiếu file sample",
    "detail": "..."
  }
  ```

#### **POST `/api/generate-style`**

- **Mô tả:** Lưu yêu cầu phong cách thiết kế (không gọi AI)
- **Authentication:** Không cần
- **Request:**
  - Method: `POST`
  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "tempId": "uuid-string",
      "requirements": {
        "style": "Modern",
        "colorPalette": "cream white with wooden accents",
        "decorItems": "wooden slats, wall lamps",
        "aiSuggestions": "prioritize natural lighting"
      }
    }
    ```
- **Response:**
  ```json
  {
    "ok": true,
    "message": "Đã lưu yêu cầu thiết kế thành công"
  }
  ```

#### **POST `/api/generate-final`**

- **Mô tả:** Upload ảnh nhà thật và sinh ảnh kết quả bằng AI
- **Authentication:** Cần (JWT Bearer token)
- **Request:**
  - Method: `POST`
  - Content-Type: `multipart/form-data`
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```
    tempId: "uuid-string"
    house: File
    ```
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "inputHouse": "https://cloudinary.com/houses/...",
      "outputImages": {
        "single": "https://cloudinary.com/outputs/...",
        "stability": "https://cloudinary.com/outputs/...",
        "replicate": "https://cloudinary.com/outputs/...",
        "huggingface": "https://cloudinary.com/outputs/..."
      },
      "outputImage": "https://cloudinary.com/outputs/..."
    }
  }
  ```
- **Lỗi:**
  ```json
  {
    "ok": false,
    "message": "Lỗi sinh ảnh bằng External AI Services",
    "detail": "..."
  }
  ```

---

### **2. File: `users.js`** (`/api/users/*`)

#### **GET `/api/users`**

- **Mô tả:** Lấy danh sách users (có phân trang, tìm kiếm, lọc role)
- **Authentication:** Không cần (nhưng nên có để bảo mật)
- **Query Parameters:**
  - `page` (default: 1)
  - `pageSize` (default: 20, max: 100)
  - `search` - Tìm theo email
  - `role` - Lọc theo role ('user', 'admin', 'all')
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "roleSummary": {
        "user": 95,
        "admin": 5
      },
      "items": [
        {
          "Id": 1,
          "Email": "user@example.com",
          "Role": "user",
          "CreatedAt": "2024-01-01T00:00:00Z",
          "GenerationCount": 10,
          "LastGenerationAt": "2024-01-15T00:00:00Z"
        }
      ]
    }
  }
  ```

#### **POST `/api/users/register`**

- **Mô tả:** Đăng ký tài khoản mới
- **Authentication:** Không cần
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "ok": true,
    "message": "Đăng ký thành công!"
  }
  ```

#### **POST `/api/users/login`**

- **Mô tả:** Đăng nhập và nhận JWT token
- **Authentication:** Không cần
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "ok": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user"
    }
  }
  ```

---

### **3. File: `histories.js`** (`/api/histories/*`)

#### **GET `/api/histories/histories`**

- **Mô tả:** Lấy lịch sử sinh ảnh của user hiện tại
- **Authentication:** Cần (JWT Bearer token)
- **Query Parameters:**
  - `page` (default: 1)
  - `pageSize` (default: 12, max: 50)
  - `userId` (optional, nhưng sẽ bị override bởi token)
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "page": 1,
      "pageSize": 12,
      "total": 50,
      "items": [
        {
          "Id": 1,
          "UserId": 1,
          "InputImageUrl": "https://cloudinary.com/houses/...",
          "OutputImageUrl": "https://cloudinary.com/outputs/...",
          "Style": "Modern",
          "Palette": "cream white",
          "PromptUsed": "...",
          "CreatedAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
  }
  ```

---

### **4. File: `admin.js`** (`/api/admin/*`)

**Tất cả routes trong file này đều yêu cầu:**

- Authentication: Cần (JWT Bearer token)
- Authorization: Phải là admin (middleware `isAdmin`)

#### **GET `/api/admin/stats`**

- **Mô tả:** Thống kê tổng quan hệ thống
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "totalUsers": 100,
      "totalGenerations": 500,
      "todayGenerations": 10,
      "topStyles": [
        { "Style": "Modern", "count": 200 },
        { "Style": "Classic", "count": 150 }
      ],
      "topActiveUsers": [
        {
          "UserId": 1,
          "Email": "user@example.com",
          "totalGenerations": 50
        }
      ]
    }
  }
  ```

#### **GET `/api/admin/users`**

- **Mô tả:** Danh sách users (giống `/api/users` nhưng có thêm quyền admin)
- **Query Parameters:** Giống `/api/users`
- **Response:** Giống `/api/users`

#### **POST `/api/admin/users`**

- **Mô tả:** Tạo user mới (admin)
- **Request:**
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user"
  }
  ```
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "user": {
        "Id": 101,
        "Email": "newuser@example.com",
        "Role": "user",
        "CreatedAt": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```

#### **PATCH `/api/admin/users/:id/role`**

- **Mô tả:** Cập nhật role của user
- **Request:**
  ```json
  {
    "role": "admin"
  }
  ```
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "user": {
        "Id": 1,
        "Email": "user@example.com",
        "Role": "admin",
        "CreatedAt": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```

#### **PUT `/api/admin/users/:id`**

- **Mô tả:** Cập nhật email/role/password của user
- **Request:**
  ```json
  {
    "email": "newemail@example.com",
    "role": "admin",
    "password": "newpassword123"
  }
  ```
- **Response:** Giống PATCH

#### **DELETE `/api/admin/users/:id`**

- **Mô tả:** Xóa user
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "deleted": 1
    }
  }
  ```

#### **GET `/api/admin/generations`**

- **Mô tả:** Danh sách lượt sinh ảnh (có filter)
- **Query Parameters:**
  - `page`, `pageSize`
  - `userId` - Lọc theo user
  - `style` - Lọc theo phong cách
  - `from` - Từ ngày (ISO string)
  - `to` - Đến ngày (ISO string)
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "page": 1,
      "pageSize": 20,
      "total": 500,
      "items": [
        {
          "Id": 1,
          "UserId": 1,
          "Email": "user@example.com",
          "InputImageUrl": "...",
          "OutputImageUrl": "...",
          "Style": "Modern",
          "CreatedAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
  }
  ```

#### **GET `/api/admin/generations/:id`**

- **Mô tả:** Chi tiết 1 lượt sinh ảnh
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "item": {
        "Id": 1,
        "UserId": 1,
        "Email": "user@example.com",
        "InputImageUrl": "...",
        "OutputImageUrl": "...",
        "Style": "Modern",
        "PromptUsed": "...",
        "CreatedAt": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```

#### **DELETE `/api/admin/generations/:id`**

- **Mô tả:** Xóa 1 lượt sinh ảnh
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "deleted": 1
    }
  }
  ```

#### **GET `/api/admin/generations/:id/export-pdf`**

- **Mô tả:** Xuất PDF cho 1 lượt sinh ảnh
- **Response:** PDF file (Content-Type: application/pdf)

#### **GET `/api/admin/generations/by-user`**

- **Mô tả:** Tổng hợp lượt sinh ảnh theo user
- **Query Parameters:** `page`, `pageSize`, `search`
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "page": 1,
      "pageSize": 5,
      "total": 20,
      "items": [
        {
          "UserId": 1,
          "Email": "user@example.com",
          "Role": "user",
          "GenerationCount": 50,
          "LastGenerationAt": "2024-01-15T00:00:00Z"
        }
      ]
    }
  }
  ```

---

### **5. File: `designs.js`** (`/api/visualizer/*`)

#### **POST `/api/visualizer/save`**

- **Mô tả:** Lưu cấu hình phối màu cho 1 generation
- **Authentication:** Cần (JWT Bearer token)
- **Request:**
  ```json
  {
    "generationId": 1,
    "configJson": {
      "walls": { "color": "#FFFFFF", "material": "paint" },
      "roof": { "color": "#CCCCCC", "material": "tile" }
    }
  }
  ```
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "message": "Đã lưu bản phối màu thành công"
    }
  }
  ```

#### **GET `/api/visualizer/:generationId`**

- **Mô tả:** Lấy cấu hình phối màu đã lưu
- **Authentication:** Cần (JWT Bearer token)
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "config": {
        "walls": { "color": "#FFFFFF", "material": "paint" },
        "roof": { "color": "#CCCCCC", "material": "tile" }
      }
    }
  }
  ```
- **Nếu chưa có:**
  ```json
  {
    "ok": true,
    "data": {
      "config": null
    }
  }
  ```

---

### **6. File: `colors.js`** (`/api/colors/*`)

#### **GET `/api/colors`**

- **Mô tả:** Lấy danh sách màu sắc
- **Authentication:** Không cần
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "colors": [
        {
          "Id": 1,
          "Brand": "Dulux",
          "ColorName": "Pure White",
          "ColorCode": "#FFFFFF"
        }
      ]
    }
  }
  ```

---

### **7. File: `library.js`** (`/api/library/*`) - [MỚI]

#### **GET `/api/library/regions`**

- **Mô tả:** Lấy danh sách mẫu nhà thư viện vùng miền (Public API)
- **Authentication:** Không cần
- **Response:**
  ```json
  {
    "ok": true,
    "data": [
      {
        "Id": 1,
        "RegionName": "Bắc",
        "ImageUrl": "https://cloudinary.com/samples/...",
        "StyleData": "{\"features\": [\"Mái ngói đỏ\", \"Cửa gỗ\"]}",
        "Description": "Nhà truyền thống miền Bắc với mái ngói đỏ...",
        "CreatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

---

### **8. Admin Library APIs** (`/api/admin/library/*`) - [MỚI]

**Tất cả routes trong phần này đều yêu cầu:**
- Authentication: Cần (JWT Bearer token)
- Authorization: Phải là admin (middleware `isAdmin`)

#### **POST `/api/admin/library`**

- **Mô tả:** Thêm mẫu nhà mới vào thư viện vùng miền
- **Request:**
  - Method: `POST`
  - Content-Type: `multipart/form-data`
  - Body:
    ```
    regionName: "Bắc" | "Trung" | "Nam" | "Âu"
    styleData: "{\"features\": [...]}" (JSON string)
    description: "Mô tả chi tiết..."
    image: File (ảnh mẫu nhà)
    ```
- **Response:**
  ```json
  {
    "ok": true,
    "message": "Đã thêm mẫu nhà vào thư viện thành công",
    "imageUrl": "https://cloudinary.com/samples/..."
  }
  ```

#### **GET `/api/admin/library`**

- **Mô tả:** Lấy danh sách tất cả mẫu nhà (Admin)
- **Response:**
  ```json
  {
    "ok": true,
    "items": [
      {
        "Id": 1,
        "RegionName": "Bắc",
        "ImageUrl": "https://...",
        "StyleData": "...",
        "Description": "...",
        "CreatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

#### **PUT `/api/admin/library/:id`**

- **Mô tả:** Cập nhật thông tin mẫu nhà
- **Request:**
  - Method: `PUT`
  - Content-Type: `multipart/form-data`
  - Body:
    ```
    regionName: "Bắc" (optional)
    styleData: "..." (optional)
    description: "..." (optional)
    image: File (optional - nếu muốn thay ảnh mới)
    ```
- **Response:**
  ```json
  {
    "ok": true,
    "message": "Đã cập nhật mẫu nhà thành công",
    "item": { ... }
  }
  ```

#### **DELETE `/api/admin/library/:id`**

- **Mô tả:** Xóa mẫu nhà khỏi thư viện
- **Response:**
  ```json
  {
    "ok": true,
    "deleted": 1
  }
  ```

---

### **7. Health Check**

#### **GET `/health`**

- **Mô tả:** Kiểm tra trạng thái server và database
- **Response:**
  ```json
  {
    "ok": true,
    "data": {
      "time": "2024-01-01T00:00:00Z",
      "ok": true
    }
  }
  ```

---

## 🔄 CẤU TRÚC REQUEST/RESPONSE CHUẨN

### **Success Response**

```json
{
  "ok": true,
  "data": { ... },
  "message": "Thông báo thành công (optional)"
}
```

### **Error Response**

```json
{
  "ok": false,
  "message": "Mô tả lỗi",
  "detail": "Chi tiết lỗi (optional)"
}
```

### **Pagination Response**

```json
{
  "ok": true,
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "items": [ ... ]
  }
}
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### **JWT Token**

- **Format:** `Bearer <token>`
- **Header:** `Authorization: Bearer <token>`
- **Payload:** `{ userId, email, role }`
- **Expiry:** 1 ngày
- **Secret:** `JWT_SECRET` (từ .env)

### **Roles**

- **`user`:** Người dùng thông thường
- **`admin`:** Quản trị viên

### **Protected Routes**

- Routes yêu cầu authentication: Thêm middleware `auth`
- Routes yêu cầu admin: Thêm middleware `auth` + `isAdmin`

---

## 🌐 ENVIRONMENT VARIABLES

### **Backend (.env)**

```env
# Database
DB_USER=sa
DB_PASS=password
DB_HOST=localhost
DB_NAME=exterior_ai
DB_PORT=1433
DB_AUTH=sql  # hoặc "windows"
DB_DOMAIN=DOMAIN  # Nếu dùng Windows Auth

# JWT
JWT_SECRET=your-secret-key

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Google Gemini AI
GOOGLE_API_KEY=your-gemini-api-key
GOOGLE_API_KEY1=your-gemini-api-key-for-image-generation
GOOGLE_GEMINI_MODEL=gemini-2.5-flash-image

# Stability AI
STABILITY_AI_API_KEY=your-stability-api-key
STABILITY_AI_ENGINE=stable-diffusion-xl-1024-v1-0

# Replicate
REPLICATE_API_TOKEN=your-replicate-token
REPLICATE_MODEL=stability-ai/sdxl:...

# Hugging Face
HUGGINGFACE_API_KEY=your-huggingface-key
HUGGINGFACE_MODEL=stabilityai/stable-diffusion-xl-base-1.0

# Admin Seeder
DEFAULT_ADMIN_EMAIL=admin@ngoai-that.ai
DEFAULT_ADMIN_PASSWORD=Admin@123456

# Server
PORT=8000
```

### **Frontend (.env)**

```env
VITE_API_URL=http://localhost:8000
```

---

## 🚀 QUY TRÌNH WIZARD FLOW

1. **Bước 1: Upload Sample** (`POST /api/upload-sample`)

   - User upload ảnh mẫu
   - AI phân tích ảnh mẫu (Gemini)
   - Trả về `tempId` và phân tích

2. **Bước 2: Select Requirements** (`POST /api/generate-style`)

   - User chọn/nhập yêu cầu thiết kế
   - Lưu vào session với `tempId`

3. **Bước 3: Upload House** (`POST /api/generate-final`)

   - User upload ảnh nhà thật
   - AI sinh ảnh kết quả từ nhiều services
   - Lưu vào database (Generations table)

4. **Bước 4: Result**
   - Hiển thị ảnh kết quả
   - User có thể xem lại trong History

---

## 📝 GHI CHÚ CHO DEV/TESTER/BA MỚI

### **Cho Developer:**

1. **Database Connection:**

   - Hệ thống hỗ trợ cả SQL Auth và Windows Auth
   - Kiểm tra `.env` để cấu hình đúng
   - Chạy `testDb()` để kiểm tra kết nối

2. **AI Services:**

   - Hệ thống tự động fallback giữa các services
   - Ưu tiên: Gemini → Stability AI → Replicate → HuggingFace
   - Cần cấu hình ít nhất 1 API key để hệ thống hoạt động

3. **Session Management:**

   - Wizard sử dụng in-memory Map (`SESS`) để lưu temp data
   - `tempId` là UUID, chỉ tồn tại trong session hiện tại
   - Không persist vào database cho đến khi `generate-final`

4. **File Upload:**

   - Sử dụng `multer` với `memoryStorage`
   - Upload lên Cloudinary bằng stream
   - Không lưu file tạm trên server

5. **Error Handling:**
   - Sử dụng `asyncHandler` để bọc async routes
   - Global error handler ở `error.js`
   - Luôn trả về format `{ ok: true/false, ... }`

### **Cho Tester:**

1. **Test Flow:**

   - Test từng bước wizard theo thứ tự
   - Kiểm tra `tempId` được giữ nguyên qua các bước
   - Test với các loại ảnh khác nhau (JPEG, PNG, ...)

2. **Authentication:**

   - Test với token hợp lệ
   - Test với token hết hạn
   - Test với token không hợp lệ
   - Test với thiếu token

3. **Authorization:**

   - Test admin routes với user thường (phải trả 403)
   - Test admin routes với admin (phải thành công)

4. **Edge Cases:**
   - Upload file quá lớn
   - Upload file không phải ảnh
   - API key không hợp lệ
   - Database connection fail

### **Cho Business Analyst:**

1. **User Flow:**

   - User đăng ký → Đăng nhập → Upload ảnh mẫu → Chọn yêu cầu → Upload ảnh nhà → Nhận kết quả

2. **Admin Flow:**

   - Admin đăng nhập → Xem thống kê → Quản lý users → Xem/quản lý generations

3. **Business Rules:**

   - Mỗi user chỉ xem được lịch sử của mình (trừ admin)
   - Admin có thể xem tất cả và xóa bất kỳ generation nào
   - Ảnh được lưu trên Cloudinary, không lưu trên server

4. **Performance:**
   - AI generation có thể mất 10-60 giây tùy service
   - Hệ thống tự động retry với service khác nếu service đầu fail

---

## 🔍 DEBUGGING TIPS

1. **Check Logs:**

   - Backend logs: Console output (morgan + activityLogger)
   - Frontend logs: Browser console

2. **Database:**

   - Kiểm tra connection: `GET /health`
   - Kiểm tra tables: `SELECT * FROM Users`, `SELECT * FROM Generations`

3. **AI Services:**

   - Kiểm tra API keys trong `.env`
   - Xem logs console để biết service nào đang được dùng
   - Test từng service riêng lẻ nếu cần

4. **File Upload:**
   - Kiểm tra Cloudinary credentials
   - Kiểm tra file size limits
   - Kiểm tra MIME types được chấp nhận

---

## 🎨 PHÂN TÍCH GIAO DIỆN & LUỒNG NGƯỜI DÙNG (FRONTEND)

### **Kiến trúc Frontend**

#### **1. Entry Point & Routing**

- **File:** `frontend/src/App.jsx`
- **Chức năng:** Component chính quản lý toàn bộ routing và state của ứng dụng
- **State Management:**
  - `user` - Thông tin user hiện tại (lưu trong localStorage)
  - `activeView` - View hiện tại: `"wizard"`, `"profile"`, `"history"`, `"admin-area"`
  - `authMode` - Mode đăng nhập: `"login"` hoặc `"register"`
  - `isAdminArea` - Flag cho biết đang ở khu vực admin

#### **2. Authentication Flow**

```
Chưa đăng nhập → LoginPage/RegisterPage
    ↓ (Đăng nhập thành công)
Đã đăng nhập → App Shell (Header + Main + Footer)
    ↓
Chọn view: Wizard / Profile / Admin (nếu là admin)
```

#### **3. Wizard Flow (4 Bước)**

**Bước 1: Upload Sample** (`UploadSampleStep.jsx`)

- **Chức năng:** Upload ảnh mẫu và phân tích bằng AI
- **UI Elements:**
  - Drag & drop zone
  - File input button
  - Preview ảnh đã chọn
  - Loading spinner khi đang upload
  - Alert message từ API
- **State:** `wizardData.sampleImage`, `loadingState.sample`
- **API Call:** `POST /api/upload-sample`
- **Kết quả:** Nhận `tempId` và `aiSummary`

**Bước 2: Select Requirements** (`SelectRequirementsStep.jsx`)

- **Chức năng:** Chọn phong cách và nhập yêu cầu chi tiết
- **UI Elements:**
  - Grid các phong cách (7 options): Hiện đại, Tân cổ điển, Scandinavian, Resort nhiệt đới, Sang trọng đẳng cấp, Tối giản đương đại, Không chọn
  - Textarea cho bảng màu mong muốn
  - Textarea cho vật liệu & trang trí
  - Textarea cho ghi chú AI
  - Hiển thị kế hoạch gợi ý từ AI (nếu có)
- **State:** `wizardData.requirements`, `wizardData.stylePlan`
- **API Call:** `POST /api/generate-style`
- **Validation:** Phải có ít nhất 1 trường được điền

**Bước 3: Upload House** (`UploadHouseStep.jsx`)

- **Chức năng:** Upload ảnh nhà thật và tạo ảnh kết quả
- **UI Elements:**
  - Drag & drop zone cho ảnh nhà
  - Preview ảnh nhà đã chọn
  - Tóm tắt yêu cầu (phong cách, bảng màu, vật liệu, ghi chú)
  - Preview ảnh mẫu tham chiếu (nếu có)
  - Loading spinner khi đang generate
- **State:** `wizardData.houseImage`, `loadingState.house`
- **API Call:** `POST /api/generate-final` (cần JWT token)
- **Kết quả:** Nhận `outputImages` (single, stability, replicate, huggingface)

**Bước 4: Result** (`ResultStep.jsx`)

- **Chức năng:** Hiển thị kết quả và lưu vào lịch sử
- **UI Elements:**
  - Grid 4 cards:
    - Thông tin tổng quan (phong cách, bảng màu, điểm nhấn, ghi chú AI)
    - Ảnh kết quả (ưu tiên: single > outputImage > stability > replicate > huggingface)
    - Ảnh mẫu tham chiếu
    - Ảnh hiện trạng
  - Textarea ghi chú bổ sung
  - Button "Lưu vào lịch sử"
  - Button "Bắt đầu dự án mới"
  - Danh sách lịch sử đã lưu (hiển thị ngay trong step này)
- **State:** `wizardData.result`, `wizardData.outputImage`
- **Actions:** `onSaveHistory()`, `onDeleteHistory()`, `onRestart()`

#### **4. Navigation Structure**

**Header Navigation:**

- **Logo & Brand:** "AI House Designer"
- **User Avatar:** Hiển thị initials + role badge
- **Nav Items:**
  - "Quy trình" (wizard) - Mặc định
  - "Hồ sơ" (profile)
  - "Quản trị" (admin-area) - Chỉ hiển thị nếu `user.role === "admin"`
- **Logout Button**

**Step Progress Bar:**

- Hiển thị 4 bước với icon và label
- Progress bar fill theo `progressPercent`
- Active step được highlight
- Completed steps có checkmark

**Wizard Navigation:**

- `WizardNavigation.jsx` - Component điều hướng giữa các bước
- Buttons: "Quay lại" (back), "Tiếp tục" (next)
- Disable logic dựa trên state của từng step

#### **5. State Management Patterns**

**Custom Hooks:**

**`useWizardFlow.js`**

- Quản lý toàn bộ state và logic của wizard
- **State:**
  - `wizardData` - Data qua các bước (sampleImage, requirements, houseImage, result, tempId)
  - `loadingState` - Loading state cho từng step
  - `apiMessages` - Messages từ API responses
  - `stepIndex` - Index của step hiện tại (0-3)
- **Actions:**
  - `handleSampleSelected()` - Upload và phân tích ảnh mẫu
  - `handleRequirementsChange()` - Update requirements
  - `handleGenerateStyle()` - Gửi yêu cầu phong cách
  - `handleHouseSelected()` - Chọn ảnh nhà
  - `handleGenerateFinal()` - Generate ảnh kết quả
  - `goNext()`, `goBack()`, `resetWizard()`

**`useHistoryManager.js`**

- Quản lý lịch sử sinh ảnh
- **State:** `history`, `visibleHistory`, `personalHistory`
- **Actions:** `saveHistory()`, `updateHistoryStatus()`, `deleteHistoryEntry()`

**`useToasts.js`**

- Quản lý toast notifications
- **State:** `toasts` array
- **Actions:** `pushToast()`, `dismissToast()`

**`useAdminUsers.js`**

- Quản lý users trong admin area
- Fetch, paginate, filter users

#### **6. Component Hierarchy**

```
App.jsx
├── ToastList (Global notifications)
├── Header
│   ├── Logo & Brand
│   ├── User Avatar & Info
│   ├── Navigation (Wizard/Profile/Admin)
│   └── Logout Button
├── Main Content
│   ├── Step Progress Bar (chỉ hiển thị khi activeView === "wizard")
│   └── Active View:
│       ├── Wizard Flow (4 steps)
│       │   ├── UploadSampleStep
│       │   ├── SelectRequirementsStep
│       │   ├── UploadHouseStep
│       │   └── ResultStep
│       ├── HistoryViewer (activeView === "history")
│       ├── ProfilePage (activeView === "profile")
│       └── AdminLayout (isAdminArea === true)
│           ├── AdminDashboard
│           ├── AdminUserManagement
│           ├── AdminLibraryManager  [MỚI] - Quản lý thư viện vùng miền
│           └── AdminDashboardPage
└── Footer
```

**AdminLibraryManager.jsx** - [MỚI]

- **Vai trò:** Component quản lý thư viện mẫu nhà vùng miền
- **Chức năng:**
  - CRUD mẫu nhà: Thêm, sửa, xóa mẫu nhà trong thư viện
  - Upload ảnh mẫu nhà lên Cloudinary
  - Quản lý theo 4 vùng miền: Bắc, Trung, Nam, Âu
  - Nhập StyleData (JSON) mô tả đặc điểm kiến trúc
- **State:**
  - `items` - Danh sách mẫu nhà
  - `loading` - Trạng thái loading
  - `editingItem` - Item đang chỉnh sửa
  - `formData` - Dữ liệu form nhập
- **Actions:**
  - `loadLibrary()` - Tải danh sách thư viện
  - `handleSubmit()` - Xử lý thêm/cập nhật
  - `handleDelete()` - Xử lý xóa
  - `handleEdit()` - Bắt đầu chỉnh sửa
  - `handleFileChange()` - Xử lý chọn file ảnh

#### **7. UI/UX Features**

**Responsive Design:**

- Header collapse khi scroll xuống (từ 160px)
- Quick menu toggle khi header collapsed
- Grid layouts tự động responsive

**Loading States:**

- Spinner cho mỗi step khi đang xử lý
- Disable buttons khi loading
- Progress messages rõ ràng

**Error Handling:**

- Toast notifications cho errors
- Alert messages trong từng step
- Fallback UI khi không có data

**Image Handling:**

- Preview với `URL.createObjectURL()`
- Cleanup với `URL.revokeObjectURL()` khi unmount
- Fallback images nếu URL không hợp lệ
- Data URL encoding để lưu vào history

**Accessibility:**

- ARIA labels cho navigation
- Role attributes cho tables
- Keyboard navigation support
- Screen reader friendly

#### **8. Data Flow**

**Wizard Data Flow:**

```
User selects sample image
  → handleSampleSelected()
  → uploadSample() API call
  → Response: { tempId, aiSummary, sampleImageUrl }
  → Update wizardData.sampleImage
  → goNext() → Step 2

User selects requirements
  → handleRequirementsChange()
  → Update wizardData.requirements
  → handleGenerateStyle()
  → generateStyle() API call
  → Response: { message, plan }
  → Update wizardData.stylePlan
  → goNext() → Step 3

User selects house image
  → handleHouseSelected()
  → Update wizardData.houseImage
  → handleGenerateFinal()
  → generateFinal() API call (với JWT token)
  → Response: { outputImages, outputImage }
  → Update wizardData.result
  → goNext() → Step 4

User saves to history
  → onSaveHistory()
  → saveHistory() từ useHistoryManager
  → Lưu vào localStorage + có thể sync với backend
```

**Authentication Flow:**

```
App loads
  → Check localStorage for "exteriorUser"
  → If exists: setUser(parsed)
  → If not: Show LoginPage

User logs in
  → handleLogin()
  → loginUser() API call
  → Response: { token, user }
  → setUser({ id, email, role, token })
  → Save to localStorage
  → Redirect to wizard

User logs out
  → handleLogout()
  → Clear localStorage
  → setUser(null)
  → Reset wizard
  → Show LoginPage
```

#### **9. Admin Area**

**AdminLayout.jsx:**

- Layout riêng cho admin
- Navigation: Dashboard, Users, Generations
- Exit button để quay về user area

**AdminDashboard.jsx:**

- Thống kê tổng quan (3 stat tiles)
- Bảng thống kê theo tài khoản
- Hoạt động nổi bật (5 mục mới nhất)
- Chi tiết lịch sử theo user đã chọn
- Pagination controls

**AdminUserManagement.jsx:**

- CRUD users
- Filter và search
- Role management

#### **10. Styling & Theming**

**Tailwind CSS:**

- Utility-first CSS framework
- Custom classes trong `index.css`
- Dark theme với gradient backgrounds
- Consistent spacing và typography

**Component Classes:**

- `wizard-card__section` - Container cho mỗi section
- `upload-dropzone` - Drag & drop zone
- `info-card` - Card hiển thị thông tin
- `btn btn-primary` / `btn btn-secondary` - Buttons
- `alert info` - Alert messages
- `admin-*` - Admin-specific classes

#### **11. Performance Optimizations**

**Image Handling:**

- Lazy loading cho images
- Object URL cleanup để tránh memory leaks
- Data URL encoding chỉ khi cần lưu vào history

**State Updates:**

- `useCallback` cho event handlers
- `useMemo` cho computed values
- Conditional rendering để tránh re-render không cần thiết

**API Calls:**

- Error handling với try-catch
- Loading states để UX tốt hơn
- Toast notifications cho feedback

---

## 📚 TÀI LIỆU THAM KHẢO

- [Express.js Documentation](https://expressjs.com/)
- [SQL Server mssql Driver](https://github.com/tediousjs/node-mssql)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Google Gemini AI](https://ai.google.dev/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

**Cập nhật lần cuối:** 2026-01-12  
**Phiên bản:** 1.1.0

### Changelog v1.1.0:
- Thêm bảng `RegionalLibrary` cho thư viện mẫu nhà vùng miền
- Thêm bảng `ElementMenh` (dự kiến) cho cấu hình ngũ hành
- Thêm API routes cho quản lý thư viện (`/api/library/*`, `/api/admin/library/*`)
- Thêm component `AdminLibraryManager.jsx` cho Admin quản lý thư viện
- Thêm các functions trong `api/admin.js` cho Library Management
- Cập nhật cấu trúc thư mục với các file mới

