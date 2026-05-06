package com.cinema.movie_booking.dto.movie;

import com.cinema.movie_booking.validator.ValidAgeRating;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieRequestDTO {

    @NotBlank(message = "Title không được để trống")
    @Size(max = 200, message = "Title không được vượt quá 200 ký tự")
    private String title;

    @Size(max = 200, message = "Original title không được vượt quá 200 ký tự")
    private String originalTitle;

    private String description;

    @Positive(message = "Duration phải là số dương")
    private Integer duration;

    @Size(max = 500, message = "Poster URL không được vượt quá 500 ký tự")
    private String posterUrl;

    @Size(max = 500, message = "Trailer URL không được vượt quá 500 ký tự")
    private String trailerUrl;

    private LocalDate releaseDate;

    private LocalDate endDate;

    @Positive(message = "Rating phải là số dương")
    private Double rating;

    @ValidAgeRating
    private String ageRating;

    private Boolean isNowShowing;

    private Boolean isComingSoon;

    private Boolean isFeatured;

    private Long genreId;

    private Long directorId;

    private List<Long> actorIds;
}
