import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';
import paymentApi from '../api/paymentApi';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { booking, showtime, selectedSeats, total } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(null);

    // Tinh thoi gian con lai cua booking (expiryDate)
    useEffect(() => {
        if (!booking?.expiryDate) return;

        const updateCountdown = () => {
            const now = new Date();
            const expiry = new Date(booking.expiryDate);
            const diff = Math.max(0, Math.floor((expiry - now) / 1000));
            setCountdown(diff);
            if (diff === 0) {
                navigate('/', { replace: true });
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [booking?.expiryDate, navigate]);

    // Neu khong co booking state, redirect ve trang chu
    useEffect(() => {
        if (!booking) {
            navigate('/', { replace: true });
        }
    }, [booking, navigate]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const formatTime = (dateTime) => {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateTime) => {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const formatCountdown = (seconds) => {
        if (seconds === null) return '';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleVNPayPayment = async () => {
        if (!booking?.bookingId) return;

        try {
            setLoading(true);
            setError(null);

            // Goi API tao VNPAY payment URL
            const response = await paymentApi.createVNPayUrl(booking.bookingId);
            const data = response.data;

            // Lay paymentUrl tu response
            const paymentUrl = data?.data?.paymentUrl || data?.paymentUrl;

            if (!paymentUrl) {
                throw new Error('Khong nhan duoc URL thanh toan tu server');
            }

            // Redirect sang VNPAY
            window.location.href = paymentUrl;
        } catch (err) {
            console.error('Payment error:', err);
            const msg = err.response?.data?.message || err.message || 'Khong the tao lien ket thanh toan. Vui long thu lai.';
            setError(msg);
            setLoading(false);
        }
    };

    if (!booking) return null;

    const bookingData = booking?.data || booking;
    const seatLabels = selectedSeats?.map(s => s.seatLabel || s.seatCode).join(', ') || '';
    const finalAmount = bookingData?.finalAmount || total || 0;

    return (
        <div className="min-h-screen py-8 px-4 md:px-8">
            <div className="max-w-[700px] mx-auto">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lai
                </button>

                <h1 className="text-2xl font-black text-white mb-6">Xac nhan thanh toan</h1>

                {/* Countdown timer */}
                {countdown !== null && countdown > 0 && (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-6">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <p className="text-amber-400 text-sm">
                            Ghe duoc giu trong{' '}
                            <span className="font-bold text-amber-300">{formatCountdown(countdown)}</span>
                            {' '}— Vui long hoan tat thanh toan truoc khi het gio
                        </p>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <div className="grid md:grid-cols-5 gap-6">

                    {/* Order Summary — left col (3/5) */}
                    <div className="md:col-span-3 space-y-4">

                        {/* Movie + Showtime info */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide opacity-60">
                                Thong tin dat ve
                            </h3>

                            {/* Movie poster + info */}
                            <div className="flex gap-4 mb-4">
                                {showtime?.movie?.posterUrl && (
                                    <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0">
                                        <img
                                            src={showtime.movie.posterUrl}
                                            alt={showtime.movie?.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://placehold.jp/150x150.png'; }}
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="text-white font-bold text-base leading-tight mb-1">
                                        {showtime?.movie?.title || bookingData?.movieTitle}
                                    </p>
                                    <p className="text-slate-400 text-sm">
                                        {showtime?.theater?.name || bookingData?.theaterName}
                                    </p>
                                    <p className="text-primary text-sm font-medium mt-1">
                                        {formatTime(showtime?.startTime || bookingData?.startTime)}
                                        {' • '}
                                        {formatDate(showtime?.startTime || bookingData?.startTime)}
                                    </p>
                                </div>
                            </div>

                            {/* Booking details */}
                            <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Ma dat ve</span>
                                    <span className="text-white font-mono font-bold">
                                        {bookingData?.bookingCode}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Ghe</span>
                                    <span className="text-white">{seatLabels}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">So luong</span>
                                    <span className="text-white">{selectedSeats?.length || bookingData?.quantity} ghe</span>
                                </div>
                                {bookingData?.discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Giam gia</span>
                                        <span className="text-green-400">
                                            -{formatCurrency(bookingData.discountAmount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-white/10">
                                    <span className="text-white font-bold">Tong cong</span>
                                    <span className="text-primary font-bold text-lg">
                                        {formatCurrency(finalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Security note */}
                        <div className="flex items-start gap-3 bg-white/3 border border-white/5 rounded-xl px-4 py-3">
                            <Shield className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Giao dich duoc bao mat boi VNPAY voi ma hoa SSL 256-bit.
                                Thong tin the cua ban duoc bao ve an toan.
                            </p>
                        </div>
                    </div>

                    {/* Payment method — right col (2/5) */}
                    <div className="md:col-span-2 space-y-4">

                        {/* VNPAY button */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide opacity-60">
                                Phuong thuc thanh toan
                            </h3>

                            {/* VNPAY option */}
                            <div className="border border-primary/50 bg-primary/5 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-white text-xs font-black">VP</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">VNPAY</p>
                                        <p className="text-slate-400 text-xs">
                                            The ATM, Visa, MasterCard, QR Code
                                        </p>
                                    </div>
                                    <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                                </div>
                                <p className="text-slate-400 text-xs">
                                    Ban se duoc chuyen den cong thanh toan VNPAY de hoan tat giao dich.
                                </p>
                            </div>

                            {/* Amount summary */}
                            <div className="bg-white/5 rounded-lg px-4 py-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Thanh toan</span>
                                    <span className="text-white font-bold text-xl">
                                        {formatCurrency(finalAmount)}
                                    </span>
                                </div>
                            </div>

                            {/* Pay button */}
                            <button
                                onClick={handleVNPayPayment}
                                disabled={loading || countdown === 0}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Dang xu ly...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        Thanh toan qua VNPAY
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                className="w-full mt-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all border border-white/10"
                            >
                                Huy va quay lai
                            </button>
                        </div>

                        {/* Supported banks */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-slate-500 text-xs mb-3">Ho tro thanh toan</p>
                            <div className="flex flex-wrap gap-2">
                                {['Vietcombank', 'BIDV', 'Techcombank', 'VPBank', 'Agribank'].map(bank => (
                                    <span
                                        key={bank}
                                        className="bg-white/10 text-slate-300 text-xs px-2 py-1 rounded-md"
                                    >
                                        {bank}
                                    </span>
                                ))}
                                <span className="bg-white/10 text-slate-300 text-xs px-2 py-1 rounded-md">
                                    +50 ngan hang
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
