package com.cinema.movie_booking.service.impl;

import com.cinema.movie_booking.dto.booking.BookingResponseDTO;
import com.cinema.movie_booking.dto.booking.UpdateBookingStatusRequestDTO;
import com.cinema.movie_booking.entity.*;
import com.cinema.movie_booking.enums.BookingStatus;
import com.cinema.movie_booking.exception.InvalidStatusTransitionException;
import com.cinema.movie_booking.exception.ResourceNotFoundException;
import com.cinema.movie_booking.mapper.BookingMapper;
import com.cinema.movie_booking.repository.*;
import com.cinema.movie_booking.service.BookingStatusService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Implementation xu ly logic cap nhat trang thai Booking.
 *
 * Luong xu ly chinh:
 * 1. Tim Booking theo ID, throw ResourceNotFoundException neu khong ton tai
 * 2. Kiem tra booking co het han khong (auto-expire)
 * 3. Validate chuyen trang thai theo rule
 * 4. Thuc hien side effects (giai phong ghe, tao Ticket, luu Payment)
 * 5. Luu trang thai moi
 * 6. Ghi log lich su thay doi
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingStatusServiceImpl implements BookingStatusService {

    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final PaymentRepository paymentRepository;

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    @Override
    @Transactional
    public BookingResponseDTO updateBookingStatus(Long bookingId,
            UpdateBookingStatusRequestDTO request,
            String changedBy) {

        log.info("[BookingStatus] Admin '{}' dang cap nhat booking #{} sang trang thai {}",
                changedBy, bookingId, request.getStatus());

        // 1. Tim booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Khong tim thay booking voi ID: " + bookingId));

        // 2. Kiem tra va xu ly auto-expire truoc khi validate
        checkAndAutoExpire(booking, changedBy);

        // 3. Lay trang thai hien tai
        BookingStatus currentStatus = parseStatus(booking.getStatus(), bookingId);
        BookingStatus newStatus = request.getStatus();

        // 4. Validate chuyen trang thai
        if (!currentStatus.canTransitionTo(newStatus)) {
            log.warn("[BookingStatus] Chuyen trang thai khong hop le: booking #{} tu {} sang {}",
                    bookingId, currentStatus, newStatus);
            throw new InvalidStatusTransitionException(currentStatus, newStatus);
        }

        String oldStatus = booking.getStatus();

        // 5. Thuc hien side effects theo trang thai moi
        switch (newStatus) {
            case PAID -> handlePaidTransition(booking, request);
            case CANCELLED -> handleCancelledTransition(booking);
            case FAILED -> handleFailedTransition(booking);
            default -> {
                /* PENDING: khong co side effect */ }
        }

        // 6. Cap nhat trang thai booking
        booking.setStatus(newStatus.name());
        bookingRepository.save(booking);

        return BookingMapper.toBookingResponseDTO(booking);
    }

    /**
     * Scheduled task: tu dong huy cac booking PENDING da het han.
     * Chay moi 1 phut de kiem tra.
     *
     * FIX BUG-6:
     * - Dung query DB truc tiep thay vi load ALL PENDING vao memory
     * - Re-check status truoc khi cancel de tranh race condition
     * - Xu ly tung booking doc lap (khong dung @Transactional chung)
     */
    @Override
    @Scheduled(fixedDelay = 60_000)
    public void autoExpireBookings() {
        // FIX BUG-6a: Query truc tiep DB voi dieu kien expiry_date < NOW()
        List<Booking> expiredBookings = bookingRepository.findExpiredPendingBookings(LocalDateTime.now());

        if (expiredBookings.isEmpty()) {
            return;
        }

        log.info("[AutoExpire] Tim thay {} booking PENDING da het han, dang huy...",
                expiredBookings.size());

        for (Booking booking : expiredBookings) {
            try {
                expireSingleBooking(booking);
            } catch (Exception e) {
                log.error("[AutoExpire] Loi khi huy booking #{}: {}",
                        booking.getBookingId(), e.getMessage(), e);
            }
        }
    }

    /**
     * FIX BUG-6b: Xu ly expire tung booking trong transaction rieng biet.
     * Neu 1 booking loi, cac booking khac van duoc xu ly binh thuong.
     */
    @Transactional
    public void expireSingleBooking(Booking booking) {
        Booking freshBooking = bookingRepository.findById(booking.getBookingId())
                .orElse(null);

        if (freshBooking == null) {
            log.warn("[AutoExpire] Booking #{} khong con ton tai, bo qua", booking.getBookingId());
            return;
        }

        // FIX BUG-6c: Chi cancel neu van con PENDING (tranh cancel booking da PAID)
        if (!BookingStatus.PENDING.name().equals(freshBooking.getStatus())) {
            log.warn("[AutoExpire] Booking #{} da doi trang thai thanh {}, bo qua",
                    freshBooking.getBookingId(), freshBooking.getStatus());
            return;
        }

        freshBooking.setStatus(BookingStatus.CANCELLED.name());
        bookingRepository.save(freshBooking);
        log.info("[AutoExpire] Da huy booking #{} (het han luc {})",
                freshBooking.getBookingId(), freshBooking.getExpiryDate());
    }

    // =========================================================================
    // PRIVATE HELPERS — Side Effects
    // =========================================================================

    /**
     * Xu ly khi chuyen sang PAID:
     * - Tao Ticket cho moi BookingDetail (neu chua co)
     * - Luu Payment record
     *
     * FIX BUG-5: Da xoa occupySeats() call.
     * - occupySeats() set isAvailable=false global → sai thiet ke
     * - Seat status PAID duoc xac dinh qua BookingDetail query, khong qua
     * isAvailable
     */
    private void handlePaidTransition(Booking booking, UpdateBookingStatusRequestDTO request) {
        log.debug("[BookingStatus] Xu ly PAID cho booking #{}", booking.getBookingId());

        // Tao tickets
        createTicketsForBooking(booking);

        // Luu payment (neu chua co)
        if (!paymentRepository.existsByBooking_BookingId(booking.getBookingId())) {
            String method = (request.getPaymentMethod() != null
                    && !request.getPaymentMethod().isBlank())
                            ? request.getPaymentMethod()
                            : "MANUAL";

            Payment payment = Payment.builder()
                    .paymentCode(generatePaymentCode())
                    .booking(booking)
                    .user(booking.getUser())
                    .amount(booking.getFinalAmount())
                    .paymentMethod(method)
                    .status("COMPLETED")
                    .transactionId(UUID.randomUUID().toString())
                    .paymentDate(LocalDateTime.now())
                    .paymentNote(request.getNote())
                    .build();

            paymentRepository.save(payment);
            log.debug("[BookingStatus] Da luu Payment cho booking #{}", booking.getBookingId());
            // FIX BUG-5: KHONG goi occupySeats() - seat status PAID duoc xac dinh qua
            // BookingDetail
        } else {
            log.warn("[BookingStatus] Payment da ton tai cho booking #{}, bo qua tao moi",
                    booking.getBookingId());
        }
    }

    /**
     * Xu ly khi chuyen sang CANCELLED:
     * - Giai phong ghe (set isAvailable = true)
     * - Huy cac Ticket lien quan (neu co)
     */
    private void handleCancelledTransition(Booking booking) {
        log.debug("[BookingStatus] Xu ly CANCELLED cho booking #{}", booking.getBookingId());
        releaseSeats(booking);
        cancelTickets(booking);
    }

    /**
     * Xu ly khi chuyen sang FAILED:
     * - Giai phong ghe (set isAvailable = true)
     */
    private void handleFailedTransition(Booking booking) {
        log.debug("[BookingStatus] Xu ly FAILED cho booking #{}", booking.getBookingId());
        releaseSeats(booking);
    }

    /**
     * FIX BUG-3 + BUG-4: Khong thay doi seat.isAvailable khi release.
     *
     * Ly do:
     * - isAvailable chi dung cho admin-disabled seats (permanent flag)
     * - Seat availability theo showtime duoc xac dinh qua BookingDetail query
     * - Neu set isAvailable=true, se vo tinh re-enable ghe bi admin disable
     * - PENDING booking khong thay doi isAvailable, nen release la no-op
     *
     * Chi ghi log de tracking, khong thay doi DB.
     */
    private void releaseSeats(Booking booking) {
        List<BookingDetail> details = bookingDetailRepository.findByBooking_BookingId(booking.getBookingId());

        if (details.isEmpty()) {
            log.warn("[BookingStatus] Booking #{} khong co booking detail nao",
                    booking.getBookingId());
            return;
        }

        // FIX BUG-3/4: KHONG set isAvailable=true
        // Seat availability duoc xac dinh boi BookingDetail.status (PAID/PENDING)
        // isAvailable chi dung cho admin-disabled seats
        log.info("[BookingStatus] Booking #{} da huy - {} ghe duoc giai phong (qua BookingDetail query)",
                booking.getBookingId(), details.size());
    }

    /**
     * FIX BUG-3: Da xoa occupySeats() vi no set isAvailable=false global.
     *
     * Van de cu:
     * - occupySeats() set seat.isAvailable=false cho tat ca ghe trong booking PAID
     * - isAvailable la global flag → ghe bi block cho TAT CA suất chiếu khac
     * - Vi du: Ghe A1 dat cho suat 10h → isAvailable=false → khong the dat cho suat
     * 14h
     *
     * Giai phap: Seat availability theo showtime duoc xac dinh qua:
     * BookingDetailRepository.existsByShowtimeIdAndSeatId() → check PAID/PENDING
     * SeatServiceImpl.getSeatAvailability() → dung BookingDetail, khong dung
     * isAvailable
     */
    // occupySeats() DA BI XOA - FIX BUG-3

    /**
     * Tao Ticket cho moi BookingDetail chua co ticket.
     */
    private void createTicketsForBooking(Booking booking) {
        List<BookingDetail> details = bookingDetailRepository.findByBooking_BookingId(booking.getBookingId());

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
                log.debug("[BookingStatus] Da tao Ticket {} cho BookingDetail #{}",
                        ticket.getTicketCode(), detail.getBookingDetailId());
            }
        }
        log.info("[BookingStatus] Da tao {} ticket cho booking #{}", created, booking.getBookingId());
    }

    /**
     * Huy cac Ticket lien quan den booking (set status = CANCELLED).
     */
    private void cancelTickets(Booking booking) {
        List<Ticket> tickets = ticketRepository.findByBookingDetail_Booking_BookingId(booking.getBookingId());

        if (!tickets.isEmpty()) {
            tickets.forEach(t -> t.setStatus("CANCELLED"));
            ticketRepository.saveAll(tickets);
            log.info("[BookingStatus] Da huy {} ticket cua booking #{}",
                    tickets.size(), booking.getBookingId());
        }
    }

    // =========================================================================
    // PRIVATE HELPERS — Auto Expire
    // =========================================================================

    /**
     * Kiem tra neu booking PENDING da het han thi tu dong chuyen sang CANCELLED.
     *
     * FIX BUG-8: Throw BookingExpiredException sau khi auto-expire de caller biet
     * ro rang.
     * Truoc day: khong throw → caller tiep tuc →
     * InvalidStatusTransitionException(CANCELLED→X)
     * → error message gay nham lan cho client.
     */
    private void checkAndAutoExpire(Booking booking, String changedBy) {
        if (BookingStatus.PENDING.name().equals(booking.getStatus())
                && booking.getExpiryDate() != null
                && LocalDateTime.now().isAfter(booking.getExpiryDate())) {

            log.info("[BookingStatus] Booking #{} da het han (expiryDate: {}), tu dong huy",
                    booking.getBookingId(), booking.getExpiryDate());

            booking.setStatus(BookingStatus.CANCELLED.name());
            bookingRepository.save(booking);

            // FIX BUG-8: Throw exception ro rang thay vi de caller nhan
            // InvalidStatusTransitionException
            throw new com.cinema.movie_booking.exception.BadRequestException(
                    "Booking #" + booking.getBookingId() + " da het han luc "
                            + booking.getExpiryDate() + " va da bi tu dong huy.");
        }
    }

    // =========================================================================
    // PRIVATE HELPERS — Logging & Code Generation
    // =========================================================================

    private BookingStatus parseStatus(String statusStr, Long bookingId) {
        try {
            return BookingStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            log.error("[BookingStatus] Booking #{} co trang thai khong hop le trong DB: '{}'",
                    bookingId, statusStr);
            throw new com.cinema.movie_booking.exception.BadRequestException(
                    "Trang thai hien tai cua booking khong hop le: " + statusStr);
        }
    }

    private String generateTicketCode() {
        return "TK" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private String generatePaymentCode() {
        return "PAY" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private String generateQrCode(String bookingCode, Long bookingDetailId) {
        return "QR_" + bookingCode + "_" + bookingDetailId;
    }
}
