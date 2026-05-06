package com.cinema.movie_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.movie_booking.entity.BookingDetail;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, Long> {

        /**
         * Find all booking details by showtime ID
         * Used to determine seat availability for a specific showtime
         * Status PAID and PENDING are considered "active" (seat is occupied)
         */
        @Query("SELECT bd FROM BookingDetail bd " +
                        "JOIN bd.booking b " +
                        "WHERE b.showtime.showtimeId = :showtimeId " +
                        "AND b.status IN ('PAID', 'PENDING')")
        List<BookingDetail> findByShowtimeId(@Param("showtimeId") Long showtimeId);

        /**
         * Find all booking details by booking ID
         */
        List<BookingDetail> findByBooking_BookingId(Long bookingId);

        /**
         * Find booking detail by seat ID and showtime ID
         * Used to check if a specific seat is booked for a showtime
         */
        @Query("SELECT bd FROM BookingDetail bd " +
                        "JOIN bd.booking b " +
                        "WHERE bd.seat.seatId = :seatId " +
                        "AND b.showtime.showtimeId = :showtimeId " +
                        "AND b.status IN ('PAID', 'PENDING')")
        Optional<BookingDetail> findBySeatIdAndShowtimeId(
                        @Param("seatId") Long seatId,
                        @Param("showtimeId") Long showtimeId);

        /**
         * Check if a seat is booked for a showtime
         * Returns true if there's an active booking for this seat (PAID or PENDING)
         */
        @Query("SELECT CASE WHEN COUNT(bd) > 0 THEN true ELSE false END " +
                        "FROM BookingDetail bd " +
                        "JOIN bd.booking b " +
                        "WHERE bd.seat.seatId = :seatId " +
                        "AND b.showtime.showtimeId = :showtimeId " +
                        "AND b.status IN ('PAID', 'PENDING')")
        boolean existsByShowtimeIdAndSeatId(
                        @Param("showtimeId") Long showtimeId,
                        @Param("seatId") Long seatId);

        /**
         * Find all booking details by seat ID
         */
        List<BookingDetail> findBySeat_SeatId(Long seatId);
}
