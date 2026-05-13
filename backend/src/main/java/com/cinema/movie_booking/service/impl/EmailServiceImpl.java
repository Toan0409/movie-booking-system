package com.cinema.movie_booking.service.impl;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.cinema.movie_booking.dto.email.BookingEmailData;
import com.cinema.movie_booking.service.EmailService;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

  private final JavaMailSender mailSender;

  @Value("${app.mail.from}")
  private String fromEmail;

  @Async
  @Override
  public void sendBookingConfirmationEmail(BookingEmailData data) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromEmail);
      helper.setTo(data.toEmail());
      helper.setSubject("[CinemaBox] Xác nhận đặt vé thành công - " + data.bookingCode());
      helper.setText(buildHtml(data), true);

      mailSender.send(message);
      log.info("[Email] Đã gửi xác nhận booking {} đến {}", data.bookingCode(), data.toEmail());
    } catch (Exception e) {
      log.error("[Email] Gửi email thất bại cho booking {}: {}", data.bookingCode(), e.getMessage());
    }
  }

  private String buildHtml(BookingEmailData data) {
    String seatRows = buildSeatRows(data.tickets());
    String discountRow = data.discountAmount() > 0
        ? "<tr><td style='padding:6px 0;color:#666;'>Giảm giá</td>"
            + "<td style='padding:6px 0;text-align:right;color:#e53935;'>-"
            + formatVnd(data.discountAmount()) + "</td></tr>"
        : "";

    // Dùng replace() thay vì formatted() để tránh lỗi khi tên phim có ký tự %
    return TEMPLATE
        .replace("{{USER_NAME}}", escapeHtml(data.userName()))
        .replace("{{BOOKING_CODE}}", escapeHtml(data.bookingCode()))
        .replace("{{MOVIE_TITLE}}", escapeHtml(data.movieTitle()))
        .replace("{{CINEMA_NAME}}", escapeHtml(data.cinemaName()))
        .replace("{{THEATER_NAME}}", escapeHtml(data.theaterName()))
        .replace("{{START_TIME}}", escapeHtml(data.startTime()))
        .replace("{{END_TIME}}", escapeHtml(data.endTime()))
        .replace("{{SEAT_ROWS}}", seatRows)
        .replace("{{TOTAL_AMOUNT}}", formatVnd(data.totalAmount()))
        .replace("{{DISCOUNT_ROW}}", discountRow)
        .replace("{{FINAL_AMOUNT}}", formatVnd(data.finalAmount()));
  }

  private String buildSeatRows(List<BookingEmailData.TicketRow> tickets) {
    if (tickets == null || tickets.isEmpty())
      return "";
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < tickets.size(); i++) {
      BookingEmailData.TicketRow row = tickets.get(i);
      String bg = i % 2 == 0 ? "#ffffff" : "#fafafa";
      sb.append("<tr style='background:").append(bg).append(";'>")
          .append("<td style='padding:10px;border:1px solid #eee;color:#666;font-size:13px;'>").append(i + 1)
          .append("</td>")
          .append("<td style='padding:10px;border:1px solid #eee;font-weight:bold;color:#333;'>")
          .append(escapeHtml(row.seatCode())).append("</td>")
          .append("<td style='padding:10px;border:1px solid #eee;color:#555;font-family:monospace;'>")
          .append(escapeHtml(row.ticketCode())).append("</td>")
          .append("<td style='padding:10px;border:1px solid #eee;text-align:right;color:#333;'>")
          .append(formatVnd(row.price())).append("</td>")
          .append("</tr>");
    }
    return sb.toString();
  }

  private String formatVnd(double amount) {
    // Tạo instance mới mỗi lần gọi vì NumberFormat không thread-safe
    NumberFormat fmt = NumberFormat.getInstance(new Locale("vi", "VN"));
    return fmt.format((long) amount) + " ₫";
  }

  private String escapeHtml(String value) {
    if (value == null)
      return "";
    return value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;");
  }

  private static final String TEMPLATE = """
      <!DOCTYPE html>
      <html lang="vi">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#e53935,#b71c1c);padding:30px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:1px;">🎬 CinemaBox</h1>
                <p style="margin:8px 0 0;color:#ffcdd2;font-size:14px;">Hệ thống đặt vé xem phim trực tuyến</p>
              </td>
            </tr>

            <!-- Success Banner -->
            <tr>
              <td style="background:#e8f5e9;padding:20px;text-align:center;border-bottom:2px solid #c8e6c9;">
                <p style="margin:0;font-size:20px;"><strong style="color:#2e7d32;">Đặt vé thành công!</strong></p>
                <p style="margin:6px 0 0;color:#555;font-size:14px;">Xin chào <strong>{{USER_NAME}}</strong>, vé của bạn đã được xác nhận.</p>
              </td>
            </tr>

            <!-- Body -->
            <tr><td style="padding:30px;">

              <!-- Booking Code -->
              <div style="background:#fff3e0;border:2px dashed #ff9800;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
                <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Mã đặt vé</p>
                <p style="margin:6px 0 0;font-size:26px;font-weight:bold;color:#e65100;letter-spacing:3px;">{{BOOKING_CODE}}</p>
              </div>

              <!-- Movie Info -->
              <h3 style="margin:0 0 12px;color:#333;font-size:16px;border-left:4px solid #e53935;padding-left:10px;">Thông tin phim</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="40%" style="padding:6px 0;color:#666;">Tên phim</td>
                  <td style="padding:6px 0;font-weight:bold;color:#333;">{{MOVIE_TITLE}}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#666;">Rạp chiếu</td>
                  <td style="padding:6px 0;color:#333;">{{CINEMA_NAME}}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#666;">Phòng chiếu</td>
                  <td style="padding:6px 0;color:#333;">{{THEATER_NAME}}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#666;">Suất chiếu</td>
                  <td style="padding:6px 0;color:#333;font-weight:bold;">{{START_TIME}} → {{END_TIME}}</td>
                </tr>
              </table>

              <!-- Seat / Ticket Info -->
              <h3 style="margin:0 0 12px;color:#333;font-size:16px;border-left:4px solid #e53935;padding-left:10px;">Thông tin vé</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-collapse:collapse;">
                <thead>
                  <tr style="background:#fafafa;">
                    <th style="padding:10px;text-align:left;border:1px solid #eee;color:#555;font-size:13px;">#</th>
                    <th style="padding:10px;text-align:left;border:1px solid #eee;color:#555;font-size:13px;">Ghế</th>
                    <th style="padding:10px;text-align:left;border:1px solid #eee;color:#555;font-size:13px;">Mã vé</th>
                    <th style="padding:10px;text-align:right;border:1px solid #eee;color:#555;font-size:13px;">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {{SEAT_ROWS}}
                </tbody>
              </table>

              <!-- Payment Summary -->
              <h3 style="margin:0 0 12px;color:#333;font-size:16px;border-left:4px solid #e53935;padding-left:10px;">Tóm tắt thanh toán</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:6px 0;color:#666;">Tạm tính</td>
                  <td style="padding:6px 0;text-align:right;color:#333;">{{TOTAL_AMOUNT}}</td>
                </tr>
                {{DISCOUNT_ROW}}
                <tr style="border-top:2px solid #eee;">
                  <td style="padding:10px 0 6px;font-weight:bold;color:#333;font-size:16px;">Tổng thanh toán</td>
                  <td style="padding:10px 0 6px;text-align:right;font-weight:bold;color:#e53935;font-size:18px;">{{FINAL_AMOUNT}}</td>
                </tr>
              </table>

              <!-- Note -->
              <div style="background:#e3f2fd;border-radius:8px;padding:14px;font-size:13px;color:#1565c0;">
                <strong>📌 Lưu ý:</strong> Vui lòng xuất trình mã đặt vé hoặc mã vé khi đến rạp. Vé không được hoàn trả sau khi xác nhận.
              </div>

            </td></tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f5f5f5;padding:20px;text-align:center;border-top:1px solid #eee;">
                <p style="margin:0;font-size:12px;color:#999;">© 2025 CinemaBox. Cảm ơn bạn đã sử dụng dịch vụ!</p>
                <p style="margin:4px 0 0;font-size:12px;color:#bbb;">Email này được gửi tự động, vui lòng không trả lời.</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
      </body>
      </html>
      """;
}
