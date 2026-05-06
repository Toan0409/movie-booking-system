import { Link } from 'react-router-dom';

const BookingPage = () => {
    const selectedSeats = ['A5', 'A6', 'A7'];

    return (
        <div className="min-h-screen py-20 px-6 md:px-20">
            <div className="max-w-[1000px] mx-auto">
                <h1 className="text-3xl font-black text-white mb-8">Xác nhận đặt vé</h1>

                {/* Booking Summary */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left - Movie & Seat Info */}
                    <div className="space-y-4">
                        {/* Movie Info */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-24 rounded-lg overflow-hidden">
                                    <img
                                        className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKVuMpsMxDimxnNv3MutmxW-m6WajWdzlaYDWTBKHV6pQhDIa-HiqUx7ZaxEVFoQac4I5XqrrkowpO_S06d1p5Hmpl8uGAiqkxk7i_GNWS2iMDXu_wISPNVXMxnKPl1IiqZDOHtiiMyhyemr3rrTYQJpSkuhwS24r8cqtj5I4htxtj0yGiZfc9FFQrpwol2dMK2a8F-mwmIfPHeLqr7H2az9KTJw0FVtu0PI1tFcoo-NYGA1jAsuZOfmeHML98HLq4ve4DLvaq6Fg"
                                        alt="Movie"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">Shadow Protocols</h2>
                                    <p className="text-slate-400 text-sm">C18 • 142 phút</p>
                                </div>
                            </div>
                        </div>

                        {/* Showtime Info */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h3 className="text-white font-bold mb-3">Suất chiếu</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-500">Rạp</p>
                                    <p className="text-white">City Center Mall</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Loại phòng</p>
                                    <p className="text-white">IMAX</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Ngày</p>
                                    <p className="text-white">11/11/2024</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Giờ</p>
                                    <p className="text-white">15:30</p>
                                </div>
                            </div>
                        </div>

                        {/* Seat Info */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h3 className="text-white font-bold mb-3">Ghế đã chọn</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedSeats.map(seat => (
                                    <span
                                        key={seat}
                                        className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-medium"
                                    >
                                        {seat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right - Price & Payment */}
                    <div className="space-y-4">
                        {/* Price Breakdown */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h3 className="text-white font-bold mb-4">Chi tiết giá</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">3 x Ghế thường (A5, A6, A7)</span>
                                    <span className="text-white">240.000đ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Combo bắp nước</span>
                                    <span className="text-white">89.000đ</span>
                                </div>
                                <div className="border-t border-white/10 pt-3 flex justify-between">
                                    <span className="text-white font-bold">Tổng cộng</span>
                                    <span className="text-primary font-bold text-xl">329.000đ</span>
                                </div>
                            </div>
                        </div>

                        {/* Food & Drink (Optional) */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h3 className="text-white font-bold mb-3">Bắp nước (không bắt buộc)</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">fastfood</span>
                                        <span className="text-white text-sm">Combo bắp lớn + nước</span>
                                    </div>
                                    <span className="text-slate-400 text-sm">89.000đ</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">local_drink</span>
                                        <span className="text-white text-sm">Nước ngọt (lớn)</span>
                                    </div>
                                    <span className="text-slate-400 text-sm">25.000đ</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Link
                                to="/payment"
                                className="block w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all text-center"
                            >
                                Tiến hành thanh toán
                            </Link>
                            <Link
                                to="/seats/1"
                                className="block w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all text-center border border-white/10"
                            >
                                Quay lại chọn ghế
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

