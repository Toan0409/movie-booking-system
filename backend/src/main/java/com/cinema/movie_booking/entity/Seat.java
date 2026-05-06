package com.cinema.movie_booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(name = "UK_seat_theater_row_number", columnNames = { "theater_id", "seat_row",
                "seat_number" }),
        @UniqueConstraint(name = "UK_seat_theater_code", columnNames = { "theater_id", "seat_code" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long seatId;

    @Column(name = "seat_row", nullable = false, length = 5)
    private String seatRow; // A, B, C, ...

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber; // 1, 2, 3, ...

    @Column(name = "seat_code", nullable = false, length = 10)
    private String seatCode; // A1, A2, B1, ...

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "is_couple_seat")
    private Boolean isCoupleSeat = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_type_id")
    private SeatType seatType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (seatCode == null && seatRow != null && seatNumber != null) {
            seatCode = seatRow + seatNumber;
        }
    }
}
