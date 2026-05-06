package com.cinema.movie_booking.service.impl;

import java.util.List;

import org.hibernate.query.Page;
import org.springframework.stereotype.Service;

import com.cinema.movie_booking.dto.cinema.CinemaRequestDTO;
import com.cinema.movie_booking.dto.cinema.CinemaResponseDTO;
import com.cinema.movie_booking.entity.Cinema;
import com.cinema.movie_booking.mapper.CinemaMapper;
import com.cinema.movie_booking.repository.CinemaRepository;
import com.cinema.movie_booking.service.CinemaService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CinemaServiceImpl implements CinemaService {
    private final CinemaRepository cinemaRepository;

    @Override
    public CinemaResponseDTO createCinema(CinemaRequestDTO requestDTO) {
        String name = requestDTO.getName();
        if (cinemaRepository.existsByName(name)) {
            throw new IllegalArgumentException("Ten rap da ton tai");
        }
        Cinema cinema = CinemaMapper.toEntity(requestDTO);
        return CinemaMapper.toDTO(cinemaRepository.save(cinema));
    }

    @Override
    public CinemaResponseDTO getCinemaById(Long cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay rap"));
        return CinemaMapper.toDTO(cinema);

    }

    @Override
    public List<CinemaResponseDTO> getAllCinemas() {
        List<Cinema> cinemas = cinemaRepository.findAll();
        return cinemas.stream().map(CinemaMapper::toDTO).toList();

    }

    @Override
    public CinemaResponseDTO updateCinema(Long cinemaId, CinemaRequestDTO requestDTO) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay rap"));
        if (!cinema.getName().equals(requestDTO.getName()) && cinemaRepository.existsByName(requestDTO.getName())) {
            throw new IllegalArgumentException("Ten rap da ton tai");
        }
        cinema.setName(requestDTO.getName());
        cinema.setIsActive(requestDTO.getIsActive());
        cinema.setCity(requestDTO.getCity());
        cinema.setAddress(requestDTO.getAddress());
        cinema.setPhone(requestDTO.getPhone());
        cinema.setEmail(requestDTO.getEmail());
        cinema.setDescription(requestDTO.getDescription());
        cinema.setImageUrl(requestDTO.getImageUrl());
        cinema.setDistrict(cinema.getDistrict());
        return CinemaMapper.toDTO(cinemaRepository.save(cinema));
    }

    @Override
    public void deleteCinema(Long cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay rap"));
        cinema.setIsActive(false);
        cinemaRepository.save(cinema);

    }

    @Override
    public List<CinemaResponseDTO> searchCinemasByName(String keyword) {
        List<Cinema> cinemas;
        if (keyword != null && !keyword.isBlank()) {
            cinemas = cinemaRepository.findByNameContainingIgnoreCase(keyword);
        } else {
            cinemas = cinemaRepository.findAll();
        }
        return cinemas.stream().map(CinemaMapper::toDTO).toList();
    }

    @Override
    public List<CinemaResponseDTO> getCinemasByCity(String city) {
        List<Cinema> cinemas = cinemaRepository.findByCityContainingIgnoreCase(city);
        return cinemas.stream().map(CinemaMapper::toDTO).toList();
    }

    @Override
    public List<CinemaResponseDTO> getActiveCinemas() {
        List<Cinema> cinemas = cinemaRepository.findByIsActiveTrue();
        return cinemas.stream().map(CinemaMapper::toDTO).toList();
    }

    @Override
    @Transactional
    public CinemaResponseDTO restoreCinema(Long cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay rap"));
        cinema.setIsActive(true);
        cinemaRepository.save(cinema);
        return CinemaMapper.toDTO(cinema);
    }

}
