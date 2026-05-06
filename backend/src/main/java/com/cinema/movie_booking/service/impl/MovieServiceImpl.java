package com.cinema.movie_booking.service.impl;

import com.cinema.movie_booking.dto.movie.MovieRequestDTO;
import com.cinema.movie_booking.dto.movie.MovieResponseDTO;
import com.cinema.movie_booking.entity.Actor;
import com.cinema.movie_booking.entity.Director;
import com.cinema.movie_booking.entity.Genre;
import com.cinema.movie_booking.entity.Movie;
import com.cinema.movie_booking.exception.ResourceNotFoundException;
import com.cinema.movie_booking.repository.ActorRepository;
import com.cinema.movie_booking.repository.DirectorRepository;
import com.cinema.movie_booking.repository.GenreRepository;
import com.cinema.movie_booking.repository.MovieRepository;
import com.cinema.movie_booking.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation của MovieService
 * Xử lý các nghiệp vụ liên quan đến Movie
 */
@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final DirectorRepository directorRepository;
    private final ActorRepository actorRepository;

    @Override
    @Transactional
    public MovieResponseDTO createMovie(MovieRequestDTO requestDTO) {
        if (movieRepository.existsByTitleAndIsDeletedFalse(requestDTO.getTitle())) {
            throw new IllegalArgumentException("Movie with title '" + requestDTO.getTitle() + "' already exists");
        }

        Movie movie = Movie.builder()
                .title(requestDTO.getTitle())
                .originalTitle(requestDTO.getOriginalTitle())
                .description(requestDTO.getDescription())
                .duration(requestDTO.getDuration())
                .posterUrl(requestDTO.getPosterUrl())
                .trailerUrl(requestDTO.getTrailerUrl())
                .releaseDate(requestDTO.getReleaseDate())
                .endDate(requestDTO.getEndDate())
                .rating(requestDTO.getRating())
                .ageRating(requestDTO.getAgeRating())
                .isNowShowing(requestDTO.getIsNowShowing() != null ? requestDTO.getIsNowShowing() : false)
                .isComingSoon(requestDTO.getIsComingSoon() != null ? requestDTO.getIsComingSoon() : false)
                .isFeatured(requestDTO.getIsFeatured() != null ? requestDTO.getIsFeatured() : false)
                .isDeleted(false)
                .build();

        // Set Genre if provided
        if (requestDTO.getGenreId() != null) {
            Genre genre = genreRepository.findById(requestDTO.getGenreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Genre", "id", requestDTO.getGenreId()));
            movie.setGenre(genre);
        }

        // Set Director if provided
        if (requestDTO.getDirectorId() != null) {
            Director director = directorRepository.findById(requestDTO.getDirectorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Director", "id", requestDTO.getDirectorId()));
            movie.setDirector(director);
        }

        // Set Actors if provided
        if (requestDTO.getActorIds() != null && !requestDTO.getActorIds().isEmpty()) {
            List<Actor> actors = actorRepository.findAllById(requestDTO.getActorIds());
            movie.setActors(actors);
        }

        Movie savedMovie = movieRepository.save(movie);
        return mapToResponseDTO(savedMovie);
    }

    @Override
    public Page<MovieResponseDTO> getAllMovies(Pageable pageable) {
        return movieRepository.findByIsDeletedFalse(pageable)
                .map(this::mapToResponseDTO);
    }

    @Override
    public MovieResponseDTO getMovieById(Long id) {
        Movie movie = movieRepository.findByMovieIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", id));
        return mapToResponseDTO(movie);
    }

    @Override
    @Transactional
    public MovieResponseDTO updateMovie(Long id, MovieRequestDTO requestDTO) {
        Movie movie = movieRepository.findByMovieIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", id));

        movie.setTitle(requestDTO.getTitle());
        movie.setOriginalTitle(requestDTO.getOriginalTitle());
        movie.setDescription(requestDTO.getDescription());
        movie.setDuration(requestDTO.getDuration());
        movie.setPosterUrl(requestDTO.getPosterUrl());
        movie.setTrailerUrl(requestDTO.getTrailerUrl());
        movie.setReleaseDate(requestDTO.getReleaseDate());
        movie.setEndDate(requestDTO.getEndDate());
        movie.setRating(requestDTO.getRating());
        movie.setAgeRating(requestDTO.getAgeRating());

        if (requestDTO.getIsNowShowing() != null) {
            movie.setIsNowShowing(requestDTO.getIsNowShowing());
        }
        if (requestDTO.getIsComingSoon() != null) {
            movie.setIsComingSoon(requestDTO.getIsComingSoon());
        }
        if (requestDTO.getIsFeatured() != null) {
            movie.setIsFeatured(requestDTO.getIsFeatured());
        }

        // Update Genre if provided
        if (requestDTO.getGenreId() != null) {
            Genre genre = genreRepository.findById(requestDTO.getGenreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Genre", "id", requestDTO.getGenreId()));
            movie.setGenre(genre);
        }

        // Update Director if provided
        if (requestDTO.getDirectorId() != null) {
            Director director = directorRepository.findById(requestDTO.getDirectorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Director", "id", requestDTO.getDirectorId()));
            movie.setDirector(director);
        }

        // Update Actors if provided
        if (requestDTO.getActorIds() != null) {
            List<Actor> actors = actorRepository.findAllById(requestDTO.getActorIds());
            movie.setActors(actors);
        }

        Movie updatedMovie = movieRepository.save(movie);
        return mapToResponseDTO(updatedMovie);
    }

    @Override
    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findByMovieIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", id));

        // Soft delete - chỉ đánh dấu isDeleted = true
        movie.setIsDeleted(true);
        movieRepository.save(movie);
    }

    @Override
    @Transactional
    public MovieResponseDTO restoreMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", id));

        // Restore - đánh dấu isDeleted = false
        movie.setIsDeleted(false);
        Movie restoredMovie = movieRepository.save(movie);
        return mapToResponseDTO(restoredMovie);
    }

    @Override
    public Page<MovieResponseDTO> getMoviesNowShowing(Pageable pageable) {
        return movieRepository.findByIsNowShowingTrueAndIsDeletedFalse(pageable)
                .map(this::mapToResponseDTO);
    }

    @Override
    public Page<MovieResponseDTO> getMoviesComingSoon(Pageable pageable) {
        return movieRepository.findByIsComingSoonTrueAndIsDeletedFalse(pageable)
                .map(this::mapToResponseDTO);
    }

    @Override
    public Page<MovieResponseDTO> getFeaturedMovies(Pageable pageable) {
        return movieRepository.findByIsFeaturedTrueAndIsDeletedFalse(pageable)
                .map(this::mapToResponseDTO);
    }

    @Override
    public Page<MovieResponseDTO> searchMovies(String keyword, Pageable pageable) {
        return movieRepository.searchByTitle(keyword, pageable)
                .map(this::mapToResponseDTO);
    }

    @Override
    public Page<MovieResponseDTO> getMoviesByGenre(Long genreId, Pageable pageable) {
        return movieRepository.findByGenreGenreIdAndIsDeletedFalse(genreId, pageable)
                .map(this::mapToResponseDTO);
    }

    /**
     * Convert Movie entity sang MovieResponseDTO
     */
    private MovieResponseDTO mapToResponseDTO(Movie movie) {
        MovieResponseDTO.MovieResponseDTOBuilder builder = MovieResponseDTO.builder()
                .movieId(movie.getMovieId())
                .title(movie.getTitle())
                .originalTitle(movie.getOriginalTitle())
                .description(movie.getDescription())
                .duration(movie.getDuration())
                .posterUrl(movie.getPosterUrl())
                .trailerUrl(movie.getTrailerUrl())
                .releaseDate(movie.getReleaseDate())
                .endDate(movie.getEndDate())
                .rating(movie.getRating())
                .ageRating(movie.getAgeRating())
                .isNowShowing(movie.getIsNowShowing())
                .isComingSoon(movie.getIsComingSoon())
                .isFeatured(movie.getIsFeatured())
                .isDeleted(movie.getIsDeleted())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt());

        // Map Genre
        if (movie.getGenre() != null) {
            builder.genre(MovieResponseDTO.GenreDTO.builder()
                    .genreId(movie.getGenre().getGenreId())
                    .name(movie.getGenre().getName())
                    .build());
        }

        // Map Director
        if (movie.getDirector() != null) {
            builder.director(MovieResponseDTO.DirectorDTO.builder()
                    .directorId(movie.getDirector().getDirectorId())
                    .name(movie.getDirector().getName())
                    .build());
        }

        // Map Actors
        if (movie.getActors() != null && !movie.getActors().isEmpty()) {
            List<MovieResponseDTO.ActorDTO> actors = movie.getActors().stream()
                    .map(actor -> MovieResponseDTO.ActorDTO.builder()
                            .actorId(actor.getActorId())
                            .name(actor.getName())
                            .build())
                    .collect(Collectors.toList());
            builder.actors(actors);
        }

        return builder.build();
    }
}
