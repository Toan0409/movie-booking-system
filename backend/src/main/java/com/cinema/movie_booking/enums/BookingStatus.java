package com.cinema.movie_booking.enums;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Enum định nghĩa các trạng thái của đơn đặt vé (Booking).
 *
 * Luồng chuyển trạng thái hợp lệ:
 *   PENDING  → PAID
 *   PENDING  → CANCELLED
 *   PENDING  → FAILED
 *   FAILED   → CANCELLED
 *
 * Không cho phép:
 *   PAID     → PENDING
 *   PAID     → CANCELLED  (trừ khi có refund — xử lý riêng)
 *   CANCELLED → bất kỳ trạng thái nào (terminal state)
 */
public enum BookingStatus {

    /** Chờ thanh toán */
    PENDING,

    /** Đã thanh toán thành công */
    PAID,

    /** Thanh toán thất bại */
    FAILED,

    /** Đã hủy */
    CANCELLED;

    // ===== Transition map =====
    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED_TRANSITIONS =
            new EnumMap<>(BookingStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(PENDING,    EnumSet.of(PAID, CANCELLED, FAILED));
        ALLOWED_TRANSITIONS.put(FAILED,     EnumSet.of(CANCELLED));
        ALLOWED_TRANSITIONS.put(PAID,       EnumSet.noneOf(BookingStatus.class));
        ALLOWED_TRANSITIONS.put(CANCELLED,  EnumSet.noneOf(BookingStatus.class));
    }

    /**
     * Kiểm tra xem có thể chuyển sang trạng thái {@code next} không.
     *
     * @param next trạng thái đích
     * @return {@code true} nếu chuyển trạng thái hợp lệ
     */
    public boolean canTransitionTo(BookingStatus next) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, EnumSet.noneOf(BookingStatus.class))
                                  .contains(next);
    }

    /**
     * Trả về tập hợp các trạng thái có thể chuyển đến từ trạng thái hiện tại.
     */
    public Set<BookingStatus> getAllowedNextStatuses() {
        return ALLOWED_TRANSITIONS.getOrDefault(this, EnumSet.noneOf(BookingStatus.class));
    }

    /**
     * Kiểm tra đây có phải trạng thái cuối (terminal) không.
     * Terminal state = không thể chuyển sang bất kỳ trạng thái nào khác.
     */
    public boolean isTerminal() {
        return ALLOWED_TRANSITIONS.getOrDefault(this, EnumSet.noneOf(BookingStatus.class)).isEmpty();
    }
}
