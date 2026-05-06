package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.showtime.ShowtimeRequestDTO;
import com.cinema.movie_booking.dto.showtime.ShowtimeResponseDTO;
import com.cinema.movie_booking.entity.Movie;
import com.cinema.movie_booking.entity.Showtime;
import com.cinema.movie_booking.entity.Theater;

import java.time.LocalDateTime;

public class ShowtimeMapper {

    public static ShowtimeResponseDTO toDTO(Showtime showtime) {
        if (showtime == null) {
            return null;
        }

        return ShowtimeResponseDTO.builder()
                .showtimeId(showtime.getShowtimeId())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .price(showtime.getPrice())
                .showDate(showtime.getStartTime())
                .isActive(showtime.getIsActive())
                .createdAt(showtime.getCreatedAt())
                .updatedAt(showtime.getUpdatedAt())
                .movie(toMovieInfo(showtime.getMovie()))
                .theater(toTheaterInfo(showtime.getTheater()))
                .build();
    }

    /**
     * Convert ShowtimeRequestDTO to entity
     */
    public static Showtime toEntity(ShowtimeRequestDTO dto, Movie movie, Theater theater) {
        if (dto == null) {
            return null;
        }

        LocalDateTime endTime = dto.getEndTime();
        if (endTime == null && movie != null && movie.getDuration() != null) {
            endTime = dto.getStartTime().plusMinutes(movie.getDuration());
        }

        return Showtime.builder()
                .movie(movie)
                .theater(theater)
                .startTime(dto.getStartTime())
                .endTime(endTime)
                .price(dto.getPrice())
                .isActive(true)
                .build();
    }

    /**
     * Update existing showtime from request DTO
     */
    public static void updateEntity(Showtime showtime, ShowtimeRequestDTO dto, Movie movie, Theater theater) {
        if (dto == null || showtime == null) {
            return;
        }

        if (dto.getStartTime() != null) {
            showtime.setStartTime(dto.getStartTime());
        }

        if (dto.getEndTime() != null) {
            showtime.setEndTime(dto.getEndTime());
        } else if (movie != null && movie.getDuration() != null && dto.getStartTime() != null) {
            // Recalculate end time based on movie duration
            showtime.setEndTime(dto.getStartTime().plusMinutes(movie.getDuration()));
        }

        if (dto.getPrice() != null) {
            showtime.setPrice(dto.getPrice());
        }

        if (movie != null) {
            showtime.setMovie(movie);
        }

        if (theater != null) {
            showtime.setTheater(theater);
        }
    }

    /**
     * Convert Movie to nested MovieInfo DTO
     */
    private static ShowtimeResponseDTO.MovieInfo toMovieInfo(Movie movie) {
        if (movie == null) {
            return null;
        }

        return ShowtimeResponseDTO.MovieInfo.builder()
                .movieId(movie.getMovieId())
                .title(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .duration(movie.getDuration())
                .ageRating(movie.getAgeRating())
                .build();
    }

    /**
     * Convert Theater to nested TheaterInfo DTO
     */
    private static ShowtimeResponseDTO.TheaterInfo toTheaterInfo(Theater theater) {
        if (theater == null) {
            return null;
        }

        return ShowtimeResponseDTO.TheaterInfo.builder()
                .theaterId(theater.getTheaterId())
                .name(theater.getName())
                .theaterType(theater.getTheaterType() != null ? theater.getTheaterType().name() : null)
                .totalSeats(theater.getTotalSeats())
                .build();
    }
}
