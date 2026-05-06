import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Film, MapPin, Clock, Ticket, Home, Download } from 'lucide-react';

const BookingSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking, showtime, selectedSeats, total } = location.state || {};

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatTime = (dateTime) => {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateTime) => {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleDateString('vi-VN', {
            weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    // If no booking data, redirect to home
    if (!booking && !showtime) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-400 mb-4">Không tìm thấy thông tin đặt vé</p>
                    <Link to="/" className="bg-primary text-white font-bold py-2 px-6 rounded-lg">
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    const bookingCode = booking?.bookingCode || `BK${Date.now()}`;
    const movieTitle = booking?.movieTitle || showtime?.movie?.title || 'Phim';
    const theaterName = showtime?.theater?.name || 'Phòng chiếu';
    const startTime = booking?.startTime || showtime?.startTime;
    const seats = selectedSeats || booking?.bookingDetails || [];
    const finalAmount = booking?.finalAmount || total || 0;

    return (
        <div className="min-h-screen py-12 px-4 md:px-8">
            <div className="max-w-[600px] mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Đặt vé thành công!</h1>
                    <p className="text-slate-400">Vé của bạn đã được xác nhận. Vui lòng lưu mã đặt vé bên dưới.</p>
                </div>

                {/* Booking Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
                    {/* Booking Code */}
                    <div className="bg-primary/20 border-b border-white/10 p-6 text-center">
                        <p className="text-slate-400 text-sm mb-1">Mã đặt vé</p>
                        <p className="text-3xl font-black text-white tracking-widest">{bookingCode}</p>
                    </div>

                    {/* Movie Info */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <Film className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="text-slate-400 text-xs mb-0.5">Phim</p>
                                <p className="text-white font-bold text-lg">{movieTitle}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="text-slate-400 text-xs mb-0.5">Phòng chiếu</p>
                                <p className="text-white font-medium">{theaterName}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="text-slate-400 text-xs mb-0.5">Suất chiếu</p>
                                <p className="text-white font-medium">
                                    {formatTime(startTime)} • {formatDate(startTime)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Ticket className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="text-slate-400 text-xs mb-0.5">Ghế ngồi</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {seats.map((seat, idx) => (
                                        <span
                                            key={seat.seatId || seat.bookingDetailId || idx}
                                            className="bg-primary/20 text-primary px-2 py-0.5 rounded text-sm font-medium"
                                        >
                                            {seat.seatLabel || `Ghế ${seat.seatNumber}`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider with circles */}
                    <div className="relative border-t border-dashed border-white/20 mx-6">
                        <div className="absolute -left-10 -top-3 w-6 h-6 rounded-full bg-background-dark border border-white/10"></div>
                        <div className="absolute -right-10 -top-3 w-6 h-6 rounded-full bg-background-dark border border-white/10"></div>
                    </div>

                    {/* Total */}
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Tổng thanh toán</p>
                            <p className="text-2xl font-black text-white">{formatCurrency(finalAmount)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-xs">Trạng thái</p>
                            <span className="bg-green-500/20 text-green-400 text-sm font-bold px-3 py-1 rounded-full">
                                {booking?.status || 'CONFIRMED'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notice */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                    <p className="text-amber-400 text-sm text-center">
                        📱 Vui lòng xuất trình mã đặt vé tại quầy hoặc cổng vào rạp
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        to="/"
                        className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Trang chủ
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Lưu vé
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccessPage;
