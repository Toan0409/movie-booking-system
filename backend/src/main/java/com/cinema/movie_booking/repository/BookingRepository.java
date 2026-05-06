package com.cinema.movie_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.movie_booking.entity.Booking;
import com.cinema.movie_booking.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Find all bookings by showtime ID
     */
    List<Booking> findByShowtime_ShowtimeId(Long showtimeId);

    /**
     * Find booking by booking code
     */
    Optional<Booking> findByBookingCode(String bookingCode);

    /**
     * Check if booking exists for a showtime
     */
    boolean existsByShowtime_ShowtimeId(Long showtimeId);

    /**
     * Find all bookings by user ID
     */
    List<Booking> findByUser_UserId(Long userId);

    /**
     * Find all bookings by status
     */
    List<Booking> findByStatus(String status);

    /**
     * Find active bookings for a showtime (PAID or PENDING status)
     * FIX BUG-7: 'CONFIRMED' không tồn tại trong BookingStatus enum → đổi sang
     * PAID/PENDING
     */
    @Query("SELECT b FROM Booking b WHERE b.showtime.showtimeId = :showtimeId AND b.status IN ('PAID', 'PENDING')")
    List<Booking> findActiveBookingsByShowtimeId(@Param("showtimeId") Long showtimeId);

    /**
     * FIX BUG-6: Query trực tiếp DB để tìm PENDING bookings đã hết hạn.
     * Tránh load toàn bộ PENDING vào memory rồi filter trong Java.
     */
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.expiryDate IS NOT NULL AND b.expiryDate < :now")
    List<Booking> findExpiredPendingBookings(@Param("now") LocalDateTime now);

    List<Booking> findByUser(User user);

    boolean existsByBookingCode(String bookingCode);
}
