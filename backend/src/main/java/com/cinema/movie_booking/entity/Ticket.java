package com.cinema.movie_booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Long ticketId;

    @Column(name = "ticket_code", unique = true, length = 20)
    private String ticketCode; // Mã vé

    @Column(name = "qr_code", length = 500)
    private String qrCode; // Mã QR

    @Column(name = "status", length = 20)
    private String status; // VALID, USED, CANCELLED

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime; // Thời gian check-in

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_detail_id", nullable = false)
    private BookingDetail bookingDetail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
