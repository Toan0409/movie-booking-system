package com.cinema.movie_booking.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
public class VNPayUtil {

    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private VNPayUtil() {
    }

    public static String buildHashData(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();

        try {
            for (String fieldName : fieldNames) {
                String value = params.get(fieldName);
                if (value != null && !value.isEmpty()) {

                    if (hashData.length() > 0) {
                        hashData.append("&");
                    }

                    hashData.append(fieldName);
                    hashData.append("=");
                    hashData.append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return hashData.toString();
    }

    public static String buildQueryString(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder query = new StringBuilder();

        try {
            for (String fieldName : fieldNames) {
                String value = params.get(fieldName);
                if (value != null && !value.isEmpty()) {

                    if (query.length() > 0) {
                        query.append("&");
                    }

                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append("=");
                    query.append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return query.toString();
    }

    // =========================================================================
    // HMAC-SHA512
    // Key = hashSecret, Data = sorted query string (khong co vnp_SecureHash)
    // =========================================================================
    public static String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("[VNPayUtil] Loi khi tao HMAC-SHA512: {}", e.getMessage(), e);
            throw new RuntimeException("Khong the tao chu ky HMAC-SHA512", e);
        }
    }

    // =========================================================================
    // Verify Checksum — dung buildHashData (raw values)
    //
    // Spring @RequestParam tu dong URL-decode params truoc khi truyen vao.
    // VNPAY gui callback voi params da URL-encode, Spring decode chung.
    // Ta tinh hash tren raw values (da duoc decode) — khop voi cach ta tao hash.
    // =========================================================================
    public static boolean verifyChecksum(Map<String, String> params, String hashSecret) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isEmpty()) {
            log.warn("[VNPayUtil] Khong tim thay vnp_SecureHash trong callback params");
            return false;
        }

        Map<String, String> verifyParams = new HashMap<>(params);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        String hashData = buildHashData(verifyParams);
        String computedHash = hmacSHA512(hashSecret, hashData);

        boolean isValid = computedHash.equalsIgnoreCase(receivedHash);
        if (!isValid) {
            log.warn("[VNPayUtil] Checksum khong hop le.\n  HashData: {}\n  Computed: {}\n  Received: {}",
                    hashData, computedHash, receivedHash);
        }
        return isValid;
    }

    // =========================================================================
    // Get Client IP
    // Ho tro proxy / load balancer (X-Forwarded-For, X-Real-IP, ...)
    // Chuan hoa IPv6 loopback (0:0:0:0:0:0:0:1) thanh 127.0.0.1
    // VNPAY khong chap nhan dia chi IPv6
    // =========================================================================
    public static String getClientIp(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED",
                "HTTP_X_CLUSTER_CLIENT_IP",
                "HTTP_CLIENT_IP",
                "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED",
                "HTTP_VIA",
                "REMOTE_ADDR",
                "X-Real-IP"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return normalizeIp(ip.split(",")[0].trim());
            }
        }

        return normalizeIp(request.getRemoteAddr());
    }

    // Chuan hoa IPv6 loopback thanh IPv4 127.0.0.1
    private static String normalizeIp(String ip) {
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }
        return ip;
    }

    // =========================================================================
    // Date & Amount Formatting
    // =========================================================================

    // Format LocalDateTime theo chuan VNPAY: yyyyMMddHHmmss
    public static String formatDate(LocalDateTime dateTime) {
        return dateTime.format(VNPAY_DATE_FORMAT);
    }

    // Chuyen doi amount tu VND sang VNPAY format (nhan 100)
    // Vi du: 100000 VND => "10000000"
    public static String formatAmount(double amount) {
        long vnpayAmount = (long) (amount * 100);
        return String.valueOf(vnpayAmount);
    }
}
