package com.cinema.movie_booking.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.movie_booking.config.VNPayConfig;
import com.cinema.movie_booking.dto.payment.PaymentResponseDTO;
import com.cinema.movie_booking.entity.Booking;
import com.cinema.movie_booking.entity.BookingDetail;
import com.cinema.movie_booking.entity.Payment;
import com.cinema.movie_booking.entity.Ticket;
import com.cinema.movie_booking.enums.BookingStatus;
import com.cinema.movie_booking.exception.BadRequestException;
import com.cinema.movie_booking.exception.ResourceNotFoundException;
import com.cinema.movie_booking.repository.BookingDetailRepository;
import com.cinema.movie_booking.repository.BookingRepository;
import com.cinema.movie_booking.repository.PaymentRepository;
import com.cinema.movie_booking.repository.TicketRepository;
import com.cinema.movie_booking.service.PaymentService;
import com.cinema.movie_booking.util.VNPayUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final VNPayConfig vnPayConfig;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final TicketRepository ticketRepository;

    // =========================================================================
    // 1. Tao VNPAY Payment URL
    // =========================================================================

    @Override
    @Transactional
    public PaymentResponseDTO createVNPayPaymentUrl(Long bookingId, HttpServletRequest request) {

        // 1. Tim booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay booking: " + bookingId));

        // 2. Validate trang thai booking phai la PENDING
        if (!BookingStatus.PENDING.name().equals(booking.getStatus())) {
            throw new BadRequestException(
                    "Booking phai o trang thai PENDING de thanh toan. Trang thai hien tai: "
                            + booking.getStatus());
        }

        // 3. Kiem tra booking het han
        if (booking.getExpiryDate() != null && LocalDateTime.now().isAfter(booking.getExpiryDate())) {
            booking.setStatus(BookingStatus.CANCELLED.name());
            bookingRepository.save(booking);
            throw new BadRequestException("Booking da het han. Vui long dat ve lai.");
        }

        // 4. Tao hoac reset Payment record
        if (!paymentRepository.existsByBooking_BookingId(bookingId)) {
            Payment payment = Payment.builder()
                    .paymentCode(generatePaymentCode())
                    .booking(booking)
                    .user(booking.getUser())
                    .amount(booking.getFinalAmount())
                    .paymentMethod("VNPAY")
                    .status("PENDING")
                    .paymentNote("Cho thanh toan qua VNPAY")
                    .build();
            paymentRepository.save(payment);
            log.info("[Payment] Da tao Payment PENDING cho booking {}", booking.getBookingCode());
        } else {
            // User retry: neu payment truoc do FAILED thi reset ve PENDING
            paymentRepository.findByBooking_BookingId(bookingId).ifPresent(p -> {
                if ("FAILED".equals(p.getStatus())) {
                    p.setStatus("PENDING");
                    paymentRepository.save(p);
                    log.info("[Payment] Reset Payment FAILED -> PENDING cho booking {}", booking.getBookingCode());
                }
            });
        }

        // 5. Build VNPAY params map
        LocalDateTime now = LocalDateTime.now();
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", VNPayUtil.formatAmount(booking.getFinalAmount()));
        vnpParams.put("vnp_BankCode", "NCB");
        vnpParams.put("vnp_CurrCode", vnPayConfig.getCurrCode());
        vnpParams.put("vnp_IpAddr", VNPayUtil.getClientIp(request));
        vnpParams.put("vnp_Locale", vnPayConfig.getLocale());
        vnpParams.put("vnp_OrderInfo", "thanhtoan" + booking.getBookingCode());
        vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_ExpireDate", VNPayUtil.formatDate(now.plusMinutes(15)));

        vnpParams.put("vnp_TxnRef", booking.getBookingCode());

        vnpParams.put("vnp_CreateDate", VNPayUtil.formatDate(now));

        String hashData = VNPayUtil.buildHashData(vnpParams);
        String secureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);
        String queryString = VNPayUtil.buildQueryString(vnpParams);

        String paymentUrl = vnPayConfig.getPaymentUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        return PaymentResponseDTO.builder()
                .paymentUrl(paymentUrl)
                .status("PENDING")
                .bookingCode(booking.getBookingCode())
                .amount(booking.getFinalAmount())
                .message("Vui long chuyen huong sang VNPAY de thanh toan")
                .build();
    }

    // =========================================================================
    // 2. Xu ly IPN — server-to-server tu VNPAY
    // Day la handler chinh cap nhat DB
    // =========================================================================

    @Override
    @Transactional
    public String handleVNPayIPN(Map<String, String> params) {

        log.info("================[IPN] Nhan IPN: {} params", params.size());
        params.forEach((k, v) -> log.info("[IPN] Param: {}={}", k, v));

        if (!isValidVNPayParams(params)) {
            log.warn("[IPN] Co params ngoai VNPAY standard: {}", params.keySet());
            return buildIpnResponse("98", "Invalid Params");
        }

        if (!VNPayUtil.verifyChecksum(params, vnPayConfig.getHashSecret())) {
            log.warn("[IPN] Checksum khong hop le!");
            return buildIpnResponse("97", "Invalid Checksum");
        }

        // 2. Tim booking theo TxnRef (= bookingCode)
        String bookingCode = params.get("vnp_TxnRef");
        Optional<Booking> bookingOpt = bookingRepository.findByBookingCode(bookingCode);
        if (bookingOpt.isEmpty()) {
            log.warn("[IPN] Khong tim thay booking: {}", bookingCode);
            return buildIpnResponse("01", "Order not found");
        }
        Booking booking = bookingOpt.get();

        // 3. Validate so tien (chong gian lan)
        String amountStr = params.get("vnp_Amount");
        if (amountStr == null || amountStr.isEmpty()) {
            return buildIpnResponse("04", "Invalid Amount");
        }
        long vnpAmount = Long.parseLong(amountStr);
        long expectedAmount = (long) (booking.getFinalAmount() * 100);
        if (vnpAmount != expectedAmount) {
            log.warn("[IPN] So tien khong khop. Expected: {}, Received: {}", expectedAmount, vnpAmount);
            return buildIpnResponse("04", "Invalid Amount");
        }

        // 4. Idempotency — tranh xu ly 2 lan neu VNPAY goi IPN nhieu lan
        if (BookingStatus.PAID.name().equals(booking.getStatus())) {
            log.info("[IPN] Booking {} da PAID truoc do, bo qua", bookingCode);
            return buildIpnResponse("02", "Order already confirmed");
        }

        // 5. Xu ly theo ket qua giao dich
        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        String transactionNo = params.get("vnp_TransactionNo");

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            processPaymentSuccess(booking, transactionNo, params);
            log.info("[IPN] THANH CONG: booking={}, transactionNo={}", bookingCode, transactionNo);
        } else {
            processPaymentFailed(booking, transactionNo, responseCode);
            log.info("[IPN] THAT BAI: booking={}, responseCode={}", bookingCode, responseCode);
        }

        // VNPAY yeu cau luon tra "00" neu da xu ly xong (du thanh cong hay that bai)
        return buildIpnResponse("00", "Confirm Success");
    }

    // =========================================================================
    // 3. Xu ly Return URL — VNPAY redirect user ve frontend
    // Chi tra ket qua, khong cap nhat DB (IPN da xu ly)
    // =========================================================================

    @Override
    public PaymentResponseDTO handleVNPayReturn(Map<String, String> params) {

        log.info("[Return] Nhan Return URL: {} params", params.size());
        params.forEach((k, v) -> log.info("[Return] Param: {}={}", k, v));

        // 0. FIX #1: Validate chi co VNPAY params (vnp_*)
        if (!isValidVNPayParams(params)) {
            log.warn("[Return] Co params ngoai VNPAY standard: {}", params.keySet());
            return PaymentResponseDTO.builder()
                    .status("FAILED")
                    .responseCode("98")
                    .message("Params khong hop le.")
                    .build();
        }

        // 1. Verify checksum
        if (!VNPayUtil.verifyChecksum(params, vnPayConfig.getHashSecret())) {
            log.warn("[Return] Checksum khong hop le!");
            return PaymentResponseDTO.builder()
                    .status("FAILED")
                    .responseCode("97")
                    .message("Chu ky khong hop le. Vui long lien he ho tro.")
                    .build();
        }

        String responseCode = params.get("vnp_ResponseCode");
        String bookingCode = params.get("vnp_TxnRef");
        String transactionNo = params.get("vnp_TransactionNo");
        String bankCode = params.get("vnp_BankCode");
        String cardType = params.get("vnp_CardType");

        double amount = 0;
        String amountStr = params.get("vnp_Amount");
        if (amountStr != null && !amountStr.isEmpty()) {
            amount = Long.parseLong(amountStr) / 100.0;
        }

        if ("00".equals(responseCode)) {
            Booking booking = bookingRepository.findByBookingCode(bookingCode).orElse(null);
            if (booking != null && BookingStatus.PENDING.name().equals(booking.getStatus())) {
                processPaymentSuccess(booking, transactionNo, params);
            }
            return PaymentResponseDTO.builder()
                    .status("COMPLETED")
                    .bookingCode(bookingCode)
                    .transactionId(transactionNo)
                    .amount(amount)
                    .bankCode(bankCode)
                    .cardType(cardType)
                    .responseCode(responseCode)
                    .message("Thanh toan thanh cong!")
                    .build();
        } else {
            return PaymentResponseDTO.builder()
                    .status("FAILED")
                    .bookingCode(bookingCode)
                    .transactionId(transactionNo)
                    .amount(amount)
                    .bankCode(bankCode)
                    .cardType(cardType)
                    .responseCode(responseCode)
                    .message(getVNPayErrorMessage(responseCode))
                    .build();
        }
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    // Cap nhat DB khi thanh toan thanh cong
    private void processPaymentSuccess(Booking booking, String transactionNo, Map<String, String> params) {

        // Cap nhat booking -> PAID
        booking.setStatus(BookingStatus.PAID.name());
        bookingRepository.save(booking);

        // Cap nhat hoac tao Payment record -> COMPLETED
        Payment payment = paymentRepository.findByBooking_BookingId(booking.getBookingId())
                .orElse(Payment.builder()
                        .paymentCode(generatePaymentCode())
                        .booking(booking)
                        .user(booking.getUser())
                        .amount(booking.getFinalAmount())
                        .paymentMethod("VNPAY")
                        .build());

        payment.setStatus("COMPLETED");
        payment.setTransactionId(transactionNo);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentNote("VNPAY thanh cong. Bank: " + params.getOrDefault("vnp_BankCode", "N/A"));
        paymentRepository.save(payment);

        // Tao Tickets cho cac BookingDetail
        createTicketsForBooking(booking);
    }

    // Cap nhat DB khi thanh toan that bai
    private void processPaymentFailed(Booking booking, String transactionNo, String responseCode) {

        // Chi cap nhat neu booking van con PENDING
        if (BookingStatus.PENDING.name().equals(booking.getStatus())) {
            booking.setStatus(BookingStatus.FAILED.name());
            bookingRepository.save(booking);
        }

        // Cap nhat Payment record -> FAILED
        paymentRepository.findByBooking_BookingId(booking.getBookingId()).ifPresent(payment -> {
            payment.setStatus("FAILED");
            payment.setTransactionId(transactionNo);
            payment.setPaymentNote("Thanh toan that bai. ResponseCode: " + responseCode);
            paymentRepository.save(payment);
        });
    }

    // Tao Ticket cho moi BookingDetail chua co ticket
    private void createTicketsForBooking(Booking booking) {
        List<BookingDetail> details = bookingDetailRepository
                .findByBooking_BookingId(booking.getBookingId());

        int created = 0;
        for (BookingDetail detail : details) {
            if (!ticketRepository.existsByBookingDetail_BookingDetailId(detail.getBookingDetailId())) {
                Ticket ticket = Ticket.builder()
                        .ticketCode(generateTicketCode())
                        .qrCode(generateQrCode(booking.getBookingCode(), detail.getBookingDetailId()))
                        .status("VALID")
                        .bookingDetail(detail)
                        .build();
                ticketRepository.save(ticket);
                created++;
            }
        }
        log.info("[Payment] Da tao {} ticket cho booking {}", created, booking.getBookingCode());
    }

    // Build IPN response JSON theo chuan VNPAY
    private String buildIpnResponse(String rspCode, String message) {
        return "{\"RspCode\":\"" + rspCode + "\",\"Message\":\"" + message + "\"}";
    }

    // Ma loi VNPAY -> thong bao tieng Viet
    private String getVNPayErrorMessage(String responseCode) {
        return switch (responseCode) {
            case "07" -> "Giao dich bi nghi ngo gian lan.";
            case "09" -> "The/Tai khoan chua dang ky dich vu InternetBanking.";
            case "10" -> "Xac thuc that bai qua 3 lan. The bi khoa.";
            case "11" -> "Da het han cho thanh toan. Vui long thu lai.";
            case "12" -> "The/Tai khoan bi khoa.";
            case "13" -> "Sai mat khau OTP. Vui long thu lai.";
            case "24" -> "Khach hang huy giao dich.";
            case "51" -> "Tai khoan khong du so du de thuc hien giao dich.";
            case "65" -> "Tai khoan vuot qua han muc giao dich trong ngay.";
            case "75" -> "Ngan hang thanh toan dang bao tri.";
            case "79" -> "Sai mat khau thanh toan qua so lan quy dinh. The bi khoa.";
            case "97" -> "Chu ky bao mat khong hop le.";
            case "98" -> "Tham so gui len khong hop le.";
            default -> "Giao dich that bai. Ma loi: " + responseCode;
        };
    }

    // FIX #1: Validate chi co VNPAY standard params (vnp_*)
    private boolean isValidVNPayParams(Map<String, String> params) {
        return params.keySet().stream().allMatch(key -> key.startsWith("vnp_") ||
                key.equals("vnp_SecureHashType") ||
                key.equals("vnp_SecureHash"));
    }

    private String generatePaymentCode() {
        return "PAY" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private String generateTicketCode() {
        return "TK" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private String generateQrCode(String bookingCode, Long bookingDetailId) {
        return "QR_" + bookingCode + "_" + bookingDetailId;
    }
}
