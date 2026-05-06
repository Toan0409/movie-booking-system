package com.cinema.movie_booking.service.impl;

import com.cinema.movie_booking.dto.user.UserRequestDTO;
import com.cinema.movie_booking.dto.user.UserResponseDTO;
import com.cinema.movie_booking.entity.User;
import com.cinema.movie_booking.enums.Role;
import com.cinema.movie_booking.exception.BadRequestException;
import com.cinema.movie_booking.exception.ResourceNotFoundException;
import com.cinema.movie_booking.repository.UserRepository;
import com.cinema.movie_booking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {
        // Kiem tra username da ton tai chua
        if (userRepository.existsByUsername(requestDTO.getUsername())) {
            throw new BadRequestException("Ten dang nhap da ton tai: " + requestDTO.getUsername());
        }

        // Kiem tra email da ton tai chua
        if (userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new BadRequestException("Email da ton tai: " + requestDTO.getEmail());
        }

        // Tao user moi
        User user = new User();
        user.setUsername(requestDTO.getUsername());
        user.setEmail(requestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        user.setFullName(requestDTO.getFullName());
        user.setPhone(requestDTO.getPhone());
        user.setRole(requestDTO.getRole() != null ? requestDTO.getRole() : Role.CUSTOMER);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        return mapToResponseDTO(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nguoi dung voi id: " + id));
        return mapToResponseDTO(user);
    }

    @Override
    public UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nguoi dung voi id: " + id));

        // Kiem tra username co thay doi va da ton tai chua
        if (!user.getUsername().equals(requestDTO.getUsername())
                && userRepository.existsByUsername(requestDTO.getUsername())) {
            throw new BadRequestException("Ten dang nhap da ton tai: " + requestDTO.getUsername());
        }

        // Kiem tra email co thay doi va da ton tai chua
        if (!user.getEmail().equals(requestDTO.getEmail())
                && userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new BadRequestException("Email da ton tai: " + requestDTO.getEmail());
        }

        user.setUsername(requestDTO.getUsername());
        user.setEmail(requestDTO.getEmail());

        // Chi cap nhat password neu duoc cung cap
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }

        user.setFullName(requestDTO.getFullName());
        user.setPhone(requestDTO.getPhone());

        if (requestDTO.getRole() != null) {
            user.setRole(requestDTO.getRole());
        }

        User updatedUser = userRepository.save(user);
        return mapToResponseDTO(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nguoi dung voi id: " + id));

        // Soft delete - vo hieu hoa nguoi dung
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    public UserResponseDTO activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nguoi dung voi id: " + id));

        user.setIsActive(true);
        User updatedUser = userRepository.save(user);
        return mapToResponseDTO(updatedUser);
    }

    @Override
    public UserResponseDTO deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nguoi dung voi id: " + id));

        user.setIsActive(false);
        User updatedUser = userRepository.save(user);
        return mapToResponseDTO(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private UserResponseDTO mapToResponseDTO(User user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getIsActive(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
