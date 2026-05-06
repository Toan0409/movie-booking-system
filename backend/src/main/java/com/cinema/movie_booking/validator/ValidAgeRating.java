package com.cinema.movie_booking.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Annotation để kiểm tra độ tuổi phim hợp lệ
 * Các giá trị hợp lệ (Việt Nam): P, K, T13, T16, T18, C
 * Các giá trị hợp lệ (MPAA): G, PG, PG-13, R, NC-17
 */
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AgeRatingValidator.class)
@Documented
public @interface ValidAgeRating {
    String message() default "Độ tuổi không hợp lệ. Các giá trị hợp lệ: P, K, T13, T16, T18, C";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
