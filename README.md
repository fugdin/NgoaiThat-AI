# AI Exterior Suggestion System

## 📌 Mục tiêu

Hệ thống gợi ý thiết kế ngoại thất (màu sơn, bố trí) dựa vào ảnh đầu vào và yêu cầu người dùng.  
Gồm các phần chính:

- **Chat AI (text)**: gợi ý mô tả.
- **Sinh ảnh (image)**: render ảnh ngoại thất dựa trên ảnh mẫu và ảnh nhà thật.
- **Tư vấn theo Ngũ Hành**: Phân tích mệnh và gợi ý màu sắc tương sinh.
- **Thư viện Kiến trúc Vùng miền**: Khám phá mẫu nhà đặc trưng (Bắc, Trung, Nam, Âu).
- **Thiết kế phối hợp (Mix & Match)**: Kết hợp nhà thô với thư viện mẫu và tùy chỉnh màu sắc.
- **Profile**: diện tích, phong cách, ngân sách → cá nhân hoá.
- **History**: lưu lại yêu cầu & kết quả.
- **Admin Dashboard**: Quản lý người dùng, thống kê, giám sát hệ thống.

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1 + Vite 7.1.7 + Tailwind CSS 4.1.13
- **Backend**: Node.js + Express.js
- **Database**: Microsoft SQL Server (mssql driver)
- **Authentication**: JWT (jsonwebtoken), bcrypt (hash password)
- **File Upload**: multer, express-fileupload
- **HTTP Client**: axios
- **Image Processing**: Cloudinary SDK
- **AI Services**:
  - Google Gemini AI (@google/generative-ai, @google/genai)
  - Stability AI
  - Replicate
  - Hugging Face Inference API
- **Logging**: morgan
- **PDF Generation**: pdfkit
- **Environment**: dotenv

## 🚀 Cách chạy nhanh

### Backend

```bash
cd backend
npm install
npm run dev
```

- **Env**: Thêm biến `GEMINI_API_KEY` (có thể đặt thêm `GEMINI_MODEL`, mặc định `gemini-2.5-flash-image`) để bật tính năng tô màu ảnh với Gemini.

# **HỆ THỐNG GỢI Ý NGOẠI THẤT CĂN NHÀ**

**Phân tích & Thiết kế hệ thống — Sinh viên năm 4**

---

## **1. Giới thiệu đề tài**

**Tên đề tài:** Hệ thống gợi ý cho ngoại thất căn nhà
**Mục tiêu:**
Xây dựng website ứng dụng trí tuệ nhân tạo giúp người dùng tạo ra phương án thiết kế ngoại thất dựa trên ảnh mẫu, ảnh thật của căn nhà và các yêu cầu cụ thể.

**Đối tượng sử dụng:**

- **Người dùng (User):** khách hàng muốn tham khảo hoặc gợi ý thiết kế ngoại thất.
- **Quản trị viên (Admin):** người quản lý hệ thống, theo dõi log và thống kê hoạt động.

**Phạm vi:**

- **User:** upload ảnh mẫu, chọn hoặc nhập yêu cầu thiết kế, tải ảnh nhà thật để AI xử lý và trả lại bản gợi ý hoàn chỉnh.
- **Admin:** xem thống kê người dùng, giám sát lịch sử hoạt động, quản lý dữ liệu và API.

---

## **2. Mục tiêu cụ thể của hệ thống**

- Cho phép người dùng tải ảnh mẫu căn nhà mong muốn và ảnh thật căn nhà của họ.
- AI rút trích bố cục, phong cách từ ảnh mẫu.
- Kết hợp ảnh thật với phong cách mẫu và yêu cầu thiết kế để tạo ảnh gợi ý hoàn thiện.
- Hỗ trợ tư vấn theo Ngũ Hành với gợi ý màu sắc tương sinh.
- Cung cấp thư viện mẫu nhà vùng miền để tham khảo.
- Cho phép thiết kế phối hợp (Mix & Match) giữa nhà thô và mẫu nhà.
- Lưu trữ và hiển thị lịch sử thao tác của người dùng.
- Hỗ trợ admin quản lý người dùng và thống kê hệ thống.

---

## **3. Phân rã chức năng hệ thống**

Dựa trên yêu cầu và thiết kế, hệ thống được phân rã như sau:

| Nhóm Tính Năng                         | Chức Năng Cụ Thể           | Người Dùng (Khách hàng)                                                                              | Quản trị Hệ thống (Admin)                                                      |
| :------------------------------------- | :------------------------- | :--------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **1. Quản lý Tài khoản & Hồ sơ**       | Đăng ký / Đăng nhập        | Tạo tài khoản bằng email, đăng nhập hệ thống                                                         | Xem danh sách tài khoản, phân quyền (user/admin)                               |
|                                        | Quản lý Hồ sơ người dùng   | Cập nhật diện tích đất, loại nhà, phong cách yêu thích, ngân sách                                    | Quản trị xem/sửa thông tin hồ sơ để hỗ trợ tư vấn                              |
| **2. Tư vấn Ngoại thất theo Ngũ Hành** | Upload ảnh mẫu             | Tải ảnh nhà mẫu của khách hàng mà họ muốn phong cách và màu sơn của nhà mẫu đó                       | Kiểm tra dung lượng ảnh, đảm bảo không spam                                    |
|                                        | Phân tích & Gợi ý mệnh     | Chọn bản mệnh (Kim, Mộc, Thủy, Hỏa, Thổ). Hệ thống tự động trích xuất bộ từ khóa màu sắc tương sinh. | Cấu hình bộ từ khóa (Keywords) màu sắc cho từng mệnh để tối ưu Prompt.         |
|                                        | Upload ảnh mặt tiền        | Tải ảnh nhà thô (nhà chưa tô màu hiện tại) của khách hàng                                            | Kiểm tra dung lượng ảnh, đảm bảo không spam                                    |
|                                        | Sinh ảnh từ AI             | Nhận 1 ảnh gợi ý từ API AI (Gemini)                                                                  | Cấu hình API key, giám sát số lần gọi API                                      |
|                                        | Lưu ảnh & quản lý URL      | Ảnh gợi ý được lưu, có thể tải về                                                                    | Quản trị xem lịch sử generate, quản lý Cloudinary                              |
| **3. Thư viện Kiến trúc Vùng miền**    | Khám phá mẫu nhà 3 miền    | Xem 10 mẫu nhà đặc trưng (Bắc, Trung, Nam, Âu). Xem mô tả đặc điểm kiến trúc từng vùng.              | Cập nhật hình ảnh, mô tả đặc điểm (StyleData) cho 10 mẫu nhà thư viện.         |
| **4. Thiết kế phối hợp (Mix & Match)** | Kết hợp nhà thô & Thư viện | Chọn nhà thô + Chọn nhà mẫu vùng miền + Tùy chỉnh màu bộ phận (Tường, Mái, Cột) -> Sinh ảnh.         | Quản lý danh mục mã màu thực tế (HEX) gắn liền với các thương hiệu sơn.        |
| **5. Quản lý & Giám sát hệ thống**     | Quản lý người dùng         | -                                                                                                    | Xem tổng số user, thống kê lượt sinh ảnh                                       |
|                                        | Quản lý log                | -                                                                                                    | Giám sát log API, số lần gọi                                                   |
|                                        | Báo cáo thống kê           | -                                                                                                    | Xem thống kê: các phong cách và màu sắc được người dùng quan tâm nhất.         |
|                                        | Giám sát tài nguyên        | -                                                                                                    | Theo dõi dung lượng lưu trữ JSON (rất nhẹ) vs Ảnh (nặng) để tối ưu Cloudinary. |

---

## **4. Luồng hệ thống**

### **Luồng Tổng Quát**

- **Vào Web** -> **Đăng nhập**
  - Nếu chưa có tài khoản -> **Đăng ký** -> Quay lại Đăng nhập.
  - Nếu đăng nhập thành công -> **Kiểm tra Quyền (Role)**.

### **Luồng User (Khách hàng)**

- Sau khi phân quyền là **User**, chuyển đến trang **Khám phá tính năng**.
- Các chức năng chính:
  - **Cá nhân**: Xem thông tin, **Lịch sử** sinh ảnh -> **Đăng xuất**.

### **Luồng Admin (Quản trị viên)**

- Sau khi phân quyền là **Admin**, chuyển đến **Admin Dashboard**.
- Các chức năng quản trị:
  - **Quản lý người dùng**: Xem danh sách, sửa, xóa, phân quyền.
  - **Quản lý Prompt của mệnh**: Cấu hình keywords cho ngũ hành.
- **Chuyển sang giao diện User**: Admin có thể switch view để test tính năng User.
- **Kết thúc**: Đăng xuất.

---

## **5. Mô hình tổng quan hệ thống**

```mermaid
graph TD
    A[User] -->|Upload ảnh mẫu + yêu cầu| B[Frontend - React]
    B -->|Gửi API| C[Backend - Express]
    C -->|Kết nối| D[(SQL Server DB)]
    C -->|Gọi| E[(AI API - Gemini / Stability / Replicate)]
    C -->|Upload ảnh| F[(Cloudinary Storage)]
    A2[Admin] -->|Đăng nhập| B
    A2 -->|Xem thống kê| C
```

---

## **6. Kiến trúc công nghệ**

| Thành phần     | Công nghệ sử dụng                                    | Chức năng                                    |
| -------------- | ---------------------------------------------------- | -------------------------------------------- |
| Frontend       | React 19.1.1 + Vite 7.1.7 + Tailwind CSS 4.1.13      | Giao diện người dùng (User, Admin)           |
| Backend        | Node.js + Express.js                                 | API xử lý logic, xác thực JWT, kết nối DB    |
| Database       | Microsoft SQL Server                                 | Lưu trữ người dùng, hồ sơ, lịch sử, cấu hình |
| Storage        | Cloudinary                                           | Lưu ảnh người dùng upload và ảnh sinh từ AI  |
| AI Engine      | Google Gemini, Stability AI, Replicate, Hugging Face | Rút trích bố cục và sinh ảnh gợi ý           |
| Authentication | JWT + bcrypt                                         | Xác thực và mã hóa mật khẩu                  |
| File Handling  | multer, express-fileupload                           | Xử lý upload file                            |
| Logging        | morgan                                               | Ghi log hoạt động                            |
| PDF Export     | pdfkit                                               | Xuất báo cáo PDF                             |

---

## **7. Quy trình sử dụng của người dùng (User Flow)**

1. **Đăng ký/Đăng nhập:** Người dùng tạo tài khoản hoặc đăng nhập hệ thống.
2. **Cập nhật hồ sơ:** Nhập thông tin cá nhân (diện tích, phong cách, ngân sách).
3. **Khám phá thư viện:** Xem mẫu nhà vùng miền để tham khảo.
4. **Upload ảnh mẫu:** Tải lên ảnh của một căn nhà có thiết kế đẹp mà họ mong muốn.
5. **Chọn mệnh ngũ hành:** Chọn bản mệnh để nhận gợi ý màu sắc tương sinh.
6. **AI rút trích bố cục:** Hệ thống phân tích ảnh mẫu, lưu phong cách và bố cục làm cơ sở.
7. **Chọn hoặc nhập yêu cầu:** Người dùng chọn các yêu cầu thiết kế sẵn hoặc nhập yêu cầu riêng qua chat.
8. **AI kết hợp thông tin:** Hệ thống kết hợp bố cục mẫu với yêu cầu và mệnh ngũ hành để định hướng phong cách.
9. **Upload ảnh nhà thật:** Tải ảnh căn nhà của họ (nhà thô hoặc đã xây).
10. **Thiết kế phối hợp (tùy chọn):** Kết hợp với mẫu nhà vùng miền và tùy chỉnh màu sắc.
11. **Sinh ảnh kết quả:** AI sử dụng dữ liệu đã rút trích + ảnh thật + yêu cầu để sinh ảnh gợi ý cuối cùng.
12. **Xem và lưu lịch sử:** Người dùng xem ảnh kết quả, có thể tải xuống hoặc xem lại trong trang cá nhân.

---

## **8. Phân tích chức năng theo vai trò**

### **Người dùng (User)**

- Đăng ký, đăng nhập hệ thống.
- Quản lý hồ sơ cá nhân (diện tích, phong cách, ngân sách).
- Khám phá thư viện mẫu nhà vùng miền.
- Upload ảnh mẫu căn nhà tham khảo.
- Chọn mệnh ngũ hành và nhận gợi ý màu sắc.
- Nhập hoặc chọn yêu cầu thiết kế.
- Upload ảnh nhà thật của mình để AI xử lý.
- Thực hiện thiết kế phối hợp (Mix & Match).
- Nhận ảnh gợi ý thiết kế hoàn thiện.
- Xem lại lịch sử thiết kế trong trang cá nhân.

### **Quản trị viên (Admin)**

- Đăng nhập với quyền admin.
- Quản lý người dùng: xem danh sách, sửa, xóa, phân quyền.
- Quản lý thư viện mẫu nhà vùng miền: thêm, sửa, xóa mẫu nhà.
- Cấu hình keywords màu sắc cho từng mệnh ngũ hành.
- Quản lý danh mục màu sắc và thương hiệu sơn.
- Giám sát thống kê: tổng số user, lượt sinh ảnh, phong cách phổ biến.
- Theo dõi log API và số lần gọi AI.
- Xuất báo cáo PDF cho các lượt sinh ảnh.
- Giám sát tài nguyên lưu trữ (Cloudinary).

> **Tài khoản mặc định:** Hệ thống tự tạo tài khoản admin `admin@ngoai-that.ai` với mật khẩu `Admin@123456` khi backend khởi động. Có thể thay đổi qua biến môi trường `DEFAULT_ADMIN_EMAIL` và `DEFAULT_ADMIN_PASSWORD`.

---

## **9. Mô hình cơ sở dữ liệu**

Hệ thống sử dụng **Microsoft SQL Server** với các bảng chính sau:

### **Bảng Users (Người dùng)**

```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- Email (NVARCHAR(191), UNIQUE, NOT NULL)
- PasswordHash (NVARCHAR(255), NOT NULL)
- Role (NVARCHAR(20), DEFAULT 'user')
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### **Bảng Profiles (Hồ sơ cá nhân)**

```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- UserId (BIGINT, FOREIGN KEY → Users.Id)
- AreaSqm (INT)
- HouseType (NVARCHAR(100))
- Style (NVARCHAR(200))
- Budget (NVARCHAR(50))
- UpdatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### **Bảng Generations (Lịch sử sinh ảnh)**

```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- UserId (BIGINT, FOREIGN KEY → Users.Id)
- InputDesc (NVARCHAR(MAX))
- InputImageUrl (NVARCHAR(500))
- OutputImageUrl (NVARCHAR(500))
- Style (NVARCHAR(200))
- Palette (NVARCHAR(200))
- Seed (BIGINT)
- PromptUsed (NVARCHAR(MAX))
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### **Bảng DesignConfigs (Cấu hình phối màu)**

```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- GenerationId (BIGINT, FOREIGN KEY → Generations.Id, ON DELETE CASCADE)
- UserId (BIGINT, FOREIGN KEY → Users.Id)
- ConfigJson (NVARCHAR(MAX))
- IsFinal (BIT, DEFAULT 0)
- UpdatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### **Bảng ColorPalette (Màu sắc)**

```sql
- Id (INT, PRIMARY KEY, IDENTITY)
- ColorName (NVARCHAR(100))
- HexCode (NVARCHAR(7))
- Brand (NVARCHAR(100))
- Category (NVARCHAR(50))
```

### **Bảng ImageMasks (Dữ liệu phân vùng AI)**

```sql
- Id (BIGINT, PRIMARY KEY, IDENTITY)
- GenerationId (BIGINT, FOREIGN KEY → Generations.Id, ON DELETE CASCADE)
- Label (NVARCHAR(100))
- PolygonData (NVARCHAR(MAX))
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### **Bảng RegionalLibrary (Thư viện mẫu nhà vùng miền)**

```sql
- Id (INT, PRIMARY KEY, IDENTITY)
- RegionName (NVARCHAR(50))
- ImageUrl (NVARCHAR(500))
- StyleData (NVARCHAR(MAX))
- Description (NVARCHAR(MAX))
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

### **Bảng ElementMenh (Cấu hình màu theo Ngũ Hành)**

```sql
- Id (INT, PRIMARY KEY, IDENTITY)
- MenhName (NVARCHAR(50))
- Keywords (NVARCHAR(MAX))
- PromptTemplate (NVARCHAR(MAX))
- CreatedAt (DATETIME2, DEFAULT SYSDATETIME())
```

```mermaid
erDiagram
    USERS {
        bigint Id PK
        nvarchar Email
        nvarchar PasswordHash
        nvarchar Role
        datetime CreatedAt
    }
    PROFILES {
        bigint Id PK
        bigint UserId FK
        int AreaSqm
        nvarchar HouseType
        nvarchar Style
        nvarchar Budget
        datetime UpdatedAt
    }
    GENERATIONS {
        bigint Id PK
        bigint UserId FK
        nvarchar InputDesc
        nvarchar InputImageUrl
        nvarchar OutputImageUrl
        nvarchar Style
        nvarchar Palette
        bigint Seed
        nvarchar PromptUsed
        datetime CreatedAt
    }
    DESIGNCONFIGS {
        bigint Id PK
        bigint GenerationId FK
        bigint UserId FK
        nvarchar ConfigJson
        bit IsFinal
        datetime UpdatedAt
    }
    COLORPALETTE {
        int Id PK
        nvarchar ColorName
        nvarchar HexCode
        nvarchar Brand
        nvarchar Category
    }
    IMAGEMASKS {
        bigint Id PK
        bigint GenerationId FK
        nvarchar Label
        nvarchar PolygonData
        datetime CreatedAt
    }
    REGIONALLIBRARY {
        int Id PK
        nvarchar RegionName
        nvarchar ImageUrl
        nvarchar StyleData
        nvarchar Description
        datetime CreatedAt
    }
    ELEMENTMENH {
        int Id PK
        nvarchar MenhName
        nvarchar Keywords
        nvarchar PromptTemplate
        datetime CreatedAt
    }

    USERS ||--o{ PROFILES : "1 - 1"
    USERS ||--o{ GENERATIONS : "1 - n"
    GENERATIONS ||--o{ DESIGNCONFIGS : "1 - n"
    GENERATIONS ||--o{ IMAGEMASKS : "1 - n"
```

---

## **10. Sơ đồ Use Case**

```mermaid
flowchart TB
    user([User])
    admin([Admin])

    subgraph System
      UC1((Đăng ký tài khoản))
      UC2((Đăng nhập))
      UC3((Cập nhật hồ sơ))
      UC4((Khám phá thư viện vùng miền))
      UC5((Upload ảnh mẫu))
      UC6((Chọn mệnh ngũ hành))
      UC7((Nhập yêu cầu thiết kế))
      UC8((Upload ảnh nhà thật))
      UC9((Thiết kế phối hợp))
      UC10((Xem ảnh gợi ý hoàn thiện))
      UC11((Xem lịch sử thiết kế))
      A1((Quản lý người dùng))
      A2((Quản lý thư viện mẫu nhà))
      A3((Cấu hình ngũ hành))
      A4((Quản lý màu sắc))
      A5((Xem thống kê hệ thống))
      A6((Xuất báo cáo PDF))
    end

    user --> UC1
    user --> UC2
    user --> UC3
    user --> UC4
    user --> UC5
    user --> UC6
    user --> UC7
    user --> UC8
    user --> UC9
    user --> UC10
    user --> UC11

    admin --> UC2
    admin --> A1
    admin --> A2
    admin --> A3
    admin --> A4
    admin --> A5
    admin --> A6
```

---

## **11. Sơ đồ Sequence – Quy trình sinh ảnh gợi ý**

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant AI as AI API (Gemini / Stability / Replicate)
    participant DB as SQL Server
    participant CL as Cloudinary

    U->>FE: Đăng ký/Đăng nhập
    FE->>BE: POST /api/users/register hoặc /api/users/login
    BE->>DB: Lưu/thăm dò user
    U->>FE: Cập nhật hồ sơ
    FE->>BE: PUT /api/users/profile
    BE->>DB: Cập nhật Profiles
    U->>FE: Upload ảnh mẫu
    FE->>BE: POST /api/upload-sample
    BE->>AI: Gửi ảnh mẫu để rút trích bố cục
    AI-->>BE: Trả dữ liệu phong cách / bố cục
    BE->>CL: Upload ảnh mẫu
    CL-->>BE: Trả URL
    U->>FE: Chọn mệnh ngũ hành
    FE->>BE: POST /api/generate-style
    BE->>DB: Lấy keywords từ ElementMenh
    U->>FE: Upload ảnh nhà thật
    FE->>BE: POST /api/generate-final
    BE->>AI: Gửi toàn bộ dữ liệu để sinh ảnh hoàn thiện
    AI-->>BE: Trả ảnh kết quả
    BE->>CL: Upload ảnh kết quả
    CL-->>BE: Trả URL
    BE->>DB: Lưu Generations, ImageMasks
    BE-->>FE: Trả ảnh render cho người dùng
```

---

## **12. Thiết kế giao diện (mô tả)**

| Trang                         | Nội dung chính                                                     |
| ----------------------------- | ------------------------------------------------------------------ |
| **Trang Đăng nhập/Đăng ký**   | Form đăng nhập, chuyển sang đăng ký                                |
| **Trang Hồ sơ cá nhân**       | Cập nhật diện tích, phong cách, ngân sách                          |
| **Trang Thư viện Vùng miền**  | Danh sách mẫu nhà Bắc/Trung/Nam/Âu với mô tả                       |
| **Trang Upload mẫu**          | Form tải ảnh mẫu, preview ảnh, nút "Tiếp tục"                      |
| **Trang Chọn mệnh**           | Chọn ngũ hành, hiển thị gợi ý màu sắc                              |
| **Trang Chọn yêu cầu**        | Danh sách yêu cầu thiết kế sẵn + ô chat nhập thêm yêu cầu          |
| **Trang Upload ảnh nhà thật** | Upload ảnh căn nhà của người dùng, hiển thị kết quả sinh ảnh gợi ý |
| **Trang Phối hợp thiết kế**   | Chọn mẫu nhà vùng miền + tùy chỉnh màu sắc bộ phận                 |
| **Trang Kết quả**             | Hiển thị ảnh gợi ý, tùy chọn tải về hoặc chỉnh sửa tiếp            |
| **Trang Cá nhân**             | Hiển thị lịch sử ảnh đã sinh + xem chi tiết                        |
| **Admin Dashboard**           | Tổng quan thống kê, quản lý người dùng                             |
| **Admin User Management**     | Danh sách users, phân quyền, thống kê                              |
| **Admin Library Manager**     | Quản lý mẫu nhà vùng miền                                          |
| **Admin Color Manager**       | Quản lý danh mục màu sắc và thương hiệu                            |

---

## **13. Cấu trúc thư mục dự án**

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
│   │   ├── library.js            # Public API lấy thư viện vùng miền
│   │   ├── designs.js            # Lưu/lấy cấu hình phối màu
│   │   └── colors.js             # Lấy danh sách màu
│   └── services/                 # Business logic services
│       ├── cloud.js              # Cloudinary upload service
│       ├── external-ai.js        # AI services (Gemini, Stability, Replicate, HuggingFace)
│       ├── gemini.js             # Gemini AI service
│       ├── aws.js                # AWS services (S3, nếu dùng)
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
│   │   ├── AdminLibraryManager.jsx # Quản lý thư viện mẫu nhà vùng miền
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
└── HE_THONG_CHI_TIET.md          # Tài liệu chi tiết hệ thống
```

1. Phân tích yêu cầu → Thiết kế CSDL.
2. Xây dựng backend (Express + SQL Server).
3. Xây dựng frontend (React + Tailwind).
4. Tích hợp AI (phân tích ảnh mẫu, sinh ảnh kết quả).
5. Kiểm thử và triển khai.

---

## **14. Authentication & Authorization**

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

## **15. Environment Variables**

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
HUGGINGFACE_API_TOKEN=your-huggingface-token

# Admin mặc định
DEFAULT_ADMIN_EMAIL=admin@ngoai-that.ai
DEFAULT_ADMIN_PASSWORD=Admin@123456
```

---

## **16. Quy trình phát triển**

1. Phân tích yêu cầu → Thiết kế CSDL.
2. Xây dựng backend (Express + SQL Server).
3. Xây dựng frontend (React + Tailwind).
4. Tích hợp AI (phân tích ảnh mẫu, sinh ảnh kết quả).
5. Kiểm thử và triển khai.

---

## **17. Hướng phát triển**

- Tích hợp AI nhận diện vật liệu để tái tạo chính xác hơn.
- Cho phép gợi ý nhiều phong cách khác nhau từ cùng một ảnh mẫu.
- Hỗ trợ AI so sánh trước/sau trực quan (slider).
- Triển khai phiên bản mobile và thêm gợi ý nội thất đồng bộ.
