package com.cinema.movie_booking.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.cinema.movie_booking.dto.director.DirectorRequestDTO;
import com.cinema.movie_booking.dto.director.DirectorResponseDTO;
import com.cinema.movie_booking.entity.Director;
import com.cinema.movie_booking.mapper.DirectorMapper;
import com.cinema.movie_booking.repository.DirectorRepository;
import com.cinema.movie_booking.service.DirectorService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DirectorServiceImpl implements DirectorService {

    private final DirectorRepository directorRepository;

    @Override
    public DirectorResponseDTO createDirector(DirectorRequestDTO requestDTO) {
        String name = requestDTO.getName();
        if (directorRepository.existsByName(name)) {
            throw new IllegalArgumentException("Ten dao dien da ton tai");
        }
        Director director = DirectorMapper.toEntity(requestDTO);
        return DirectorMapper.toDTO(directorRepository.save(director));
    }

    @Override
    public Page<DirectorResponseDTO> getAllDirectors(String keyword, Pageable pageable) {
        Page<Director> page;
        if (keyword != null && !keyword.isBlank()) {
            page = directorRepository.findByNameContainingIgnoreCase(keyword, pageable);
        } else {
            page = directorRepository.findAll(pageable);
        }
        return page.map(DirectorMapper::toDTO);

    }

    @Override
    public DirectorResponseDTO getDirectorById(Long id) {
        Director director = directorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay dao dien"));
        return DirectorMapper.toDTO(director);
    }

    @Override
    public DirectorResponseDTO updateDirector(Long id, DirectorRequestDTO requestDTO) {
        // TODO Auto-generated method stub
        Director director = directorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay dao dien"));
        String newName = requestDTO.getName();
        if (!director.getName().equalsIgnoreCase(newName) && directorRepository.existsByName(newName)) {
            throw new IllegalArgumentException("Ten dao dien da ton tai");
        }

        director.setName(newName);
        director.setBiography(requestDTO.getBiography());
        if (requestDTO.getBirthDate() != null) {
            director.setBirthDate(requestDTO.getBirthDate());
        }
        director.setImageUrl(requestDTO.getImageUrl());
        director.setNationality(requestDTO.getNationality());
        return DirectorMapper.toDTO(directorRepository.save(director));
    }

    @Override
    public void deleteDirector(Long id) {
        Director director = directorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay dao dien"));
        directorRepository.delete(director);

    }

}
