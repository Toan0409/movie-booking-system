package com.cinema.movie_booking.dto.movie;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho response trả về thông tin phim
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MovieResponseDTO {

    private Long movieId;
    private String title;
    private String originalTitle;
    private String description;
    private Integer duration;
    private String posterUrl;
    private String trailerUrl;
    private LocalDate releaseDate;
    private LocalDate endDate;
    private Double rating;
    private String ageRating;
    private Boolean isNowShowing;
    private Boolean isComingSoon;
    private Boolean isFeatured;
    private Boolean isDeleted;

    private GenreDTO genre;
    private DirectorDTO director;
    private List<ActorDTO> actors;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * DTO cho thể loại phim
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class GenreDTO {
        private Long genreId;
        private String name;
    }

    /**
     * DTO cho đạo diễn
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DirectorDTO {
        private Long directorId;
        private String name;
    }

    /**
     * DTO cho diễn viên
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ActorDTO {
        private Long actorId;
        private String name;
    }
}
