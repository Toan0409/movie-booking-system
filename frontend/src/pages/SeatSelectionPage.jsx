import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import seatApi from '../api/seatApi';
import showtimeApi from '../api/showtimeApi';
import bookingApi from '../api/bookingApi';

const SeatSelectionPage = () => {
    const { id: showtimeId } = useParams();
    const navigate = useNavigate();

    const [showtime, setShowtime] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState(false);

    // Fetch showtime info and seat availability
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [showtimeRes, seatsRes] = await Promise.all([
                    showtimeApi.getShowtimeById(showtimeId),
                    seatApi.getSeatAvailability(showtimeId),
                ]);

                if (showtimeRes.data?.success) {
                    setShowtime(showtimeRes.data.data);
                }

                if (seatsRes.data?.success) {
                    setSeats(seatsRes.data.data || []);
                }
            } catch (err) {
                console.error('Error fetching seat data:', err);
                setError('Không thể tải thông tin ghế. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        if (showtimeId) {
            fetchData();
        }
    }, [showtimeId]);

    // Group seats by row
    const seatsByRow = seats.reduce((acc, seat) => {
        const row = seat.seatRow;
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});

    const sortedRows = Object.keys(seatsByRow).sort();

    const toggleSeat = (seat) => {
        if (seat.status === 'OCCUPIED' || seat.status === 'RESERVED') return;

        setSelectedSeats(prev => {
            const isSelected = prev.find(s => s.seatId === seat.seatId);
            if (isSelected) {
                return prev.filter(s => s.seatId !== seat.seatId);
            }
            return [...prev, seat];
        });
    };

    const getSeatColor = (seat) => {
        const isSelected = selectedSeats.find(s => s.seatId === seat.seatId);
        if (isSelected) return 'bg-primary text-white border-primary';
        if (seat.status === 'OCCUPIED') return 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-700';
        if (seat.status === 'RESERVED') return 'bg-yellow-900/50 text-yellow-600 cursor-not-allowed border-yellow-900';
        if (seat.seatType === 'VIP') return 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500 hover:text-white';
        if (seat.seatType === 'COUPLE') return 'bg-pink-500/20 text-pink-400 border-pink-500/50 hover:bg-pink-500 hover:text-white';
        return 'bg-white/10 text-slate-300 border-white/20 hover:bg-primary/50 hover:text-white';
    };

    const getSeatWidth = (seat) => {
        return seat.seatType === 'COUPLE' ? 'w-16' : 'w-8';
    };

    const calculateTotal = () => {
        if (!showtime) return 0;
        return selectedSeats.reduce((sum, seat) => {
            return sum + (showtime.price * (seat.priceMultiplier || 1));
        }, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatTime = (dateTime) => {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateTime) => {
        if (!dateTime) return '';
        return new Date(dateTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleBooking = async () => {
        if (selectedSeats.length === 0) return;

        // Lay userId tu localStorage (AuthContext luu khi login)
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/login', { state: { from: `/booking/${showtimeId}` } });
            return;
        }

        try {
            setBooking(true);
            const bookingData = {
                showtimeId: parseInt(showtimeId),
                seatIds: selectedSeats.map(s => s.seatId),
                notes: '',
            };

            // Buoc 1: Tao booking (trang thai PENDING)
            const response = await bookingApi.createBooking(userId, bookingData);
            const bookingResult = response.data;

            // Buoc 2: Chuyen sang trang thanh toan VNPAY
            navigate('/payment', {
                state: {
                    booking: bookingResult,
                    showtime,
                    selectedSeats,
                    total: calculateTotal(),
                }
            });
        } catch (err) {
            console.error('Booking error:', err);
            const msg = err.response?.data?.message || 'Đặt vé thất bại. Vui lòng thử lại.';
            alert(msg);
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-20 px-6 md:px-20">
                <div className="max-w-[900px] mx-auto animate-pulse">
                    <div className="h-20 bg-slate-800 rounded-xl mb-8"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/4 mx-auto mb-8"></div>
                    <div className="space-y-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex justify-center gap-2">
                                {[...Array(10)].map((_, j) => (
                                    <div key={j} className="w-8 h-8 bg-slate-800 rounded-t-lg"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-20 px-6 md:px-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-primary text-white font-bold py-2 px-6 rounded-lg"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 md:px-8">
            <div className="max-w-[900px] mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>

                {/* Showtime Info */}
                {showtime && (
                    <div className="flex items-center gap-4 mb-8 bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                            <img
                                className="w-full h-full object-cover"
                                src={showtime.movie?.posterUrl}
                                alt={showtime.movie?.title}
                                onError={(e) => { e.target.src = 'https://placehold.jp/150x150.png'; }}
                            />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-white font-bold text-lg">{showtime.movie?.title}</h1>
                            <p className="text-slate-400 text-sm">
                                {showtime.theater?.name} • {showtime.theater?.theaterType}
                            </p>
                            <p className="text-primary text-sm font-medium">
                                {formatTime(showtime.startTime)} • {formatDate(showtime.startTime)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-xs">Giá vé từ</p>
                            <p className="text-white font-bold">{formatCurrency(showtime.price)}</p>
                        </div>
                    </div>
                )}

                {/* Screen */}
                <div className="mb-10">
                    <div className="h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full w-3/4 mx-auto mb-2 opacity-80"></div>
                    <p className="text-center text-slate-500 text-xs uppercase tracking-widest">Màn hình</p>
                </div>

                {/* Seat Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-t-lg bg-white/10 border border-white/20"></div>
                        <span className="text-slate-400">Thường</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-t-lg bg-amber-500/20 border border-amber-500/50"></div>
                        <span className="text-slate-400">VIP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-6 rounded-t-lg bg-pink-500/20 border border-pink-500/50"></div>
                        <span className="text-slate-400">Đôi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-t-lg bg-primary border-primary"></div>
                        <span className="text-slate-400">Đã chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-t-lg bg-slate-700 border-slate-700"></div>
                        <span className="text-slate-400">Đã đặt</span>
                    </div>
                </div>

                {/* Seat Layout */}
                {seats.length === 0 ? (
                    <div className="text-center py-12">
                        <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Không có thông tin ghế cho suất chiếu này</p>
                    </div>
                ) : (
                    <div className="mb-8 overflow-x-auto">
                        <div className="min-w-[500px] space-y-2">
                            {sortedRows.map((row) => (
                                <div key={row} className="flex items-center justify-center gap-1">
                                    <span className="w-6 text-slate-500 text-xs font-medium text-center shrink-0">{row}</span>
                                    <div className="flex gap-1 flex-wrap justify-center">
                                        {seatsByRow[row]
                                            .sort((a, b) => a.seatNumber - b.seatNumber)
                                            .map((seat) => (
                                                <button
                                                    key={seat.seatId}
                                                    disabled={seat.status === 'OCCUPIED' || seat.status === 'RESERVED'}
                                                    onClick={() => toggleSeat(seat)}
                                                    title={`${seat.seatLabel} - ${seat.seatType}`}
                                                    className={`h-8 rounded-t-lg text-[10px] font-medium transition-all border ${getSeatWidth(seat)} ${getSeatColor(seat)}`}
                                                >
                                                    {seat.seatNumber}
                                                </button>
                                            ))}
                                    </div>
                                    <span className="w-6 text-slate-500 text-xs font-medium text-center shrink-0">{row}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Selected Seats Summary */}
                {selectedSeats.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
                        <h3 className="text-white font-bold mb-3">Ghế đã chọn</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedSeats.map(seat => (
                                <span
                                    key={seat.seatId}
                                    className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-medium"
                                >
                                    {seat.seatLabel}
                                    {seat.seatType !== 'STANDARD' && (
                                        <span className="ml-1 text-xs opacity-70">({seat.seatType})</span>
                                    )}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div>
                                <p className="text-slate-400 text-sm">{selectedSeats.length} ghế</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(calculateTotal())}</p>
                            </div>
                            <button
                                onClick={handleBooking}
                                disabled={booking}
                                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all"
                            >
                                {booking ? 'Đang xử lý...' : 'Đặt vé'}
                            </button>
                        </div>
                    </div>
                )}

                {selectedSeats.length === 0 && seats.length > 0 && (
                    <div className="text-center py-6">
                        <p className="text-slate-400">Vui lòng chọn ghế để tiếp tục</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeatSelectionPage;
