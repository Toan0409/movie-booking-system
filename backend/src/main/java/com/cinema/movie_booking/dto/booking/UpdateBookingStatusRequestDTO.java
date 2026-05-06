package com.cinema.movie_booking.dto.booking;

import com.cinema.movie_booking.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request DTO cho API cap nhat trang thai don dat ve.
 * Vi du request body: { "status": "PAID", "paymentMethod": "MOMO", "note":
 * "..." }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBookingStatusRequestDTO {

    /**
     * Trang thai moi can chuyen sang.
     * Bat buoc phai co. Gia tri hop le: PENDING, PAID, FAILED, CANCELLED.
     */
    @NotNull(message = "Trang thai khong duoc de trong")
    private BookingStatus status;

    /**
     * Phuong thuc thanh toan (chi can khi status = PAID).
     * Vi du: CREDIT_CARD, MOMO, ZALOPAY, BANK_TRANSFER, MANUAL
     */
    private String paymentMethod;

    /**
     * Ghi chu them (ly do huy, ly do that bai, v.v.)
     */
    private String note;
}
