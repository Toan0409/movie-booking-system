package com.cinema.movie_booking.repository;

import com.cinema.movie_booking.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    /**
     * Find ticket by booking detail ID
     */
    Optional<Ticket> findByBookingDetail_BookingDetailId(Long bookingDetailId);

    /**
     * Find all tickets by booking ID (via booking detail)
     */
    List<Ticket> findByBookingDetail_Booking_BookingId(Long bookingId);

    /**
     * Find ticket by ticket code
     */
    Optional<Ticket> findByTicketCode(String ticketCode);

    /**
     * Check if ticket exists for a booking detail
     */
    boolean existsByBookingDetail_BookingDetailId(Long bookingDetailId);
}
