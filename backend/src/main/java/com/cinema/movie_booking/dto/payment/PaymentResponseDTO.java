package com.cinema.movie_booking.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {

    // URL chuyen huong sang VNPAY (dung khi tao payment)
    private String paymentUrl;

    // Trang thai thanh toan: PENDING, COMPLETED, FAILED
    private String status;

    // Ma booking lien quan
    private String bookingCode;

    // Ma giao dich tu VNPAY (vnp_TransactionNo)
    private String transactionId;

    // So tien thanh toan
    private Double amount;

    // Thong bao ket qua
    private String message;

    // Ma phan hoi tu VNPAY (00 = thanh cong)
    private String responseCode;

    // Ma ngan hang xu ly giao dich
    private String bankCode;

    // Loai the / phuong thuc thanh toan
    private String cardType;
}
