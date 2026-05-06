package com.cinema.movie_booking.repository;

import com.cinema.movie_booking.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Find payment by booking ID
     */
    Optional<Payment> findByBooking_BookingId(Long bookingId);

    /**
     * Check if payment exists for a booking
     */
    boolean existsByBooking_BookingId(Long bookingId);

    /**
     * Find payment by payment code
     */
    Optional<Payment> findByPaymentCode(String paymentCode);

    /**
     * Find payment by VNPAY transaction ID (vnp_TransactionNo)
     */
    Optional<Payment> findByTransactionId(String transactionId);

    /**
     * Find all payments by status
     */
    java.util.List<Payment> findByStatus(String status);
}
