package com.cinema.movie_booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "promo_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promo_code_id")
    private Long promoCodeId;

    @Column(name = "code", unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "discount_type", length = 20)
    private String discountType; // PERCENTAGE, FIXED_AMOUNT

    @Column(name = "discount_value")
    private Double discountValue;

    @Column(name = "min_order_amount")
    private Double minOrderAmount;

    @Column(name = "max_discount_amount")
    private Double maxDiscountAmount;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "used_count")
    private Integer usedCount = 0;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "promoCode", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public double calculateDiscount(double totalAmount) {

        LocalDateTime now = LocalDateTime.now();

        // 1. Kiểm tra trạng thái
        if (!Boolean.TRUE.equals(isActive)) {
            throw new IllegalArgumentException("Promo code is not active");
        }

        if (startDate != null && now.isBefore(startDate)) {
            throw new IllegalArgumentException("Promo code not started yet");
        }

        if (endDate != null && now.isAfter(endDate)) {
            throw new IllegalArgumentException("Promo code has expired");
        }

        if (maxUses != null && usedCount != null && usedCount >= maxUses) {
            throw new IllegalArgumentException("Promo code usage limit reached");
        }

        // 2. Kiểm tra điều kiện đơn hàng tối thiểu
        if (minOrderAmount != null && totalAmount < minOrderAmount) {
            return 0;
        }

        double discount = 0;

        // 3. Tính giảm giá
        if ("PERCENTAGE".equalsIgnoreCase(discountType)) {

            discount = totalAmount * discountValue / 100;

            // Giới hạn giảm tối đa
            if (maxDiscountAmount != null) {
                discount = Math.min(discount, maxDiscountAmount);
            }

        } else if ("FIXED_AMOUNT".equalsIgnoreCase(discountType)) {

            discount = discountValue;

        }

        // 4. Không cho giảm quá tổng tiền
        return Math.min(discount, totalAmount);
    }
}
