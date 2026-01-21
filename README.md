# HRM System – Human Resource Management Web App

Hệ thống **HRM (Human Resource Management)** dùng để quản lý nhân sự trong tổ chức, bao gồm **Admin – Manager – Employee**.  
Dự án được xây dựng theo mô hình **Frontend – Backend tách biệt**, áp dụng các cơ chế **xác thực – phân quyền – bảo mật hiện đại**.

---

## Bài toán

Xây dựng một trang web HRM cho phép:
- Quản lý tài khoản người dùng
- Phân quyền theo vai trò (Admin / Manager / Employee)
- Gán nhân viên cho quản lý
- Đảm bảo bảo mật với JWT + Refresh Token
- Trải nghiệm đăng nhập liền mạch (không cần đăng nhập lại khi AccessToken hết hạn)

---

## Frontend (FE)

### Công nghệ
- **Vue 3** (Composition API)
- **TypeScript**
- **Bootstrap** (UI Toolkit)
- **Axios** (Call API)
- **Pinia** + **Pinia Persist** (Quản lý trạng thái & lưu local)
- **VeeValidate + Zod** (Validate form)

---

### Cơ chế gọi API (Axios Interceptors)

#### Request Interceptor
- Tự động gắn `AccessToken` vào **Authorization Header** cho mọi request (nếu token tồn tại)

#### Response Interceptor
- **401 – AccessToken hết hạn**
  - Tự động gọi API refresh token
  - Lấy AccessToken mới
  - Thực hiện lại request cũ mà không cần đăng nhập lại
- **403 – RefreshToken hết hạn**
  - Buộc người dùng đăng nhập lại

---

### Các chức năng chính

#### Đăng nhập
- Khi đăng nhập thành công:
  - Lưu thông tin cơ bản của User
  - Lưu AccessToken bằng **Pinia + Persist (Local Storage)**
- Điều hướng về trang Home tương ứng theo **Role**

#### Đăng xuất
- Xóa toàn bộ dữ liệu lưu trong local
- Điều hướng về màn hình Login

---

### Admin Role
- **Tạo mới tài khoản**
  - Tạo User mới với: `username`, `email`, `password`, `role`
- **Thăng cấp**
  - Employee → Manager
  - Nếu Employee đang có Manager → bị gỡ khỏi quản lý
- **Hạ cấp**
  - Manager → Employee
  - Các Employee do Manager này quản lý → trở thành `OrphanEmployee`
- **Gán Employee cho Manager**
  - Hiển thị danh sách `OrphanEmployee`
  - Gán Manager cho Employee được chọn
- **Xóa người dùng**
  - Xóa Employee → xóa trực tiếp
  - Xóa Manager → Employee dưới quyền trở thành `OrphanEmployee`

---

## Backend (BE)

### Công nghệ
- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **Zod** (Validate request)

---

### Xác thực & Bảo mật

#### Bcrypt
- Mã hóa mật khẩu thành chuỗi Hash
- Khi đăng nhập:
  - Hash mật khẩu đầu vào
  - So sánh với Hash trong DB

#### JWT (JSON Web Token)
- Token dạng JSON được ký số
- Gửi kèm mọi request (trừ login)

##### Access Token
- Thời gian sống ngắn
- Lưu ở FE (Pinia)

##### Refresh Token
- Thời gian sống dài hơn
- Lưu thông qua **HTTP-only Cookie**

##### Đăng xuất
- Xóa RefreshToken khỏi hệ thống

---

### Middleware
- `verifyToken` – Xác thực người dùng
- `checkRole` – Phân quyền
- `validate` – Validate request bằng Zod

---

## API Endpoints

### Auth
**POST**
- `/login`
- `/logout`
- `/refreshToken`

---

### Admin

**GET**
- `/staffs/getAll` – Lấy toàn bộ nhân sự
- `/staffs/overview` – Thống kê tổng quan
- `/staffs/managers` – Danh sách Manager
- `/staffs/employees` – Danh sách Employee
- `/staffs/orphan_employees` – Employee chưa có Manager

**POST**
- `/register` – Tạo user mới

**PUT**
- `/staffs/update_role` – Cập nhật role
- `/staffs/assign_employees_to_manager` – Gán Employee cho Manager

**DELETE**
- `/staffs/delete_user` – Xóa user

---

### Manager
**GET**
- `/manager/me` – Lấy thông tin Manager hiện tại

---

### Employee
**GET**
- `/employee/me` – Lấy thông tin Employee hiện tại

---

## Database (MongoDB)

### Collections

#### User
- `id`
- `username`
- `email`
- `password`
- `role`
- `manager?` (chỉ tồn tại nếu là Employee)

#### Role
- `id`
- `name`

---

### 🔗 Quan hệ dữ liệu
- Employee **có thể có** Manager
- **Không lưu dữ liệu 2 chiều**
- Sử dụng:
  - `virtual`
  - `populate`
- Manager có thể truy vấn danh sách Employee mình quản lý mà không cần lưu trực tiếp

---

## Kiến trúc & Best Practices
- Tách rõ:
  - Router
  - Controller
  - Model
- Validate ở Backend & Frontend
- Không xử lý logic phức tạp trong Router
- Bảo mật token & phân quyền rõ ràng

---
