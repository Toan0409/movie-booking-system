package com.cinema.movie_booking.seeder;

import com.cinema.movie_booking.entity.User;
import com.cinema.movie_booking.enums.Role;
import com.cinema.movie_booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(0)
@RequiredArgsConstructor
public class UserSeeder implements CommandLineRunner {

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled)
            return;

        List<UserSeed> seeds = List.of(
                new UserSeed("admin", "admin@cinema.com", "admin123", "Admin System", "0900000001", Role.ADMIN),
                new UserSeed("staff", "staff@cinema.com", "staff123", "Cinema Staff", "0900000002", Role.STAFF),
                new UserSeed("customer", "customer@cinema.com", "customer123", "Nguyen Van Khach", "0900000003",
                        Role.CUSTOMER));

        int created = 0;
        for (UserSeed s : seeds) {
            if (userRepository.existsByUsername(s.username()))
                continue;
            User user = new User();
            user.setUsername(s.username());
            user.setEmail(s.email());
            user.setPassword(passwordEncoder.encode(s.password()));
            user.setFullName(s.fullName());
            user.setPhone(s.phone());
            user.setRole(s.role());
            user.setIsActive(true);
            userRepository.save(user);
            created++;
        }
    }

    private record UserSeed(String username, String email, String password,
            String fullName, String phone, Role role) {
    }
}
