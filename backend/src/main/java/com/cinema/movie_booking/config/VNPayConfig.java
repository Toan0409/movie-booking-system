package com.cinema.movie_booking.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

// VNPAY Configuration — load tu application.properties voi prefix "vnpay"
// SECURITY: KHONG hardcode secret key trong code.
// SECURITY: KHONG hardcode secret key trong code.
//           Trong production, dung environment variable hoac Vault.
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "vnpay")
public class VNPayConfig {

    // Ma Terminal do VNPAY cap (sandbox: DEMO)
    private String tmnCode;

    // Secret key de tao chu ky HMAC-SHA512. KHONG log, KHONG expose ra ngoai.
    private String hashSecret;

    // URL cong thanh toan VNPAY
    private String paymentUrl;

    // URL redirect ve frontend sau khi thanh toan xong
    private String returnUrl;

    // URL nhan IPN notification tu VNPAY server
    private String ipnUrl;

    // Phien ban API VNPAY
    private String version;

    // Lenh thanh toan
    private String command;

    // Loai don hang
    private String orderType;

    // Ngon ngu hien thi tren VNPAY
    private String locale;

    // Ma tien te
    private String currCode;
}
