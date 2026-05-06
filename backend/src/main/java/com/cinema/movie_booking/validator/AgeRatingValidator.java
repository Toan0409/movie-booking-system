package com.cinema.movie_booking.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Validator kiểm tra độ tuổi phim
 */
public class AgeRatingValidator implements ConstraintValidator<ValidAgeRating, String> {

    private static final Set<String> VALID_RATINGS = new HashSet<>(
            Arrays.asList(
                    // Chuẩn phân loại phim Việt Nam (Thông tư 05/2023/TT-BVHTTDL)
                    "P",    // Phổ biến rộng rãi
                    "K",    // Dưới 13 tuổi cần có người giám hộ
                    "T13",  // Từ 13 tuổi trở lên
                    "T16",  // Từ 16 tuổi trở lên
                    "T18",  // Từ 18 tuổi trở lên
                    "C",    // Cấm phổ biến
                    // Chuẩn phân loại phim Mỹ (MPAA) - giữ lại để tương thích
                    "G", "PG", "PG-13", "R", "NC-17"));

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // Cho phép null - sử dụng @NotBlank riêng nếu cần
        if (value == null || value.isEmpty()) {
            return true;
        }
        return VALID_RATINGS.contains(value);
    }
}
