package com.cinema.movie_booking.exception;

import com.cinema.movie_booking.dto.api.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler xu ly tat ca exception trong ung dung
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        /**
         * Xu ly ResourceNotFoundException
         */
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(
                        ResourceNotFoundException ex, WebRequest request) {
                logger.error("Resource not found: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Xu ly BadRequestException
         */
        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadRequestException(
                        BadRequestException ex, WebRequest request) {
                logger.error("Bad request: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Xu ly InvalidStatusTransitionException (chuyen trang thai Booking sai rule)
         * HTTP 422 Unprocessable Entity - request hop le nhung logic nghiep vu khong
         * cho phep
         */
        @ExceptionHandler(InvalidStatusTransitionException.class)
        public ResponseEntity<ApiResponse<Void>> handleInvalidStatusTransitionException(
                        InvalidStatusTransitionException ex, WebRequest request) {
                logger.error("Invalid status transition: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Xu ly loi khi request body chua enum khong hop le (vi du: "status":
         * "INVALID_VALUE")
         */
        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadableException(
                        HttpMessageNotReadableException ex, WebRequest request) {
                logger.error("Message not readable: {}", ex.getMessage());
                String message = "Du lieu request khong hop le. Kiem tra lai gia tri enum (PENDING, PAID, FAILED, CANCELLED).";
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(message));
        }

        /**
         * Xu ly validation errors
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
                        MethodArgumentNotValidException ex) {
                logger.error("Validation error: {}", ex.getMessage());

                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getAllErrors().forEach((error) -> {
                        String fieldName = ((FieldError) error).getField();
                        String errorMessage = error.getDefaultMessage();
                        errors.put(fieldName, errorMessage);
                });

                ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                                .success(false)
                                .message("Du lieu khong hop le")
                                .data(errors)
                                .build();

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        /**
         * Xu ly UnauthorizedException (sai thong tin dang nhap / token khong hop le)
         */
        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ApiResponse<Void>> handleUnauthorizedException(
                        UnauthorizedException ex, WebRequest request) {
                logger.error("Unauthorized: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Xu ly AuthenticationException cua Spring Security
         */
        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
                        AuthenticationException ex, WebRequest request) {
                logger.error("Authentication failed: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error("Xac thuc that bai: " + ex.getMessage()));
        }

        /**
         * Xu ly AccessDeniedException (khong co quyen truy cap)
         */
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
                        AccessDeniedException ex, WebRequest request) {
                logger.error("Access denied: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error("Khong co quyen truy cap tai nguyen nay"));
        }

        /**
         * Xu ly tat ca cac exception khac
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleGlobalException(
                        Exception ex, WebRequest request) {
                logger.error("Internal server error: ", ex);

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error("Loi he thong: " + ex.getMessage()));
        }
}
