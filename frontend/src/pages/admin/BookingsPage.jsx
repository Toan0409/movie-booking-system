import { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import bookingApi from '../../api/bookingApi';

const STATUS_COLORS = {
    PAID: 'bg-green-500/20 text-green-400',
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
    FAILED: 'bg-gray-500/20 text-gray-400',
};

const STATUS_OPTIONS = [
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'FAILED', label: 'Thất bại' },
    { value: 'PENDING', label: 'Đang chờ thanh toán' }
];



const BookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [viewBooking, setViewBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        let result = bookings;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(b =>
                b.bookingCode?.toLowerCase().includes(q) ||
                b.user?.fullName?.toLowerCase().includes(q) ||
                b.movieTitle?.toLowerCase().includes(q)
            );
        }
        if (statusFilter) {
            result = result.filter(b => b.status === statusFilter);
        }
        setFiltered(result);
    }, [search, statusFilter, bookings]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await bookingApi.getAllBookings();
            // Admin bookings returns array directly or wrapped
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setBookings(data);
            setFiltered(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus) => {
        try {
            await bookingApi.updateStatus(bookingId, newStatus);

            // update UI ngay (không cần reload)
            setBookings(prev =>
                prev.map(b =>
                    b.bookingId === bookingId
                        ? { ...b, status: newStatus }
                        : b
                )
            );
        } catch (err) {
            console.error(err);
            alert('Cập nhật trạng thái thất bại!');
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    const formatDateTime = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const totalRevenue = filtered
        .filter(b => b.status === 'PAID' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.finalAmount || 0), 0);

    return (
        <div className="flex min-h-screen bg-[#0b1220] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <Header title="Quản lý đặt vé" />
                <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Tổng đặt vé', value: filtered.length, color: 'text-white' },
                            { label: 'Đã xác nhận', value: filtered.filter(b => b.status === 'PAID').length, color: 'text-green-400' },
                            { label: 'Đã hủy', value: filtered.filter(b => b.status === 'CANCELLED').length, color: 'text-red-400' },
                            { label: 'Doanh thu', value: formatCurrency(totalRevenue), color: 'text-primary' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                                <p className="text-slate-400 text-xs mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm theo mã, tên khách, phim..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="PAID">Đã xác nhận</option>
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="CANCELLED">Đã hủy</option>
                            <option value="FAIL">Thất bại</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Mã đặt vé</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Khách hàng</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Phim</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Suất chiếu</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Số ghế</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Tổng tiền</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Trạng thái</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400 text-right">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Không có đặt vé nào</td></tr>
                                    ) : filtered.map((booking) => (
                                        <tr key={booking.bookingId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-primary font-mono font-bold text-sm">{booking.bookingCode}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-white text-sm">{booking.userName || 'N/A'}</p>
                                                <p className="text-slate-400 text-xs">{booking.user?.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{booking.movieTitle || booking.showtime?.movie?.title}</td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{formatDateTime(booking.startTime || booking.showtime?.startTime)}</td>
                                            <td className="px-4 py-3 text-center text-white font-medium">{booking.bookingDetails?.length || 0}</td>
                                            <td className="px-4 py-3 text-primary font-bold text-sm">{formatCurrency(booking.finalAmount)}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) => handleUpdateStatus(booking.bookingId, e.target.value)}
                                                    className={`px-2 py-1 rounded-full text-xs font-bold bg-transparent border border-white/10 ${STATUS_COLORS[booking.status] || 'bg-slate-500/20 text-slate-400'}`}
                                                >
                                                    {STATUS_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value} className="bg-[#0b1220] text-white">
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => setViewBooking(booking)}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Detail Modal */}
            {viewBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f1a2e]">
                            <h3 className="text-white font-bold text-lg">Chi tiết đặt vé</h3>
                            <button onClick={() => setViewBooking(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center bg-primary/10 rounded-xl p-4">
                                <p className="text-slate-400 text-xs mb-1">Mã đặt vé</p>
                                <p className="text-2xl font-black text-white tracking-widest">{viewBooking.bookingCode}</p>
                                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[viewBooking.status] || 'bg-slate-500/20 text-slate-400'}`}>
                                    {viewBooking.status}
                                </span>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Khách hàng</span>
                                    <span className="text-white font-medium">{viewBooking.userName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Email</span>
                                    <span className="text-white">{viewBooking.user?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Phim</span>
                                    <span className="text-white font-medium">{viewBooking.movieTitle || viewBooking.showtime?.movie?.title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Suất chiếu</span>
                                    <span className="text-white">{formatDateTime(viewBooking.startTime || viewBooking.showtime?.startTime)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Phòng chiếu</span>
                                    <span className="text-white">{viewBooking.theaterName || viewBooking.showtime?.theater?.name}</span>
                                </div>
                            </div>

                            {viewBooking.bookingDetails?.length > 0 && (
                                <div>
                                    <p className="text-slate-400 text-xs mb-2">Ghế đã đặt</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewBooking.bookingDetails.map((detail, idx) => (
                                            <span key={idx} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium">
                                                {detail.seatLabel || detail.seat?.seatLabel}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                                <span className="text-slate-400">Tổng thanh toán</span>
                                <span className="text-xl font-black text-white">{formatCurrency(viewBooking.finalAmount)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Ngày đặt</span>
                                <span className="text-white">{formatDateTime(viewBooking.bookingDate || viewBooking.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
