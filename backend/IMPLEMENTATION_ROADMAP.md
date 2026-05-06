# 🚀 LỘ TRÌNH HOÀN THIỆN WEBSITE ĐẶT VÉ XEM PHIM

## Tổng quan trạng thái hiện tại

###c module đã ✅ Cá hoàn thành
| Module | Repository | Service | Controller | Status |
|--------|------------|---------|------------|--------|
| Movie | ✅ | ✅ | ✅ | Hoàn thành |
| Genre | ✅ | ✅ | ✅ | Hoàn thành |
| Director | ✅ | ✅ | ✅ | Hoàn thành |
| Actor | ✅ | ✅ | ✅ | Hoàn thành |
| Cinema | ✅ | ✅ | ✅ | Hoàn thành |
| Theater | ✅ | ✅ | ✅ | Hoàn thành |
| Showtime | ✅ | ✅ | ✅ | Hoàn thành |
| User | ✅ | ✅ | ✅ | Hoàn thành |

### ❌ Các module còn thiếu (Core Business)
| Module | Repository | Service | Controller | Priority |
|--------|------------|---------|------------|----------|
| Seat | ❌ | ❌ | ❌ | Cao |
| Booking | ❌ | ❌ | ❌ | Rất cao |
| BookingDetail | ❌ | ❌ | ❌ | Rất cao |
| Ticket | ❌ | ❌ | ❌ | Cao |
| Payment | ❌ | ❌ | ❌ | Cao |
| PromoCode | ❌ | ❌ | ❌ | Trung bình |
| Review | ❌ | ❌ | ❌ | Trung bình |

---

## 📋 LỘ TRÌNH CHI TIẾT

### GIAI ĐOẠN 1: Quản lý ghế (Seat Management)
**Thời gian ước tính:** 2-3 ngày

#### 1.1 Tạo Repository
- `src/main/java/com/cinema/movie_booking/repository/BookingRepository.java` (đã có)
- `src/main/java/com/cinema/movie_booking/repository/BookingDetailRepository.java` ❌ Cần tạo
- `src/main/java/com/cinema/movie_booking/repository/TicketRepository.java` ❌ Cần tạo

#### 1.2 Tạo DTOs
- `src/main/java/com/cinema/movie_booking/dto/seat/SeatRequestDTO.java`
- `src/main/java/com/cinema/movie_booking/dto/seat/SeatResponseDTO.java`
- `src/main/java/com/cinema/movie_booking/dto/seat/SeatAvailabilityDTO.java`

#### 1.3 Tạo Mapper
- `src/main/java/com/cinema/movie_booking/mapper/SeatMapper.java`

#### 1.4 Tạo Service
- Interface: `src/main/java/com/cinema/movie_booking/service/SeatService.java`
- Implementation: `src/main/java/com/cinema/movie_booking/service/impl/SeatServiceImpl.java`

#### 1.5 Tạo Controller
- Admin: `src/main/java/com/cinema/movie_booking/controller/admin/SeatAdminController.java`
- Client: `src/main/java/com/cinema/movie_booking/controller/client/SeatController.java`

#### Business Rules:
- ✅ Ghế phải thuộc về một Theater
- ✅ Ghế có thể thuộc nhiều loại (VIP, Standard, Couple)
- ✅ Kiểm tra trạng thái ghế khi đặt (available/occupied/reserved)
- ✅ Tự động tạo ghế khi tạo Theater mới

---

### GIAI ĐOẠN 2: Đặt vé (Booking) - CORE MODULE
**Thời gian ước tính:** 4-5 ngày

#### 2.1 Tạo Repository
- `src/main/java/com/cinema/movie_booking/repository/BookingRepository.java` ❌ Cần tạo

#### 2.2 Tạo DTOs
- `src/main/java/com/cinema/movie_booking/dto/booking/BookingRequestDTO.java`
- `src/main/java/com/cinema/movie_booking/dto/booking/BookingResponseDTO.java`
- `src/main/java/com/cinema/movie_booking/dto/booking/BookingDetailRequestDTO.java`
- `src/main/java/com/cinema/movie_booking/dto/booking/BookingDetailResponseDTO.java`

#### 2.3 Tạo Mapper
- `src/main/java/com/cinema/movie_booking/mapper/BookingMapper.java`
- `src/main/java/com/cinema/movie_booking/mapper/BookingDetailMapper.java`

#### 2.4 Tạo Service
- Interface: `src/main/java/com/cinema/movie_booking/service/BookingService.java`
- Implementation: `src/main/java/com/cinema/movie_booking/service/impl/BookingServiceImpl.java`

#### 2.5 Tạo Controller
- Admin: `src/main/java/com/cinema/movie_booking/controller/admin/BookingAdminController.java`
- Client: `src/main/java/com/cinema/movie_booking/controller/client/BookingController.java`

#### Business Rules:
- ✅ Mã đặt vé duy nhất (booking code)
- ✅ Kiểm tra ghế còn trống trước khi đặt
- ✅ Thời hạn giữ vé (expiry date) - nếu không thanh toán trong X phút thì hủy
- ✅ Trạng thái đặt vé: PENDING → CONFIRMED → COMPLETED / CANCELLED / EXPIRED
- ✅ Áp dụng mã giảm giá (PromoCode)
- ✅ Tính tổng tiền (totalAmount - discountAmount = finalAmount)

---

### GIAI ĐOẠN 3: Quản lý vé (Ticket Management)
**Thời gian ước tính:** 2 ngày

#### 3.1 Tạo Repository
- `src/main/java/com/cinema/movie_booking/repository/TicketRepository.java` ❌ Cần tạo

#### 3.2 Tạo DTOs
- `src/main/java/com/cinema/movie_booking/dto/ticket/TicketResponseDTO.java`

#### 3.3 Tạo Mapper
- `src/main/java/com/cinema/movie_booking/mapper/TicketMapper.java`

#### 3.4 Tạo Service
- Interface: `src/main/java/com/cinema/movie_booking/service/TicketService.java`
- Implementation: `src/main/java/com/cinema/movie_booking/service/impl/TicketServiceImpl.java`

#### 3.5 Tạo Controller
- Admin: `src/main/java/com/cinema/movie_booking/controller/admin/TicketAdminController.java`
- Client: `src/main/java/com/cinema/movie_booking/controller/client/TicketController.java`

#### Business Rules:
- ✅ Tự động tạo ticket khi booking được xác nhận
- ✅ Mã vé duy nhất + mã QR
- ✅ Trạng thái vé: VALID → USED / CANCELLED
- ✅ Check-in khi đến rạp

---

### GIAI ĐOẠN 4: Thanh toán (Payment)
**Thời gian ước tính:** 3-4 ngày

#### 4.1 Tạo Repository
- `src/main/java/com/cinema/movie_booking/repository/PaymentRepository.java` ❌ Cần tạo

#### 4.2 Tạo DTOs
- `src/main/java/com/cinema/movie_booking/dto/payment/PaymentRequestDTO.java`
- `src/main/java/com/cinema/movie_booking/dto/payment/PaymentResponseDTO.java`

#### 4.3 Tạo Mapper
- `src/main/java/com/cinema/movie_booking/mapper/PaymentMapper.java`

#### 4.4 Tạo Service
- Interface: `src/main/java/com/cinema/movie_booking/service/PaymentService.java`
- Implementation: `src/main/java/com/cinema/movie_booking/service/impl/PaymentServiceImpl.java`

#### 4.5 Tạo Controller
- Admin: `src/main/java/com/cinema/movie_booking/controller/admin/PaymentAdminController.java`
- Client: `src/main/java/com/cinema/movie_booking/controller/client/PaymentController.java`

#### Business Rules:
- ✅ Phương thức thanh toán: CREDIT_CARD, DEBIT_CARD, MOMO, ZALOPAY, BANK_TRANSFER
- ✅ Trạng thái: PENDING → PROCESSING → SUCCESS / FAILED / REFUNDED
- ✅ Mã giao dịch (transaction ID)
- ✅ Tích hợp cổng thanh toán (mock hoặc thật)
- ✅ Hoàn tiền khi hủy vé

---

### GIAI ĐOẠN 5: Mã giảm giá (PromoCode)
**Thời gian ước tính:** 2 ngày

#### 5.1 Tạo Repository
- `src/main/java/com/cinema/movie_booking/repository/PromoCodeRepository.java` ❌ Cần tạo

#### 5.2 Tạo DTOs
- `src/main/java/com/cinema/movie_booking/dto/promo/PromoCodeRequestDTO.java`
- `src/main/java/com/cinema/movie_booking/dto/promo/PromoCodeResponseDTO.java`

#### 5.3 Tạo Mapper
- `src/main/java/com/cinema/movie_booking/mapper/PromoCodeMapper.java`

#### 5.4 Tạo Service
- Interface: `src/main/java/com/cinema/movie_booking/service/PromoCodeService.java`
- Implementation: `src/main/java/com/cinema/movie_booking/service/impl/PromoCodeServiceImpl.java`

#### 5.5 Tạo Controller
- Admin: `src/main/java/com/cinema/movie_booking/controller/admin/PromoCodeAdminController.java`

#### Business Rules:
- ✅ Loại giảm giá: PERCENTAGE (%), FIXED_AMOUNT (VND)
- ✅ Giới hạn số lần sử dụng (maxUses)
- ✅ Thời hạn hiệu lực (startDate, endDate)
- ✅ Kiểm tra mã hợp lệ trước khi áp dụng

---

### GIAI ĐOẠN 6: Đánh giá (Review)
**Thời gian ước tính:** 2 ngày

#### 6.1 Tạo Repository
- `src/main/java/com/cinema/movie_booking/repository/ReviewRepository.java` ❌ Cần tạo

#### 6.2 Tạo DTOs
- `src/main/java/com/cinema/movie_booking/dto/review/ReviewRequestDTO.java`
- `src/main/java/com/cinema/movie_booking/dto/review/ReviewResponseDTO.java`

#### 6.3 Tạo Mapper
- `src/main/java/com/cinema/movie_booking/mapper/ReviewMapper.java`

#### 6.4 Tạo Service
- Interface: `src/main/java/com/cinema/movie_booking/service/ReviewService.java`
- Implementation: `src/main/java/com/cinema/movie_booking/service/impl/ReviewServiceImpl.java`

#### 6.5 Tạo Controller
- Admin: `src/main/java/com/cinema/movie_booking/controller/admin/ReviewAdminController.java`
- Client: `src/main/java/com/cinema/movie_booking/controller/client/ReviewController.java`

#### Business Rules:
- ✅ Đánh giá sao (1-5 sao)
- ✅ Bình luận (comment)
- ✅ Chỉ user đã đặt vé mới được đánh giá
- ✅ Admin duyệt đánh giá trước khi hiển thị
- ✅ Tính rating trung bình cho phim

---

## 📊 Tổng kết

| Giai đoạn | Module | Ngày | Tổng cộng |
|-----------|--------|------|-----------|
| 1 | Seat Management | 2-3 | 2-3 |
| 2 | Booking | 4-5 | 6-8 |
| 3 | Ticket | 2 | 8-10 |
| 4 | Payment | 3-4 | 11-14 |
| 5 | PromoCode | 2 | 13-16 |
| 6 | Review | 2 | 15-18 |

**Tổng thời gian ước tính: 15-18 ngày**

---

## 🎯 Ưu tiên triển khai

1. **Ưu tiên cao nhất (Phase 1):** Seat + Booking + Ticket = Core booking flow
2. **Ưu tiên cao (Phase 2):** Payment = Hoàn tất thanh toán
3. **Ưu tiên trung bình (Phase 3):** PromoCode + Review = Tính năng bổ sung

---

## 🔧 Công việc bổ sung cần thiết

### Security & Auth
- ✅ Cấu hình JWT Authentication
- ✅ Phân quyền (Admin vs User)
- ✅ Bảo mật API

### API Documentation
- Tạo Swagger/OpenAPI documentation
- Test các API endpoints

### Frontend Integration
- Kết nối với React/Angular/Vue frontend
- Xử lý payment integration

### Testing
- Unit tests cho Service layer
- Integration tests cho API

---

*Document created: Auto-generated implementation roadmap*
*Last updated: Auto-generated*

