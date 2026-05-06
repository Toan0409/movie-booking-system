# Sơ đồ quan hệ Entity trong hệ thống đặt vé xem phim

## Tổng quan
Dưới đây là sơ đồ ER thể hiện mối quan hệ giữa 17 entity trong hệ thống đặt vé xem phim trực tuyến.

## Sơ đồ ER (Mermaid)

```
mermaid
erDiagram
    %% ==================== USER & ROLE ====================
    USER ||--o{ BOOKING : "đặt"
    USER ||--o{ PAYMENT : "thanh toán"
    USER ||--o{ REVIEW : "đánh giá"
    USER }o--|| ROLE : "có vai trò"

    %% ==================== MOVIE & RELATED ====================
    MOVIE ||--o{ SHOWTIME : "có suất chiếu"
    MOVIE ||--o{ REVIEW : "có đánh giá"
    MOVIE }o--|| GENRE : "thuộc thể loại"
    MOVIE }o--|| DIRECTOR : "đạo diễn"
    MOVIE }o--o{ ACTOR : "diễn viên"

    %% ==================== CINEMA & THEATER ====================
    CINEMA ||--o{ THEATER : "có phòng chiếu"
    THEATER ||--o{ SHOWTIME : "có suất chiếu"
    THEATER ||--o{ SEAT : "có ghế"

    %% ==================== SEAT & SEAT TYPE ====================
    SEAT }o--|| SEAT_TYPE : "loại ghế"

    %% ==================== SHOWTIME & BOOKING ====================
    SHOWTIME ||--o{ BOOKING : "có đặt vé"
    SHOWTIME }o--|| MOVIE : "chiếu phim"
    SHOWTIME }o--|| THEATER : "tại phòng"

    %% ==================== BOOKING & RELATED ====================
    BOOKING ||--o{ BOOKING_DETAIL : "có chi tiết"
    BOOKING ||--|| PAYMENT : "thanh toán"
    BOOKING }o--|| PROMO_CODE : "áp mã giảm giá"

    %% ==================== BOOKING DETAIL ====================
    BOOKING_DETAIL }o--|| SEAT : "ghế"
    BOOKING_DETAIL ||--|| TICKET : "vé"

    %% ==================== RELATIONSHIPS ====================
    PROMO_CODE ||--o{ BOOKING : "áp dụng cho"
    DIRECTOR ||--o{ MOVIE : "đạo diễn"
    ACTOR ||--o{ MOVIE : "tham gia"
```

## Chi tiết các mối quan hệ

### 1. User - Role (Nhiều-Một)
- **User → Role**: Một User có một Role
- **Role → User**: Một Role có thể có nhiều User
- **Loại quan hệ**: ManyToOne / OneToMany

### 2. User - Booking (Một-Nhiều)
- **User → Booking**: Một User có thể đặt nhiều Booking
- **Booking → User**: Một Booking thuộc về một User

### 3. User - Payment (Một-Nhiều)
- **User → Payment**: Một User có thể có nhiều Payment
- **Payment → User**: Một Payment thuộc về một User

### 4. User - Review (Một-Nhiều)
- **User → Review**: Một User có thể viết nhiều Review
- **Review → User**: Một Review được viết bởi một User

### 5. Movie - Genre (Nhiều-Một)
- **Movie → Genre**: Một Movie thuộc một Genre
- **Genre → Movie**: Một Genre có nhiều Movie

### 6. Movie - Director (Nhiều-Một)
- **Movie → Director**: Một Movie có một Director
- **Director → Movie**: Một Director có thể đạo diễn nhiều Movie

### 7. Movie - Actor (Nhiều-Nhiều)
- **Movie → Actor**: Một Movie có nhiều Actor
- **Actor → Movie**: Một Actor có thể tham gia nhiều Movie
- **Bảng trung gian**: movie_actor

### 8. Movie - Showtime (Một-Nhiều)
- **Movie → Showtime**: Một Movie có nhiều Showtime
- **Showtime → Movie**: Một Showtime chiếu một Movie

### 9. Movie - Review (Một-Nhiều)
- **Movie → Review**: Một Movie có nhiều Review
- **Review → Movie**: Một Review cho một Movie

### 10. Cinema - Theater (Một-Nhiều)
- **Cinema → Theater**: Một Cinema có nhiều Theater
- **Theater → Cinema**: Một Theater thuộc về một Cinema

### 11. Theater - Showtime (Một-Nhiều)
- **Theater → Showtime**: Một Theater có nhiều Showtime
- **Showtime → Theater**: Một Showtime diễn ra ở một Theater

### 12. Theater - Seat (Một-Nhiều)
- **Theater → Seat**: Một Theater có nhiều Seat
- **Seat → Theater**: Một Seat thuộc về một Theater

### 13. Seat - SeatType (Nhiều-Một)
- **Seat → SeatType**: Một Seat có một SeatType
- **SeatType → Seat**: Một SeatType có nhiều Seat

### 14. Showtime - Booking (Một-Nhiều)
- **Showtime → Booking**: Một Showtime có nhiều Booking
- **Booking → Showtime**: Một Booking cho một Showtime

### 15. Booking - BookingDetail (Một-Nhiều)
- **Booking → BookingDetail**: Một Booking có nhiều BookingDetail
- **BookingDetail → Booking**: Một BookingDetail thuộc về một Booking

### 16. BookingDetail - Seat (Nhiều-Một)
- **BookingDetail → Seat**: Một BookingDetail đặt một Seat
- **Seat → BookingDetail**: Một Seat có thể được đặt trong nhiều BookingDetail (cho các suất chiếu khác nhau)

### 17. BookingDetail - Ticket (Một-Một)
- **BookingDetail → Ticket**: Một BookingDetail có một Ticket
- **Ticket → BookingDetail**: Một Ticket tương ứng với một BookingDetail

### 18. Booking - Payment (Một-Một)
- **Booking → Payment**: Một Booking có một Payment
- **Payment → Booking**: Một Payment cho một Booking

### 19. Booking - PromoCode (Nhiều-Một)
- **Booking → PromoCode**: Một Booking có thể có một PromoCode
- **PromoCode → Booking**: Một PromoCode có thể áp dụng cho nhiều Booking

## Sơ đồ Class Diagram

```
mermaid
classDiagram
    class User {
        +Long userId
        +String username
        +String email
        +String password
        +String fullName
        +String phone
        +Boolean isActive
        +Role role
        +List~Booking~ bookings
        +List~Payment~ payments
        +List~Review~ reviews
    }

    class Role {
        +Long roleId
        +String name
        +String description
    }

    class Movie {
        +Long movieId
        +String title
        +String description
        +Integer duration
        +String posterUrl
        +LocalDate releaseDate
        +Double rating
        +String ageRating
        +Boolean isNowShowing
        +Boolean isComingSoon
        +Genre genre
        +Director director
        +List~Actor~ actors
        +List~Showtime~ showtimes
        +List~Review~ reviews
    }

    class Genre {
        +Long genreId
        +String name
        +String description
    }

    class Director {
        +Long directorId
        +String name
        +String biography
        +LocalDate birthDate
        +String nationality
    }

    class Actor {
        +Long actorId
        +String name
        +String biography
        +LocalDate birthDate
        +String nationality
    }

    class Cinema {
        +Long cinemaId
        +String name
        +String address
        +String city
        +String phone
        +List~Theater~ theaters
    }

    class Theater {
        +Long theaterId
        +String name
        +Integer totalSeats
        +String theaterType
        +Cinema cinema
        +List~Showtime~ showtimes
        +List~Seat~ seats
    }

    class Showtime {
        +Long showtimeId
        +LocalDateTime startTime
        +LocalDateTime endTime
        +Double price
        +Boolean isActive
        +Movie movie
        +Theater theater
    }

    class Seat {
        +Long seatId
        +String seatRow
        +Integer seatNumber
        +String seatCode
        +Boolean isAvailable
        +Theater theater
        +SeatType seatType
    }

    class SeatType {
        +Long seatTypeId
        +String name
        +Double priceMultiplier
    }

    class Booking {
        +Long bookingId
        +String bookingCode
        +Double totalAmount
        +Double discountAmount
        +Double finalAmount
        +String status
        +LocalDateTime bookingDate
        +User user
        +Showtime showtime
        +PromoCode promoCode
        +List~BookingDetail~ bookingDetails
    }

    class BookingDetail {
        +Long bookingDetailId
        +Double unitPrice
        +Integer quantity
        +Double subtotal
        +Booking booking
        +Seat seat
    }

    class Ticket {
        +Long ticketId
        +String ticketCode
        +String qrCode
        +String status
        +BookingDetail bookingDetail
    }

    class Payment {
        +Long paymentId
        +String paymentCode
        +Double amount
        +String paymentMethod
        +String status
        +String transactionId
        +Booking booking
        +User user
    }

    class PromoCode {
        +Long promoCodeId
        +String code
        +String discountType
        +Double discountValue
        +Integer maxUses
        +Integer usedCount
        +Boolean isActive
    }

    class Review {
        +Long reviewId
        +Integer rating
        +String comment
        +Boolean isApproved
        +User user
        +Movie movie
    }

    User --> Role
    User --> Booking
    User --> Payment
    User --> Review
    Movie --> Genre
    Movie --> Director
    Movie --> Actor
    Movie --> Showtime
    Movie --> Review
    Cinema --> Theater
    Theater --> Showtime
    Theater --> Seat
    Seat --> SeatType
    Showtime --> Movie
    Showtime --> Theater
    Showtime --> Booking
    Booking --> User
    Booking --> Showtime
    Booking --> PromoCode
    Booking --> BookingDetail
    Booking --> Payment
    BookingDetail --> Booking
    BookingDetail --> Seat
    BookingDetail --> Ticket
    Ticket --> BookingDetail
    PromoCode --> Booking
    Review --> User
    Review --> Movie
```

## Tóm tắt quan hệ

| Entity 1 | Entity 2 | Loại quan hệ | Mô tả |
|----------|----------|--------------|-------|
| User | Role | ManyToOne | User có một Role |
| User | Booking | OneToMany | User đặt nhiều Booking |
| User | Payment | OneToMany | User có nhiều Payment |
| User | Review | OneToMany | User viết nhiều Review |
| Movie | Genre | ManyToOne | Movie thuộc Genre |
| Movie | Director | ManyToOne | Movie có Director |
| Movie | Actor | ManyToMany | Movie có nhiều Actor |
| Movie | Showtime | OneToMany | Movie có nhiều Showtime |
| Movie | Review | OneToMany | Movie có nhiều Review |
| Cinema | Theater | OneToMany | Cinema có nhiều Theater |
| Theater | Showtime | OneToMany | Theater có nhiều Showtime |
| Theater | Seat | OneToMany | Theater có nhiều Seat |
| Seat | SeatType | ManyToOne | Seat thuộc SeatType |
| Showtime | Booking | OneToMany | Showtime có nhiều Booking |
| Booking | BookingDetail | OneToMany | Booking có nhiều BookingDetail |
| Booking | Payment | OneToOne | Booking có một Payment |
| Booking | PromoCode | ManyToOne | Booking sử dụng PromoCode |
| BookingDetail | Seat | ManyToOne | BookingDetail đặt Seat |
| BookingDetail | Ticket | OneToOne | BookingDetail có Ticket |
