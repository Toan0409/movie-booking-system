package com.cinema.movie_booking.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.movie_booking.dto.showtime.ShowtimeRequestDTO;
import com.cinema.movie_booking.dto.showtime.ShowtimeResponseDTO;
import com.cinema.movie_booking.entity.Movie;
import com.cinema.movie_booking.entity.Showtime;
import com.cinema.movie_booking.entity.Theater;
import com.cinema.movie_booking.exception.BadRequestException;
import com.cinema.movie_booking.exception.ResourceNotFoundException;
import com.cinema.movie_booking.mapper.ShowtimeMapper;
import com.cinema.movie_booking.repository.MovieRepository;
import com.cinema.movie_booking.repository.ShowtimeRepository;
import com.cinema.movie_booking.repository.TheaterRepository;
import com.cinema.movie_booking.service.ShowtimeService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ShowtimeService with business logic
 */
@Slf4j
@Service
@AllArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;

    @Override
    @Transactional
    public ShowtimeResponseDTO create(ShowtimeRequestDTO request) {
        log.info("Creating new showtime for movie: {}, theater: {}", request.getMovieId(), request.getTheaterId());

        // 1. Validate movie exists
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with ID: " + request.getMovieId()));

        // 2. Validate theater exists
        Theater theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found with ID: " + request.getTheaterId()));

        // 3. Validate theater is active
        if (Boolean.FALSE.equals(theater.getIsActive())) {
            throw new BadRequestException("Cannot create showtime for inactive theater");
        }

        // 4. Validate movie is now showing
        if (Boolean.FALSE.equals(movie.getIsNowShowing())) {
            throw new BadRequestException("Movie is not currently showing");
        }

        // 5. Calculate end time if not provided
        LocalDateTime endTime = request.getEndTime();
        if (endTime == null && movie.getDuration() != null) {
            endTime = request.getStartTime().plusMinutes(movie.getDuration());
        }

        // 6. Validate start time is before end time
        if (endTime != null && !request.getStartTime().isBefore(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }

        // 7. Check for overlapping showtimes in the same theater
        List<Showtime> overlapping = showtimeRepository.findOverlappingShowtimes(
                request.getTheaterId(),
                request.getStartTime(),
                endTime
        );

        if (!overlapping.isEmpty()) {
            throw new BadRequestException("Theater has overlapping showtime at this time");
        }

        // 8. Create and save showtime
        Showtime showtime = ShowtimeMapper.toEntity(request, movie, theater);
        showtime = showtimeRepository.save(showtime);

        log.info("Created showtime with ID: {}", showtime.getShowtimeId());
        return ShowtimeMapper.toDTO(showtime);
    }

    @Override
    @Transactional
    public ShowtimeResponseDTO update(Long id, ShowtimeRequestDTO request) {
        log.info("Updating showtime with ID: {}", id);

        // 1. Find existing showtime
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found with ID: " + id));

        // 2. Check if showtime has bookings - prevent modification if tickets booked
        if (showtime.getBookings() != null && !showtime.getBookings().isEmpty()) {
            throw new BadRequestException("Cannot update showtime - tickets have already been booked");
        }

        // 3. Validate movie exists (if changed)
        Movie movie = showtime.getMovie();
        if (request.getMovieId() != null && !request.getMovieId().equals(movie.getMovieId())) {
            movie = movieRepository.findById(request.getMovieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Movie not found with ID: " + request.getMovieId()));
        }

        // 4. Validate theater exists (if changed)
        Theater theater = showtime.getTheater();
        if (request.getTheaterId() != null && !request.getTheaterId().equals(theater.getTheaterId())) {
            theater = theaterRepository.findById(request.getTheaterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Theater not found with ID: " + request.getTheaterId()));

            if (Boolean.FALSE.equals(theater.getIsActive())) {
                throw new BadRequestException("Cannot move showtime to inactive theater");
            }
        }

        // 5. Calculate new end time
        LocalDateTime newStartTime = request.getStartTime() != null ? request.getStartTime() : showtime.getStartTime();
        LocalDateTime newEndTime = request.getEndTime() != null ? request.getEndTime() : showtime.getEndTime();

        if (newEndTime == null && movie.getDuration() != null) {
            newEndTime = newStartTime.plusMinutes(movie.getDuration());
        }

        // 6. Validate start time is before end time
        if (newEndTime != null && !newStartTime.isBefore(newEndTime)) {
            throw new BadRequestException("Start time must be before end time");
        }

        // 7. Check for overlapping showtimes (excluding current one)
        List<Showtime> overlapping = showtimeRepository.findOverlappingShowtimesExcluding(
                theater.getTheaterId(),
                newStartTime,
                newEndTime,
                id
        );

        if (!overlapping.isEmpty()) {
            throw new BadRequestException("Theater has overlapping showtime at this time");
        }

        // 8. Update showtime
        ShowtimeMapper.updateEntity(showtime, request, movie, theater);
        showtime = showtimeRepository.save(showtime);

        log.info("Updated showtime with ID: {}", id);
        return ShowtimeMapper.toDTO(showtime);
    }

    @Override
    public ShowtimeResponseDTO getById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found with ID: " + id));
        return ShowtimeMapper.toDTO(showtime);
    }

    @Override
    public Page<ShowtimeResponseDTO> getAll(Pageable pageable) {
        return showtimeRepository.findAll(pageable)
                .map(ShowtimeMapper::toDTO);
    }

    @Override
    public Page<ShowtimeResponseDTO> getActiveShowtimes(Pageable pageable) {
        return showtimeRepository.findByIsActiveTrue(pageable)
                .map(ShowtimeMapper::toDTO);
    }

    @Override
    public List<ShowtimeResponseDTO> getByMovieId(Long movieId) {
        // Verify movie exists
        if (!movieRepository.existsById(movieId)) {
            throw new ResourceNotFoundException("Movie not found with ID: " + movieId);
        }

        return showtimeRepository.findByMovieMovieIdAndIsActiveTrue(movieId)
                .stream()
                .map(ShowtimeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShowtimeResponseDTO> getByTheaterId(Long theaterId) {
        // Verify theater exists
        if (!theaterRepository.existsById(theaterId)) {
            throw new ResourceNotFoundException("Theater not found with ID: " + theaterId);
        }

        return showtimeRepository.findByTheaterTheaterIdAndIsActiveTrue(theaterId)
                .stream()
                .map(ShowtimeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShowtimeResponseDTO> getByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return showtimeRepository.findActiveShowtimesByDate(startOfDay, endOfDay)
                .stream()
                .map(ShowtimeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShowtimeResponseDTO> getByMovieAndDate(Long movieId, LocalDate date) {
        // Verify movie exists
        if (!movieRepository.existsById(movieId)) {
            throw new ResourceNotFoundException("Movie not found with ID: " + movieId);
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return showtimeRepository.findByMovieAndDate(movieId, startOfDay, endOfDay)
                .stream()
                .map(ShowtimeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        log.info("Deactivating showtime with ID: {}", id);

        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found with ID: " + id));

        showtime.setIsActive(false);
        showtimeRepository.save(showtime);

        log.info("Deactivated showtime with ID: {}", id);
    }

    @Override
    @Transactional
    public ShowtimeResponseDTO activate(Long id) {
        log.info("Activating showtime with ID: {}", id);

        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found with ID: " + id));

        // Check for overlapping showtimes when activating
        List<Showtime> overlapping = showtimeRepository.findOverlappingShowtimesExcluding(
                showtime.getTheater().getTheaterId(),
                showtime.getStartTime(),
                showtime.getEndTime(),
                id
        );

        if (!overlapping.isEmpty()) {
            throw new BadRequestException("Cannot activate showtime - theater has overlapping showtime at this time");
        }

        showtime.setIsActive(true);
        showtime = showtimeRepository.save(showtime);

        log.info("Activated showtime with ID: {}", id);
        return ShowtimeMapper.toDTO(showtime);
    }
}

