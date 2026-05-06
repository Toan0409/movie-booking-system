package com.cinema.movie_booking.mapper;

import com.cinema.movie_booking.dto.movie.MovieRequestDTO;
import com.cinema.movie_booking.dto.movie.MovieResponseDTO;
import com.cinema.movie_booking.entity.Movie;
import org.mapstruct.*;

/**
 * Mapper chuyển đổi giữa Movie Entity và DTO
 * Sử dụng MapStruct để tự động generate code
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MovieMapper {

    /**
     * Chuyển đổi từ Entity sang Response DTO
     */
    @Mapping(target = "genre", expression = "java(mapGenre(movie.getGenre()))")
    @Mapping(target = "director", expression = "java(mapDirector(movie.getDirector()))")
    @Mapping(target = "actors", expression = "java(mapActors(movie.getActors()))")
    MovieResponseDTO toResponseDTO(Movie movie);

    /**
     * Chuyển đổi từ Request DTO sang Entity (cho create)
     */
    @Mapping(target = "movieId", ignore = true)
    @Mapping(target = "genre", ignore = true)
    @Mapping(target = "director", ignore = true)
    @Mapping(target = "actors", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    Movie toEntity(MovieRequestDTO requestDTO);

    /**
     * Cập nhật Entity từ Request DTO
     */
    @Mapping(target = "movieId", ignore = true)
    @Mapping(target = "genre", ignore = true)
    @Mapping(target = "director", ignore = true)
    @Mapping(target = "actors", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromDTO(MovieRequestDTO requestDTO, @MappingTarget Movie movie);

    // Helper methods cho nested objects
    default MovieResponseDTO.GenreDTO mapGenre(com.cinema.movie_booking.entity.Genre genre) {
        if (genre == null)
            return null;
        return MovieResponseDTO.GenreDTO.builder()
                .genreId(genre.getGenreId())
                .name(genre.getName())
                .build();
    }

    default MovieResponseDTO.DirectorDTO mapDirector(com.cinema.movie_booking.entity.Director director) {
        if (director == null)
            return null;
        return MovieResponseDTO.DirectorDTO.builder()
                .directorId(director.getDirectorId())
                .name(director.getName())
                .build();
    }

    default java.util.List<MovieResponseDTO.ActorDTO> mapActors(
            java.util.List<com.cinema.movie_booking.entity.Actor> actors) {
        if (actors == null || actors.isEmpty())
            return null;
        return actors.stream()
                .map(actor -> MovieResponseDTO.ActorDTO.builder()
                        .actorId(actor.getActorId())
                        .name(actor.getName())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}
