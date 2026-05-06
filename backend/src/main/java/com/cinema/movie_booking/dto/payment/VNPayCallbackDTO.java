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
public class VNPayCallbackDTO {

    // Ma phan hoi giao dich: "00" = thanh cong, khac = that bai
    private String vnp_ResponseCode;

    // Ma trang thai giao dich: "00" = thanh cong
    private String vnp_TransactionStatus;

    // Ma giao dich tham chieu (bookingCode ma he thong gui len)
    private String vnp_TxnRef;

    // Ma giao dich tai VNPAY
    private String vnp_TransactionNo;

    // So tien giao dich (da nhan 100)
    private String vnp_Amount;

    // Ma ngan hang xu ly
    private String vnp_BankCode;

    // Loai the
    private String vnp_CardType;

    // Thoi gian thanh toan (yyyyMMddHHmmss)
    private String vnp_PayDate;

    // Thong tin don hang
    private String vnp_OrderInfo;

    // Ma Terminal
    private String vnp_TmnCode;

    // Chu ky bao mat HMAC-SHA512
    private String vnp_SecureHash;

    // Phien ban API
    private String vnp_Version;
}
