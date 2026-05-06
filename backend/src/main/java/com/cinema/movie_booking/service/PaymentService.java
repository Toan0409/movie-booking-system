package com.cinema.movie_booking.service;

import java.util.Map;

import com.cinema.movie_booking.dto.payment.PaymentResponseDTO;

import jakarta.servlet.http.HttpServletRequest;

public interface PaymentService {

    // Tao VNPAY payment URL cho booking
    // Tra ve PaymentResponseDTO chua paymentUrl de frontend redirect
    PaymentResponseDTO createVNPayPaymentUrl(Long bookingId, HttpServletRequest request);

    // Xu ly IPN (Instant Payment Notification) tu VNPAY server
    // VNPAY goi endpoint nay server-to-server sau khi giao dich hoan tat
    // Tra ve JSON string theo chuan VNPAY: {"RspCode":"00","Message":"Confirm
    // Success"}
    String handleVNPayIPN(Map<String, String> params);

    // Xu ly Return URL — VNPAY redirect user ve sau khi thanh toan
    // Tra ve PaymentResponseDTO de frontend hien thi ket qua
    PaymentResponseDTO handleVNPayReturn(Map<String, String> params);
}
