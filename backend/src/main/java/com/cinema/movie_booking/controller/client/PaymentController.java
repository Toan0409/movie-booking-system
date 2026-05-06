package com.cinema.movie_booking.controller.client;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.movie_booking.dto.payment.PaymentResponseDTO;
import com.cinema.movie_booking.service.PaymentService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // POST /api/payment/vnpay/create?bookingId=X
    // Tao VNPAY payment URL — yeu cau JWT
    @PostMapping("/vnpay/create")
    public ResponseEntity<PaymentResponseDTO> createVNPayPayment(
            @RequestParam Long bookingId,
            HttpServletRequest request) {

        log.info("[PaymentController] Tao VNPAY URL cho bookingId={}", bookingId);
        PaymentResponseDTO response = paymentService.createVNPayPaymentUrl(bookingId, request);
        return ResponseEntity.ok(response);
    }

    // GET /api/payment/vnpay/ipn
    // VNPAY goi server-to-server sau khi giao dich hoan tat — KHONG yeu cau JWT
    // Phai tra JSON theo chuan VNPAY: {"RspCode":"00","Message":"..."}
    @GetMapping(value = "/vnpay/ipn", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleVNPayIPN(
            @RequestParam Map<String, String> params,
            HttpServletRequest request) {

        log.info("[PaymentController] Nhan IPN tu VNPAY: TxnRef={}", params.get("vnp_TxnRef"));
        String ipnResponse = paymentService.handleVNPayIPN(params);
        return ResponseEntity.ok(ipnResponse);
    }

    // GET /api/payment/vnpay/return
    // VNPAY redirect user ve day sau khi thanh toan — KHONG yeu cau JWT
    // Frontend doc response de hien thi trang success/fail
    @GetMapping("/vnpay/return")
    public ResponseEntity<PaymentResponseDTO> handleVNPayReturn(
            @RequestParam Map<String, String> params,
            HttpServletRequest request) {

        log.info("[PaymentController] Nhan Return URL: TxnRef={}, ResponseCode={}",
                params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"));

        PaymentResponseDTO response = paymentService.handleVNPayReturn(params);
        return ResponseEntity.ok(response);
    }

    // GET /api/payment/status?bookingCode=BKxxx
    // Kiem tra trang thai thanh toan (polling tu frontend)
    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getPaymentStatus(
            @RequestParam String bookingCode) {

        Map<String, String> result = new HashMap<>();
        result.put("bookingCode", bookingCode);
        result.put("message", "Su dung GET /api/bookings/{bookingCode} de kiem tra trang thai booking");
        return ResponseEntity.ok(result);
    }
}
