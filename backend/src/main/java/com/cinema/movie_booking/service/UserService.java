package com.cinema.movie_booking.service;

import com.cinema.movie_booking.dto.user.UserRequestDTO;
import com.cinema.movie_booking.dto.user.UserResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserResponseDTO createUser(UserRequestDTO requestDTO);

    Page<UserResponseDTO> getAllUsers(Pageable pageable);

    UserResponseDTO getUserById(Long id);

    UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO);

    void deleteUser(Long id);

    UserResponseDTO activateUser(Long id);

    UserResponseDTO deactivateUser(Long id);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
