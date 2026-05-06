# 🎬 Movie Booking API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:8080`  
> **Content-Type:** `application/json`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Standard Response Format](#standard-response-format)
3. [Pagination](#pagination)
4. [Error Handling](#error-handling)
5. [Enums & Constants](#enums--constants)
6. [Movies API](#movies-api)
7. [Showtimes API](#showtimes-api)
8. [Cinemas API](#cinemas-api)
9. [Theaters API](#theaters-api)
10. [Seats API](#seats-api)
11. [Bookings API](#bookings-api)
12. [Users API](#users-api)
13. [Actors API](#actors-api)
14. [Directors API](#directors-api)
15. [Genres API](#genres-api)

---

## Overview

Movie Booking là hệ thống đặt vé xem phim trực tuyến. API được chia thành 2 nhóm:

| Nhóm | Prefix | Mô tả |
|------|--------|-------|
| **Client** | `/api/...` hoặc `/api/client/...` | Dành cho người dùng cuối |
| **Admin** | `/api/admin/...` | Dành cho quản trị viên |

> ⚠️ **Lưu ý:** Hiện tại tất cả các endpoint đều không yêu cầu xác thực (authentication).  
> Swagger UI có thể truy cập tại: `http://localhost:8080/swagger-ui.html`

---

## Standard Response Format

Tất cả API đều trả về cấu trúc `ApiResponse<T>` thống nhất:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {},
  "paging": null
}
```

### Response với phân trang

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "content": [],
    "totalElements": 100,
    "totalPages": 10,
    "size": 10,
    "number": 0,
    "first": true,
    "last": false
  }
}
```

### Response lỗi

```json
{
  "success": false,
  "message": "Mô tả lỗi"
}
```

### Response lỗi validation

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "data": {
    "title": "Title không được để trống",
    "duration": "Duration phải là số dương"
  }
}
```

---

## Pagination

Các endpoint có phân trang hỗ trợ các query parameters sau:

| Parameter | Type | Default | Mô tả |
|-----------|------|---------|-------|
| `page` | integer | `0` | Số trang (bắt đầu từ 0) |
| `size` | integer | `10` | Số phần tử mỗi trang |
| `sort` | string | varies | Sắp xếp, ví dụ: `sort=createdAt,desc` |

**Ví dụ:**
```
GET /api/movies?page=0&size=10&sort=createdAt,desc
```

---

## Error Handling

| HTTP Status | Mô tả |
|-------------|-------|
| `200 OK` | Thành công |
| `201 Created` | Tạo mới thành công |
| `400 Bad Request` | Dữ liệu không hợp lệ / Bad request |
| `404 Not Found` | Không tìm thấy tài nguyên |
| `500 Internal Server Error` | Lỗi hệ thống |

---

## Enums & Constants

### Role (Vai trò người dùng)

| Value | Mô tả |
|-------|-------|
| `ADMIN` | Quản trị viên |
| `STAFF` | Nhân viên |
| `CUSTOMER` | Khách hàng |

### TheaterType (Loại phòng chiếu)

| Value | Mô tả |
|-------|-------|
| `STANDARD` | Phòng chiếu thường |
| `IMAX` | Phòng chiếu IMAX |
| `VIP` | Phòng chiếu VIP |
| `FOUR_DX` | Phòng chiếu 4DX |

### AgeRating (Phân loại độ tuổi phim)

| Value | Mô tả |
|-------|-------|
| `G` | Mọi lứa tuổi |
| `PG` | Cần có sự hướng dẫn của phụ huynh |
| `PG-13` | Không phù hợp cho trẻ dưới 13 tuổi |
| `R` | Hạn chế, dưới 17 tuổi cần có phụ huynh |
| `NC-17` | Chỉ dành cho người từ 18 tuổi trở lên |

### SeatStatus (Trạng thái ghế)

| Value | Mô tả |
|-------|-------|
| `AVAILABLE` | Ghế trống, có thể đặt |
| `RESERVED` | Ghế đang được giữ (đặt chờ xác nhận) |
| `OCCUPIED` | Ghế đã được đặt (đã xác nhận) |

### SeatType (Loại ghế)

| Value | Mô tả |
|-------|-------|
| `STANDARD` | Ghế thường |
| `VIP` | Ghế VIP |
| `COUPLE` | Ghế đôi |

---

## Movies API

### Schema: MovieResponseDTO

```json
{
  "movieId": 1,
  "title": "Avengers: Endgame",
  "originalTitle": "Avengers: Endgame",
  "description": "Mô tả phim...",
  "duration": 181,
  "posterUrl": "https://example.com/poster.jpg",
  "trailerUrl": "https://youtube.com/watch?v=xxx",
  "releaseDate": "2024-01-15",
  "endDate": "2024-02-15",
  "rating": 8.5,
  "ageRating": "PG-13",
  "isNowShowing": true,
  "isComingSoon": false,
  "isFeatured": true,
  "isDeleted": false,
  "genre": {
    "genreId": 1,
    "name": "Hành động"
  },
  "director": {
    "directorId": 1,
    "name": "Anthony Russo"
  },
  "actors": [
    { "actorId": 1, "name": "Robert Downey Jr." },
    { "actorId": 2, "name": "Chris Evans" }
  ],
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

---

### 🎬 Client Endpoints

#### `GET /api/movies` — Lấy danh sách phim (có phân trang)

**Query Parameters:**

| Parameter | Type | Required | Default | Mô tả |
|-----------|------|----------|---------|-------|
| `page` | integer | No | `0` | Số trang |
| `size` | integer | No | `10` | Số phần tử/trang |
| `sort` | string | No | `createdAt` | Sắp xếp |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách phim thành công",
  "data": {
    "content": [ /* MovieResponseDTO[] */ ],
    "totalElements": 50,
    "totalPages": 5,
    "size": 10,
    "number": 0
  }
}
```

---

#### `GET /api/movies/{id}` — Lấy thông tin phim theo ID

**Path Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `id` | Long | Yes | ID của phim |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy thông tin phim thành công",
  "data": { /* MovieResponseDTO */ }
}
```

**Response `404 Not Found`:**
```json
{
  "success": false,
  "message": "Không tìm thấy phim với ID: 999"
}
```

---

#### `GET /api/movies/now-showing` — Lấy danh sách phim đang chiếu

**Query Parameters:** Hỗ trợ phân trang (`page`, `size`, `sort=releaseDate`)

**Response `200 OK`:** Tương tự `GET /api/movies`

---

#### `GET /api/movies/coming-soon` — Lấy danh sách phim sắp chiếu

**Query Parameters:** Hỗ trợ phân trang (`page`, `size`, `sort=releaseDate`)

**Response `200 OK`:** Tương tự `GET /api/movies`

---

#### `GET /api/movies/featured` — Lấy danh sách phim nổi bật

**Query Parameters:** Hỗ trợ phân trang (`page`, `size`, `sort=rating`)

**Response `200 OK`:** Tương tự `GET /api/movies`

---

#### `GET /api/movies/search` — Tìm kiếm phim theo tên

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `keyword` | string | Yes | Từ khóa tìm kiếm |
| `page` | integer | No | Số trang |
| `size` | integer | No | Số phần tử/trang |

**Ví dụ:**
```
GET /api/movies/search?keyword=avengers&page=0&size=10
```

**Response `200 OK`:** Tương tự `GET /api/movies`

---

#### `GET /api/movies/genre/{genreId}` — Lấy phim theo thể loại

**Path Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `genreId` | Long | Yes | ID thể loại |

**Response `200 OK`:** Tương tự `GET /api/movies`

---

### 🔧 Admin Endpoints

#### `POST /api/movies` — Tạo phim mới

**Request Body:**
```json
{
  "title": "Avengers: Endgame",
  "originalTitle": "Avengers: Endgame",
  "description": "Mô tả phim...",
  "duration": 181,
  "posterUrl": "https://example.com/poster.jpg",
  "trailerUrl": "https://youtube.com/watch?v=xxx",
  "releaseDate": "2024-01-15",
  "endDate": "2024-02-15",
  "rating": 8.5,
  "ageRating": "PG-13",
  "isNowShowing": true,
  "isComingSoon": false,
  "isFeatured": true,
  "genreId": 1,
  "directorId": 1,
  "actorIds": [1, 2, 3]
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `title` | Bắt buộc, tối đa 200 ký tự |
| `originalTitle` | Tối đa 200 ký tự |
| `duration` | Phải là số dương |
| `posterUrl` | Tối đa 500 ký tự |
| `trailerUrl` | Tối đa 500 ký tự |
| `rating` | Phải là số dương |
| `ageRating` | Một trong: `G`, `PG`, `PG-13`, `R`, `NC-17` |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Tạo phim thành công",
  "data": { /* MovieResponseDTO */ }
}
```

---

#### `PUT /api/movies/{id}` — Cập nhật phim

**Path Parameters:** `id` (Long) - ID phim

**Request Body:** Tương tự `POST /api/movies`

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật phim thành công",
  "data": { /* MovieResponseDTO */ }
}
```

---

#### `DELETE /api/movies/{id}` — Xóa phim (soft delete)

**Path Parameters:** `id` (Long) - ID phim

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Xóa phim thành công",
  "data": null
}
```

---

#### `PATCH /api/movies/{id}/restore` — Khôi phục phim đã xóa

**Path Parameters:** `id` (Long) - ID phim

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Khôi phục phim thành công",
  "data": { /* MovieResponseDTO */ }
}
```

---

## Showtimes API

### Schema: ShowtimeResponseDTO

```json
{
  "showtimeId": 1,
  "startTime": "2024-01-15T14:00:00",
  "endTime": "2024-01-15T16:01:00",
  "showDate": "2024-01-15T00:00:00",
  "price": 90000.0,
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00",
  "movie": {
    "movieId": 1,
    "title": "Avengers: Endgame",
    "posterUrl": "https://example.com/poster.jpg",
    "duration": 181,
    "ageRating": "PG-13"
  },
  "theater": {
    "theaterId": 1,
    "name": "Phòng 1",
    "theaterType": "STANDARD",
    "totalSeats": 100
  }
}
```

---

### 🎟️ Client Endpoints

#### `GET /api/client/showtimes` — Lấy suất chiếu hôm nay

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách suất chiếu thành công",
  "data": [ /* ShowtimeResponseDTO[] */ ]
}
```

---

#### `GET /api/client/showtimes/{id}` — Lấy suất chiếu theo ID

**Path Parameters:** `id` (Long) - ID suất chiếu

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy thông tin suất chiếu thành công",
  "data": { /* ShowtimeResponseDTO */ }
}
```

---

#### `GET /api/client/showtimes/movie/{movieId}` — Lấy suất chiếu theo phim

**Path Parameters:** `movieId` (Long) - ID phim

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách suất chiếu theo phim thành công",
  "data": [ /* ShowtimeResponseDTO[] */ ]
}
```

---

#### `GET /api/client/showtimes/theater/{theaterId}` — Lấy suất chiếu theo phòng chiếu

**Path Parameters:** `theaterId` (Long) - ID phòng chiếu

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách suất chiếu theo phòng chiếu thành công",
  "data": [ /* ShowtimeResponseDTO[] */ ]
}
```

---

#### `GET /api/client/showtimes/date` — Lấy suất chiếu theo ngày

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `date` | string (yyyy-MM-dd) | Yes | Ngày chiếu |

**Ví dụ:**
```
GET /api/client/showtimes/date?date=2024-01-15
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách suất chiếu theo ngày thành công",
  "data": [ /* ShowtimeResponseDTO[] */ ]
}
```

---

#### `GET /api/client/showtimes/movie/{movieId}/date` — Lấy suất chiếu theo phim và ngày

**Path Parameters:** `movieId` (Long) - ID phim

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `date` | string (yyyy-MM-dd) | Yes | Ngày chiếu |

**Ví dụ:**
```
GET /api/client/showtimes/movie/1/date?date=2024-01-15
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách suất chiếu theo phim và ngày thành công",
  "data": [ /* ShowtimeResponseDTO[] */ ]
}
```

---

### 🔧 Admin Endpoints

#### `POST /api/admin/showtimes` — Tạo suất chiếu mới

**Request Body:**
```json
{
  "movieId": 1,
  "theaterId": 1,
  "startTime": "2024-01-15T14:00:00",
  "endTime": "2024-01-15T16:01:00",
  "price": 90000.0
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `movieId` | Bắt buộc |
| `theaterId` | Bắt buộc |
| `startTime` | Bắt buộc |
| `price` | Bắt buộc |
| `endTime` | Không bắt buộc |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Tạo suất chiếu thành công",
  "data": { /* ShowtimeResponseDTO */ }
}
```

---

#### `PUT /api/admin/showtimes/{id}` — Cập nhật suất chiếu

**Path Parameters:** `id` (Long) - ID suất chiếu

**Request Body:** Tương tự POST

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật suất chiếu thành công",
  "data": { /* ShowtimeResponseDTO */ }
}
```

---

#### `GET /api/admin/showtimes` — Lấy tất cả suất chiếu (có phân trang)

**Query Parameters:** Hỗ trợ phân trang (`page`, `size`, `sort`)

**Response `200 OK`:** Page\<ShowtimeResponseDTO\>

---

#### `GET /api/admin/showtimes/{id}` — Lấy suất chiếu theo ID (Admin)

**Response `200 OK`:** ShowtimeResponseDTO

---

#### `GET /api/admin/showtimes/active` — Lấy suất chiếu đang hoạt động

**Query Parameters:** Hỗ trợ phân trang

**Response `200 OK`:** Page\<ShowtimeResponseDTO\>

---

#### `GET /api/admin/showtimes/movie/{movieId}` — Lấy suất chiếu theo phim (Admin)

**Response `200 OK`:** Danh sách ShowtimeResponseDTO

---

#### `GET /api/admin/showtimes/theater/{theaterId}` — Lấy suất chiếu theo phòng (Admin)

**Response `200 OK`:** Danh sách ShowtimeResponseDTO

---

#### `GET /api/admin/showtimes/date` — Lấy suất chiếu theo ngày (Admin)

**Query Parameters:** `date` (yyyy-MM-dd)

**Response `200 OK`:** Danh sách ShowtimeResponseDTO

---

#### `DELETE /api/admin/showtimes/{id}` — Vô hiệu hóa suất chiếu

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Vô hiệu hóa suất chiếu thành công",
  "data": null
}
```

---

#### `PATCH /api/admin/showtimes/{id}/activate` — Kích hoạt suất chiếu

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Kích hoạt suất chiếu thành công",
  "data": { /* ShowtimeResponseDTO */ }
}
```

---

## Cinemas API

### Schema: CinemaResponseDTO

```json
{
  "cinemaId": 1,
  "name": "CGV Vincom Center",
  "address": "72 Lê Thánh Tôn, Bến Nghé",
  "city": "Hồ Chí Minh",
  "district": "Quận 1",
  "phone": "1900 6017",
  "email": "cgv@example.com",
  "imageUrl": "https://example.com/cinema.jpg",
  "description": "Rạp chiếu phim CGV tại Vincom Center",
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00"
}
```

---

### 🏢 Client Endpoints

#### `GET /api/cinemas` — Lấy danh sách rạp đang hoạt động

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách rạp chiếu thành công",
  "data": [ /* CinemaResponseDTO[] */ ]
}
```

---

### 🔧 Admin Endpoints

#### `GET /api/admin/cinemas` — Lấy tất cả rạp

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách rạp thành công",
  "data": [ /* CinemaResponseDTO[] */ ]
}
```

---

#### `GET /api/admin/cinemas/{id}` — Lấy rạp theo ID

**Path Parameters:** `id` (Long) - ID rạp

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy thông tin rạp thành công",
  "data": { /* CinemaResponseDTO */ }
}
```

---

#### `POST /api/admin/cinemas` — Tạo rạp mới

**Request Body:**
```json
{
  "name": "CGV Vincom Center",
  "address": "72 Lê Thánh Tôn, Bến Nghé",
  "city": "Hồ Chí Minh",
  "district": "Quận 1",
  "phone": "1900 6017",
  "email": "cgv@example.com",
  "imageUrl": "https://example.com/cinema.jpg",
  "description": "Rạp chiếu phim CGV tại Vincom Center",
  "isActive": true
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `name` | Bắt buộc |

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Tạo rạp thành công",
  "data": { /* CinemaResponseDTO */ }
}
```

---

#### `PUT /api/admin/cinemas/{id}` — Cập nhật rạp

**Path Parameters:** `id` (Long) - ID rạp

**Request Body:** Tương tự POST

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật rạp thành công",
  "data": { /* CinemaResponseDTO */ }
}
```

---

#### `DELETE /api/admin/cinemas/{id}` — Xóa rạp

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Xóa rạp thành công",
  "data": null
}
```

---

#### `GET /api/admin/cinemas/search` — Tìm kiếm rạp theo tên

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `keyword` | string | Yes | Từ khóa tìm kiếm |

**Ví dụ:**
```
GET /api/admin/cinemas/search?keyword=CGV
```

**Response `200 OK`:** Danh sách CinemaResponseDTO

---

#### `GET /api/admin/cinemas/city` — Lấy rạp theo thành phố

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `city` | string | Yes | Tên thành phố |

**Ví dụ:**
```
GET /api/admin/cinemas/city?city=Hồ Chí Minh
```

**Response `200 OK`:** Danh sách CinemaResponseDTO

---

#### `PATCH /api/admin/cinemas/{id}/restore` — Khôi phục rạp đã xóa

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Khôi phục rạp thành công",
  "data": { /* CinemaResponseDTO */ }
}
```

---

## Theaters API

### Schema: TheaterResponseDTO

```json
{
  "theaterId": 1,
  "name": "Phòng 1",
  "totalSeats": 100,
  "rowsCount": 10,
  "seatsPerRow": 10,
  "theaterType": "STANDARD",
  "isActive": true,
  "cinemaId": 1
}
```

---

### 🎭 Client Endpoints

#### `GET /api/theaters` — Lấy danh sách phòng chiếu đang hoạt động (có phân trang)

**Query Parameters:** Hỗ trợ phân trang (`page`, `size`, `sort`)

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách phòng chiếu thành công",
  "data": {
    "content": [ /* TheaterResponseDTO[] */ ],
    "totalElements": 20,
    "totalPages": 2,
    "size": 10,
    "number": 0
  }
}
```

---

### 🔧 Admin Endpoints

#### `POST /api/admin/theaters` — Tạo phòng chiếu mới

> ⚠️ Khi tạo phòng chiếu, hệ thống sẽ **tự động tạo ghế ngồi** dựa trên `rowsCount × seatsPerRow`.

**Request Body:**
```json
{
  "name": "Phòng 1",
  "rowsCount": 10,
  "seatsPerRow": 10,
  "theaterType": "STANDARD",
  "cinemaId": 1
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Thêm phòng chiếu thành công",
  "data": { /* TheaterResponseDTO */ }
}
```

---

#### `GET /api/admin/theaters` — Lấy tất cả phòng chiếu (có phân trang)

**Query Parameters:** Hỗ trợ phân trang

**Response `200 OK`:** Page\<TheaterResponseDTO\>

---

#### `GET /api/admin/theaters/{id}` — Lấy phòng chiếu theo ID

**Response `200 OK`:** TheaterResponseDTO

---

#### `PUT /api/admin/theaters/{id}` — Cập nhật phòng chiếu

**Request Body:** Tương tự POST

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật phòng chiếu thành công",
  "data": { /* TheaterResponseDTO */ }
}
```

---

#### `PATCH /api/admin/theaters/{id}/restore` — Khôi phục phòng chiếu

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Khôi phục phòng chiếu thành công",
  "data": { /* TheaterResponseDTO */ }
}
```

---

#### `DELETE /api/admin/theaters/{id}` — Xóa phòng chiếu

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Xóa phòng chiếu thành công",
  "data": null
}
```

---

## Seats API

### Schema: SeatAvailabilityDTO

```json
{
      "seatId": 1,
      "seatLabel": "A1",
      "seatRow": "A",
      "seatNumber": 1,
      "seatType": "STANDARD",
      "priceMultiplier": 1.0,
      "status": "AVAILABLE",
      "isCoupleSeat": false
    },
    {
      "seatId": 2,
      "seatLabel": "A2",
      "seatRow": "A",
      "seatNumber": 2,
      "seatType": "VIP",
      "priceMultiplier": 1.5,
      "status": "OCCUPIED",
      "isCoupleSeat": false
    },
    {
      "seatId": 3,
      "seatLabel": "J9",
      "seatRow": "J",
      "seatNumber": 9,
      "seatType": "COUPLE",
      "priceMultiplier": 2.0,
      "status": "RESERVED",
      "isCoupleSeat": true
    }
  ]
}
```

---

### 🔧 Admin Endpoints

#### GET `/api/admin/seats/theaters/{theaterId}` — Lấy danh sách ghế theo phòng chiếu

**Path Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `theaterId` | Long | Yes | ID phòng chiếu |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách ghế theo phòng chiếu thành công",
  "data": [
    {
      "seatId": 1,
      "theaterId": 1,
      "theaterName": "Phòng 1",
      "seatLabel": "A1",
      "seatRow": "A",
      "seatNumber": 1,
      "seatType": "STANDARD",
      "priceMultiplier": 1.0,
      "isAvailable": true,
      "isCoupleSeat": false,
      "isActive": true
    }
  ]
}
```

---

#### GET `/api/admin/seats/{seatId}` — Lấy thông tin một ghế

**Path Parameters:** `seatId` (Long) - ID ghế

**Response `200 OK`:** SeatResponseDTO

---

#### PATCH `/api/admin/seats/{seatId}/type` — Cập nhật loại ghế

**Path Parameters:** `seatId` (Long) - ID ghế

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `seatTypeName` | string | Yes | Tên loại ghế: `STANDARD`, `VIP`, `COUPLE` |

**Ví dụ:**
```
PATCH /api/admin/seats/1/type?seatTypeName=VIP
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật loại ghế thành công",
  "data": { /* SeatResponseDTO */ }
}
```

---

#### PATCH `/api/admin/seats/{seatId}/disable` — Vô hiệu hóa ghế

**Path Parameters:** `seatId` (Long) - ID ghế

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Vô hiệu hóa ghế thành công",
  "data": null
}
```

---

#### PATCH `/api/admin/seats/{seatId}/enable` — Kích hoạt ghế

**Path Parameters:** `seatId` (Long) - ID ghế

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Kích hoạt ghế thành công",
  "data": null
}
```

---

#### POST `/api/admin/seats/theaters/{theaterId}/regenerate` — Tạo lại toàn bộ ghế của phòng chiếu

> ⚠️ Endpoint này sẽ **xóa toàn bộ ghế cũ** và tạo lại ghế mới dựa trên cấu hình phòng chiếu.

**Path Parameters:** `theaterId` (Long) - ID phòng chiếu

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Tạo lại ghế thành công",
  "data": null
}
```

---

## Bookings API

### Schema: BookingResponseDTO

```json
{
  "bookingId": 1,
  "bookingCode": "BK20240115001",
  "status": "CONFIRMED",
  "quantity": 2,
  "totalAmount": 180000.0,
  "discountAmount": 0.0,
  "finalAmount": 180000.0,
  "bookingDate": "2024-01-15T10:30:00",
  "expiryDate": "2024-01-15T10:45:00",
  "notes": "Ghi chú đặt vé",
  "userId": 1,
  "userName": "Nguyễn Văn A",
  "showtimeId": 1,
  "movieId": 1,
  "movieTitle": "Avengers: Endgame",
  "startTime": "2024-01-15T14:00:00",
  "bookingDetails": [
    {
      "bookingDetailId": 1,
      "seatId": 5,
      "seatNumber": 5,
      "unitPrice": 90000.0,
      "quantity": 1,
      "subtotal": 90000.0
    },
    {
      "bookingDetailId": 2,
      "seatId": 6,
      "seatNumber": 6,
      "unitPrice": 90000.0,
      "quantity": 1,
      "subtotal": 90000.0
    }
  ]
}
```

---

### 🎟️ Client Endpoints

#### POST `/api/bookings` — Tạo đặt vé mới

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `userId` | Long | Yes | ID người dùng đặt vé |

**Request Body:**
```json
{
  "showtimeId": 1,
  "seatIds": [5, 6],
  "promoCodeId": null,
  "notes": "Ghi chú đặt vé"
}
```

**Field Descriptions:**

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `showtimeId` | Long | Yes | ID suất chiếu |
| `seatIds` | Long[] | Yes | Danh sách ID ghế muốn đặt |
| `promoCodeId` | Long | No | ID mã khuyến mãi (nếu có) |
| `notes` | string | No | Ghi chú |

**Ví dụ:**
```
POST /api/bookings?userId=1
```

**Response `200 OK`:**
```json
{
  "bookingId": 1,
  "bookingCode": "BK20240115001",
  "status": "CONFIRMED",
  "quantity": 2,
  "totalAmount": 180000.0,
  "discountAmount": 0.0,
  "finalAmount": 180000.0,
  "bookingDate": "2024-01-15T10:30:00",
  "expiryDate": "2024-01-15T10:45:00",
  "notes": "Ghi chú đặt vé",
  "userId": 1,
  "userName": "Nguyễn Văn A",
  "showtimeId": 1,
  "movieId": 1,
  "movieTitle": "Avengers: Endgame",
  "startTime": "2024-01-15T14:00:00",
  "bookingDetails": [ /* BookingDetailResponseDTO[] */ ]
}
```

> ⚠️ **Lưu ý:** Endpoint này trả về trực tiếp `BookingResponseDTO` (không bọc trong `ApiResponse`).

---

### 🔧 Admin Endpoints

#### GET `/api/admin/bookings` — Lấy tất cả đặt vé

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách đặt vé thành công",
  "data": [ /* BookingResponseDTO[] */ ]
}
```

---

## Users API

### Schema: UserResponseDTO

```json
{
  "userId": 1,
  "username": "nguyenvana",
  "email": "nguyenvana@example.com",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "isActive": true,
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

> ⚠️ **Lưu ý:** Các endpoint Users trả về trực tiếp `UserResponseDTO` hoặc `Page<UserResponseDTO>` (không bọc trong `ApiResponse`).

---

### 👤 Endpoints

#### POST `/api/users` — Tạo người dùng mới

**Request Body:**
```json
{
  "username": "nguyenvana",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "role": "CUSTOMER"
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `username` | Bắt buộc, 3–50 ký tự |
| `email` | Bắt buộc, định dạng email hợp lệ |
| `password` | Bắt buộc, 6–100 ký tự |
| `fullName` | Tối đa 100 ký tự |
| `phone` | Tối đa 20 ký tự |
| `role` | Một trong: `ADMIN`, `STAFF`, `CUSTOMER` |

**Response `201 Created`:** UserResponseDTO

---

#### GET `/api/users` — Lấy danh sách người dùng (có phân trang)

**Query Parameters:**

| Parameter | Type | Default | Mô tả |
|-----------|------|---------|-------|
| `page` | integer | `0` | Số trang |
| `size` | integer | `10` | Số phần tử/trang |
| `sort` | string | `userId` | Sắp xếp |

**Response `200 OK`:** Page\<UserResponseDTO\>

---

#### GET `/api/users/{id}` — Lấy người dùng theo ID

**Path Parameters:** `id` (Long) - ID người dùng

**Response `200 OK`:** UserResponseDTO

---

#### PUT `/api/users/{id}` — Cập nhật người dùng

**Path Parameters:** `id` (Long) - ID người dùng

**Request Body:** Tương tự POST

**Response `200 OK`:** UserResponseDTO

---

#### DELETE `/api/users/{id}` — Xóa người dùng

**Path Parameters:** `id` (Long) - ID người dùng

**Response `204 No Content`**

---

#### PATCH `/api/users/{id}/activate` — Kích hoạt tài khoản người dùng

**Path Parameters:** `id` (Long) - ID người dùng

**Response `200 OK`:** UserResponseDTO

---

#### PATCH `/api/users/{id}/deactivate` — Vô hiệu hóa tài khoản người dùng

**Path Parameters:** `id` (Long) - ID người dùng

**Response `200 OK`:** UserResponseDTO

---

## Actors API

### Schema: ActorResponseDTO

```json
{
  "id": 1,
  "name": "Robert Downey Jr.",
  "biography": "Tiểu sử diễn viên...",
  "birthDate": "1965-04-04",
  "nationality": "American",
  "imageUrl": "https://example.com/actor.jpg"
}
```

---

### 🔧 Admin Endpoints

#### POST `/api/admin/actors` — Tạo diễn viên mới

**Request Body:**
```json
{
  "name": "Robert Downey Jr.",
  "biography": "Tiểu sử diễn viên...",
  "birthDate": "1965-04-04",
  "nationality": "American",
  "imageUrl": "https://example.com/actor.jpg"
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `name` | Bắt buộc |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Tạo diễn viên thành công",
  "data": { /* ActorResponseDTO */ }
}
```

---

#### GET `/api/admin/actors` — Lấy danh sách diễn viên (có phân trang, tìm kiếm)

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `keyword` | string | No | Từ khóa tìm kiếm theo tên |
| `page` | integer | No | Số trang |
| `size` | integer | No | Số phần tử/trang |

**Ví dụ:**
```
GET /api/admin/actors?keyword=Robert&page=0&size=10
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách diễn viên thành công",
  "data": {
    "content": [ /* ActorResponseDTO[] */ ],
    "totalElements": 50,
    "totalPages": 5,
    "size": 10,
    "number": 0
  }
}
```

---

#### GET `/api/admin/actors/{id}` — Lấy diễn viên theo ID

**Path Parameters:** `id` (Long) - ID diễn viên

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy thông tin diễn viên thành công",
  "data": { /* ActorResponseDTO */ }
}
```

---

#### PUT `/api/admin/actors/{id}` — Cập nhật diễn viên

**Path Parameters:** `id` (Long) - ID diễn viên

**Request Body:** Tương tự POST

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật diễn viên thành công",
  "data": { /* ActorResponseDTO */ }
}
```

---

#### DELETE `/api/admin/actors/{id}` — Xóa diễn viên

**Path Parameters:** `id` (Long) - ID diễn viên

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Xóa diễn viên thành công",
  "data": null
}
```

---

## Directors API

### Schema: DirectorResponseDTO

```json
{
  "directorId": 1,
  "name": "Anthony Russo",
  "biography": "Tiểu sử đạo diễn...",
  "birthDate": "1970-02-03",
  "nationality": "American",
  "imageUrl": "https://example.com/director.jpg",
  "createdAt": "2024-01-01T10:00:00"
}
```

---

### 🔧 Admin Endpoints

#### POST `/api/admin/directors` — Tạo đạo diễn mới

**Request Body:**
```json
{
  "name": "Anthony Russo",
  "biography": "Tiểu sử đạo diễn...",
  "dateOfBirth": "1970-02-03",
  "nationality": "American",
  "imageUrl": "https://example.com/director.jpg"
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `name` | Bắt buộc |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Tạo đạo diễn thành công",
  "data": { /* DirectorResponseDTO */ }
}
```

---

#### GET `/api/admin/directors` — Lấy danh sách đạo diễn (có phân trang, tìm kiếm)

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `keyword` | string | No | Từ khóa tìm kiếm theo tên |
| `page` | integer | No | Số trang |
| `size` | integer | No | Số phần tử/trang |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách đạo diễn thành công",
  "data": {
    "content": [ /* DirectorResponseDTO[] */ ],
    "totalElements": 20,
    "totalPages": 2,
    "size": 10,
    "number": 0
  }
}
```

---

#### GET `/api/admin/directors/{id}` — Lấy đạo diễn theo ID

**Path Parameters:** `id` (Long) - ID đạo diễn

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy thông tin đạo diễn thành công",
  "data": { /* DirectorResponseDTO */ }
}
```

---

#### PUT `/api/admin/directors/{id}` — Cập nhật đạo diễn

**Path Parameters:** `id` (Long) - ID đạo diễn

**Request Body:** Tương tự POST

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật đạo diễn thành công",
  "data": { /* DirectorResponseDTO */ }
}
```

---

#### DELETE `/api/admin/directors/{id}` — Xóa đạo diễn

**Path Parameters:** `id` (Long) - ID đạo diễn

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Xóa đạo diễn thành công",
  "data": null
}
```

---

## Genres API

### Schema: GenreResponseDTO

```json
{
  "genreId": 1,
  "name": "Hành động",
  "description": "Phim hành động, phiêu lưu",
  "createdAt": "2024-01-01T10:00:00",
  "isDeleted": false
}
```

---

### 🔧 Admin Endpoints

#### POST `/api/admin/genres` — Tạo thể loại mới

**Request Body:**
```json
{
  "name": "Hành động",
  "description": "Phim hành động, phiêu lưu"
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| `name` | Bắt buộc, tối đa 50 ký tự |
| `description` | Tối đa 255 ký tự |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Tạo thể loại thành công",
  "data": { /* GenreResponseDTO */ }
}
```

---

#### GET `/api/admin/genres` — Lấy danh sách thể loại (có phân trang, tìm kiếm)

**Query Parameters:**

| Parameter | Type | Required | Mô tả |
|-----------|------|----------|-------|
| `keyword` | string | No | Từ khóa tìm kiếm theo tên |
| `page` | integer | No | Số trang |
| `size` | integer | No | Số phần tử/trang |

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy danh sách thể loại thành công",
  "data": {
    "content": [ /* GenreResponseDTO[] */ ],
    "totalElements": 10,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

#### GET `/api/admin/genres/{id}` — Lấy thể loại theo ID

**Path Parameters:** `id` (Long) - ID thể loại

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Lấy thông tin thể loại thành công",
  "data": { /* GenreResponseDTO */ }
}
```

---

#### PUT `/api/admin/genres/{id}` — Cập nhật thể loại

**Path Parameters:** `id` (Long) - ID thể loại

**Request Body:** Tương tự POST

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Cập nhật thể loại thành công",
  "data": { /* GenreResponseDTO */ }
}
```

---

#### DELETE `/api/admin/genres/{id}` — Xóa thể loại (soft delete)

**Path Parameters:** `id` (Long) - ID thể loại

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Xóa thể loại thành công",
  "data": null
}
```

---

#### PATCH `/api/admin/genres/{id}/restore` — Khôi phục thể loại đã xóa

**Path Parameters:** `id` (Long) - ID thể loại

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Khôi phục thể loại thành công",
  "data": { /* GenreResponseDTO */ }
}
```

---

## 📊 API Endpoints Summary

### Client Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/movies` | Danh sách phim (phân trang) |
| GET | `/api/movies/{id}` | Chi tiết phim |
| GET | `/api/movies/now-showing` | Phim đang chiếu |
| GET | `/api/movies/coming-soon` | Phim sắp chiếu |
| GET | `/api/movies/featured` | Phim nổi bật |
| GET | `/api/movies/search?keyword=` | Tìm kiếm phim |
| GET | `/api/movies/genre/{genreId}` | Phim theo thể loại |
| GET | `/api/client/showtimes` | Suất chiếu hôm nay |
| GET | `/api/client/showtimes/{id}` | Chi tiết suất chiếu |
| GET | `/api/client/showtimes/movie/{movieId}` | Suất chiếu theo phim |
| GET | `/api/client/showtimes/theater/{theaterId}` | Suất chiếu theo phòng |
| GET | `/api/client/showtimes/date?date=` | Suất chiếu theo ngày |
| GET | `/api/client/showtimes/movie/{movieId}/date?date=` | Suất chiếu theo phim & ngày |
| GET | `/api/cinemas` | Danh sách rạp hoạt động |
| GET | `/api/theaters` | Danh sách phòng chiếu hoạt động |
| GET | `/api/seats/showtimes/{showtimeId}/availability` | Trạng thái ghế theo suất chiếu |
| POST | `/api/bookings?userId=` | Đặt vé |

### Admin Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/movies` | Tạo phim |
| PUT | `/api/movies/{id}` | Cập nhật phim |
| DELETE | `/api/movies/{id}` | Xóa phim |
| PATCH | `/api/movies/{id}/restore` | Khôi phục phim |
| POST | `/api/admin/showtimes` | Tạo suất chiếu |
| PUT | `/api/admin/showtimes/{id}` | Cập nhật suất chiếu |
| GET | `/api/admin/showtimes` | Danh sách suất chiếu |
| GET | `/api/admin/showtimes/{id}` | Chi tiết suất chiếu |
| GET | `/api/admin/showtimes/active` | Suất chiếu đang hoạt động |
| DELETE | `/api/admin/showtimes/{id}` | Vô hiệu hóa suất chiếu |
| PATCH | `/api/admin/showtimes/{id}/activate` | Kích hoạt suất chiếu |
| GET | `/api/admin/cinemas` | Danh sách rạp |
| POST | `/api/admin/cinemas` | Tạo rạp |
| PUT | `/api/admin/cinemas/{id}` | Cập nhật rạp |
| DELETE | `/api/admin/cinemas/{id}` | Xóa rạp |
| PATCH | `/api/admin/cinemas/{id}/restore` | Khôi phục rạp |
| GET | `/api/admin/theaters` | Danh sách phòng chiếu |
| POST | `/api/admin/theaters` | Tạo phòng chiếu |
| PUT | `/api/admin/theaters/{id}` | Cập nhật phòng chiếu |
| DELETE | `/api/admin/theaters/{id}` | Xóa phòng chiếu |
| GET | `/api/admin/seats/theaters/{theaterId}` | Ghế theo phòng chiếu |
| PATCH | `/api/admin/seats/{seatId}/type` | Cập nhật loại ghế |
| PATCH | `/api/admin/seats/{seatId}/disable` | Vô hiệu hóa ghế |
| PATCH | `/api/admin/seats/{seatId}/enable` | Kích hoạt ghế |
| POST | `/api/admin/seats/theaters/{theaterId}/regenerate` | Tạo lại ghế |
| GET | `/api/admin/bookings` | Danh sách đặt vé |
| POST | `/api/users` | Tạo người dùng |
| GET | `/api/users` | Danh sách người dùng |
| GET | `/api/users/{id}` | Chi tiết người dùng |
| PUT | `/api/users/{id}` | Cập nhật người dùng |
| DELETE | `/api/users/{id}` | Xóa người dùng |
| PATCH | `/api/users/{id}/activate` | Kích hoạt tài khoản |
| PATCH | `/api/users/{id}/deactivate` | Vô hiệu hóa tài khoản |
| POST | `/api/admin/actors` | Tạo diễn viên |
| GET | `/api/admin/actors` | Danh sách diễn viên |
| PUT | `/api/admin/actors/{id}` | Cập nhật diễn viên |
| DELETE | `/api/admin/actors/{id}` | Xóa diễn viên |
| POST | `/api/admin/directors` | Tạo đạo diễn |
| GET | `/api/admin/directors` | Danh sách đạo diễn |
| PUT | `/api/admin/directors/{id}` | Cập nhật đạo diễn |
| DELETE | `/api/admin/directors/{id}` | Xóa đạo diễn |
| POST | `/api/admin/genres` | Tạo thể loại |
| GET | `/api/admin/genres` | Danh sách thể loại |
| PUT | `/api/admin/genres/{id}` | Cập nhật thể loại |
| DELETE | `/api/admin/genres/{id}` | Xóa thể loại |
| PATCH | `/api/admin/genres/{id}/restore` | Khôi phục thể loại |

---

## 💡 Frontend Integration Examples (Axios)

### Cài đặt Axios instance

```javascript
// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor để xử lý lỗi chung
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Lỗi hệ thống';
    return Promise.reject(new Error(message));
  }
);

export default api;
```

---

### Movies API Examples

```javascript
// src/api/movieApi.js
import api from './axiosInstance';

// Lấy danh sách phim đang chiếu
export const getNowShowingMovies = (page = 0, size = 10) =>
  api.get(`/api/movies/now-showing?page=${page}&size=${size}`);

// Lấy chi tiết phim
export const getMovieById = (id) =>
  api.get(`/api/movies/${id}`);

// Tìm kiếm phim
export const searchMovies = (keyword, page = 0, size = 10) =>
  api.get(`/api/movies/search?keyword=${keyword}&page=${page}&size=${size}`);

// Lấy phim theo thể loại
export const getMoviesByGenre = (genreId, page = 0, size = 10) =>
  "seatNumber": 1,
  "seatType": "STANDARD",
  "
