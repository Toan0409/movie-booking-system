package com.cinema.movie_booking.dto.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

/**
 * Response chuan cho API
 * 
 * @param <T> kieu du lieu tra ve
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Builder.Default
    private boolean success = true;

    private String message;

    private T data;

    private PagingInfo paging;

    /**
     * Tao response thanh cong
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Thanh cong")
                .data(data)
                .build();
    }

    /**
     * Tao response thanh cong voi message
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * Tao response loi
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }

    /**
     * Tao response voi phan trang
     */
    public static <T> ApiResponse<T> success(T data, PagingInfo paging) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Thanh cong")
                .data(data)
                .paging(paging)
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PagingInfo {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}
