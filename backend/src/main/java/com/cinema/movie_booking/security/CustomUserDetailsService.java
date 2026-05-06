package com.cinema.movie_booking.security;

import com.cinema.movie_booking.entity.User;
import com.cinema.movie_booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * Custom UserDetailsService: load user từ database theo username hoặc email
 * Được Spring Security sử dụng trong quá trình xác thực
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Load user theo username hoặc email
     * Spring Security gọi method này khi xác thực
     *
     * @param usernameOrEmail username hoặc email
     * @return UserDetails
     * @throws UsernameNotFoundException nếu không tìm thấy user
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Tìm user theo username trước, nếu không có thì tìm theo email
        User user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() -> userRepository.findByEmail(usernameOrEmail)
                        .orElseThrow(() -> new UsernameNotFoundException(
                                "Không tìm thấy người dùng với username/email: " + usernameOrEmail)));

        // Kiểm tra tài khoản có bị vô hiệu hóa không
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UsernameNotFoundException("Tài khoản đã bị vô hiệu hóa: " + usernameOrEmail);
        }

        // Gán role dưới dạng GrantedAuthority với prefix ROLE_
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}
