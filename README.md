# 🎬 MOVIE BOOKING SYSTEM

## 📌 Thông tin đề tài

* **Tên đề tài:** Xây dựng ứng dụng web đặt vé xem phim trực tuyến
* **Sinh viên thực hiện:** Trần Quốc Toàn
* **Mã sinh viên:** 2022601265

---

## 🎯 Giới thiệu

Hệ thống web cho phép người dùng đặt vé xem phim trực tuyến, mô phỏng các hệ thống thực tế như CGV, Lotte Cinema.

Ứng dụng cung cấp đầy đủ các chức năng:

* Đăng ký / đăng nhập người dùng
* Xem danh sách phim
* Xem lịch chiếu
* Chọn ghế trực quan
* Đặt vé và thanh toán online
* Xem lịch sử đặt vé
* Quản lý hệ thống (Admin)

---

## 🏗 Kiến trúc hệ thống

Dự án được xây dựng theo mô hình **Frontend - Backend tách biệt**:

```bash
movie-booking-system/
├── backend/   # Spring Boot API
├── frontend/  # ReactJS UI
```

---

## 🛠 Công nghệ sử dụng

### 🔙 Backend

* Spring Boot
* Spring Security (JWT)
* JPA / Hibernate
* MySQL
* Swagger (OpenAPI)
* RESTful API

### 🔜 Frontend

* ReactJS (Vite)
* Axios
* Tailwind CSS / CSS

---

## 🚀 Chức năng chính

### 👤 Người dùng

* Đăng ký / đăng nhập
* Xem phim, tìm kiếm phim
* Chatbot gợi ý phim thông minh dựa trên từ khoá + AI Gemini
* Xem lịch chiếu
* Chọn ghế
* Đặt vé
* Thanh toán online (VNPAY)
* Xem lịch sử đặt vé

### 🛠 Admin

* Quản lý phim
* Quản lý suất chiếu
* Quản lý rạp / phòng chiếu
* Quản lý người dùng
* Theo dõi doanh thu

---

## ⚙️ Cài đặt & chạy hệ thống

### 1️⃣ Backend

```bash
cd backend
mvn spring-boot:run
```

➡️ Server chạy tại:

```
http://localhost:8080
```

➡️ Swagger API Docs:

```
http://localhost:8080/swagger-ui/index.html
```

---

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

➡️ Web chạy tại:

```
http://localhost:5173
```

---

## 🔗 Kết nối API

Frontend gọi API từ Backend thông qua:

```
http://localhost:8080/api
```

---

## 🗄 Cơ sở dữ liệu

* Sử dụng MySQL
* Các bảng chính:

  * User, Role
  * Movie, Genre, Actor, Director
  * Cinema, Theater, Seat
  * Showtime
  * Booking, Ticket, Payment

---

## 🔐 Bảo mật

* Xác thực bằng JWT
* Mã hóa mật khẩu với BCrypt
* Phân quyền:

  * ADMIN
  * USER

---

## 📈 Hướng phát triển

* Tối ưu UI/UX
* Tích hợp thêm nhiều cổng thanh toán
* Triển khai Docker & Cloud
* Xây dựng mobile app

---

## 👨‍💻 Tác giả

**Trần Quốc Toàn**
MSSV: 2022601265

---

## 📄 Giấy phép

Dự án phục vụ mục đích học tập và nghiên cứu.
