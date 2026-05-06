import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';

const STATUS_STYLES = {
    CONFIRMED: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Xác nhận' },
    PENDING: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Chờ xử lý' },
    CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Đã hủy' },
    COMPLETED: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Hoàn thành' },
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDateTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
};

const RecentBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        bookingApi.getAllBookings()
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                // Sort by bookingId desc and take last 5
                const sorted = [...data].sort((a, b) => (b.bookingId || 0) - (a.bookingId || 0));
                setBookings(sorted.slice(0, 5));
            })
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    }, []);

    const getInitials = (name) =>
        (name || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-black/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h2 className="text-lg font-black text-white">Đặt vé gần đây</h2>
                <Link to="/admin/bookings" className="text-primary text-sm font-bold hover:underline">
                    Xem tất cả
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left">Khách hàng</th>
                            <th className="px-6 py-4 text-left">Phim</th>
                            <th className="px-6 py-4 text-left">Suất chiếu</th>
                            <th className="px-6 py-4 text-left">Tổng tiền</th>
                            <th className="px-6 py-4 text-left">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={5} className="px-6 py-4">
                                        <div className="h-8 bg-white/5 rounded animate-pulse"></div>
                                    </td>
                                </tr>
                            ))
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                                    Chưa có đặt vé nào
                                </td>
                            </tr>
                        ) : bookings.map((booking, index) => {
                            const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
                            const movieTitle = booking.movieTitle || booking.showtime?.movie?.title || '—';
                            const startTime = booking.startTime || booking.showtime?.startTime;
                            const userName = booking.user?.fullName || 'Khách';
                            return (
                                <tr key={booking.bookingId || index} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black shrink-0">
                                                {getInitials(userName)}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-semibold">{userName}</p>
                                                <p className="text-slate-500 text-xs">{booking.user?.email || ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-300 text-sm font-medium">{movieTitle}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-400 text-sm">{formatDateTime(startTime)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white font-bold text-sm">{formatCurrency(booking.finalAmount)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                            {statusStyle.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentBookings;
