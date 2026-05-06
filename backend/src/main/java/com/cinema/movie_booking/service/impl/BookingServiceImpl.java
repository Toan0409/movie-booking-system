package com.cinema.movie_booking.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.movie_booking.dto.booking.BookingRequestDTO;
import com.cinema.movie_booking.dto.booking.BookingResponseDTO;
import com.cinema.movie_booking.entity.*;
import com.cinema.movie_booking.enums.BookingStatus;
import com.cinema.movie_booking.exception.BadRequestException;
import com.cinema.movie_booking.exception.ResourceNotFoundException;
import com.cinema.movie_booking.exception.SeatAlreadyBookedException;
import com.cinema.movie_booking.mapper.BookingMapper;
import com.cinema.movie_booking.repository.*;
import com.cinema.movie_booking.service.BookingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final BookingRepository bookingRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final SeatRepository seatRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final TicketRepository ticketRepository;

    @Override
    @Transactional
    public BookingResponseDTO createBooking(Long userId, BookingRequestDTO request) {

        // ===== 1. Validate =====
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found"));

        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new IllegalArgumentException("Seat list is empty");
        }

        // ===== 2. Lock seats =====
        List<Seat> seats = seatRepository.findAllByIdForUpdate(request.getSeatIds());

        if (seats.size() != request.getSeatIds().size()) {
            throw new ResourceNotFoundException("Some seats not found");
        }

        // ===== 3. Check seat availability =====
        for (Seat seat : seats) {
            if (Boolean.FALSE.equals(seat.getIsAvailable())) {
                throw new SeatAlreadyBookedException(
                        "Seat is disabled by admin: " + seat.getSeatCode() + " (ID: " + seat.getSeatId() + ")");
            }

            // Kiểm tra ghế đã được đặt cho suất chiếu này chưa (PAID hoặc PENDING)
            boolean isBooked = bookingDetailRepository
                    .existsByShowtimeIdAndSeatId(showtime.getShowtimeId(), seat.getSeatId());

            if (isBooked) {
                throw new SeatAlreadyBookedException(
                        "Seat already booked: " + seat.getSeatCode() + " (ID: " + seat.getSeatId() + ")");
            }
        }

        // ===== 4. Calculate price =====
        double totalAmount = seats.stream()
                .mapToDouble(seat -> showtime.getPrice() * seat.getSeatType().getPriceMultiplier())
                .sum();

        double discountAmount = 0;
        PromoCode promo = null;

        // ===== 5. Apply promo =====
        if (request.getPromoCodeId() != null) {

            promo = promoCodeRepository.findById(request.getPromoCodeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Promo code not found"));

            discountAmount = promo.calculateDiscount(totalAmount);

            promo.setUsedCount(promo.getUsedCount() + 1);
            promoCodeRepository.save(promo);
        }

        double finalAmount = Math.max(totalAmount - discountAmount, 0);

        // ===== 6. Create booking =====
        Booking booking = Booking.builder()
                .bookingCode(generateBookingCode())
                .user(user)
                .showtime(showtime)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status("PENDING")
                .quantity(seats.size())
                .bookingDate(LocalDateTime.now())
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .promoCode(promo)
                .notes(request.getNotes())
                .build();

        bookingRepository.save(booking);

        // ===== 7. Create booking details =====
        List<BookingDetail> details = new ArrayList<>();

        for (Seat seat : seats) {

            double price = showtime.getPrice() * seat.getSeatType().getPriceMultiplier();

            BookingDetail detail = BookingDetail.builder()
                    .booking(booking)
                    .seat(seat)
                    .unitPrice(price)
                    .quantity(1)
                    .subtotal(price)
                    .build();

            details.add(detail);
        }

        bookingDetailRepository.saveAll(details);
        booking.setBookingDetails(details);

        return BookingMapper.toBookingResponseDTO(booking);
    }

    @Override
    public BookingResponseDTO getBookingByCode(String bookingCode) {

        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        return BookingMapper.toBookingResponseDTO(booking);
    }

    @Override
    public List<BookingResponseDTO> getUserBookings(Long userId) {

        List<Booking> bookings = bookingRepository.findByUser_UserId(userId);

        return bookings.stream()
                .map(BookingMapper::toBookingResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public void cancelBooking(String bookingCode) {

        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        BookingStatus currentStatus;
        try {
            currentStatus = BookingStatus.valueOf(booking.getStatus());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái booking không hợp lệ: " + booking.getStatus());
        }

        // FIX BUG-1: canTransitionTo() kiểm tra PAID/CANCELLED đều không thể cancel
        if (!currentStatus.canTransitionTo(BookingStatus.CANCELLED)) {
            throw new IllegalStateException(
                    "Không thể hủy booking ở trạng thái: " + booking.getStatus()
                            + ". Chỉ có thể hủy khi PENDING hoặc FAILED.");
        }

        // FIX BUG-2: Hủy tickets liên quan (nếu có)
        cancelTicketsForBooking(booking);

        log.info("[CancelBooking] Booking {} đã được hủy (trạng thái cũ: {})",
                bookingCode, booking.getStatus());

        booking.setStatus(BookingStatus.CANCELLED.name());
        bookingRepository.save(booking);
    }

    /**
     * Hủy tất cả tickets liên quan đến booking.
     * NOTE: Không thay đổi seat.isAvailable vì PENDING booking không thay đổi
     * isAvailable.
     * isAvailable chỉ dùng cho admin-disabled seats (FIX BUG-3/4).
     */
    private void cancelTicketsForBooking(Booking booking) {
        List<Ticket> tickets = ticketRepository
                .findByBookingDetail_Booking_BookingId(booking.getBookingId());
        if (!tickets.isEmpty()) {
            tickets.forEach(t -> t.setStatus("CANCELLED"));
            ticketRepository.saveAll(tickets);
            log.info("[CancelBooking] Đã hủy {} ticket của booking {}",
                    tickets.size(), booking.getBookingCode());
        }
    }

    private String generateBookingCode() {
        String code;
        do {
            code = "BK" + System.currentTimeMillis();
        } while (bookingRepository.existsByBookingCode(code));
        return code;
    }

    
}