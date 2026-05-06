import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, Ticket, Heart, History, Settings, LogOut,
    Star, Edit2, Save, X, Loader, AlertCircle, Film,
    MapPin, Clock, CheckCircle, XCircle, Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import userApi from '../api/userApi';
import bookingApi from '../api/bookingApi';

const MENU_ITEMS = [
    { key: 'info', label: 'Thông tin tài khoản', icon: User },
    { key: 'history', label: 'Lịch sử đặt vé', icon: History },
    { key: 'settings', label: 'Cài đặt', icon: Settings },
];

const formatDateTime = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const STATUS_MAP = {
    PAID: {
        label: 'Đã thanh toán',
        color: 'text-green-400 bg-green-500/10 border-green-500/20',
        icon: CheckCircle
    },
    PENDING: {
        label: 'Chờ thanh toán',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        icon: Clock
    },
    CANCELLED: {
        label: 'Đã hủy',
        color: 'text-red-400 bg-red-500/10 border-red-500/20',
        icon: XCircle
    },
    FAILED: {
        label: 'Thanh toán thất bại',
        color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
        icon: XCircle
    }
};

const ProfilePage = () => {
    const { user, logout, updateUserData } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('info');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');

    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    const [form, setForm] = useState({ fullName: '', phone: '', email: '' });

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: '/profile' } } });
        } else {
            setForm({ fullName: user.fullName || '', phone: user.phone || '', email: user.email || '' });
        }
    }, [user, navigate]);

    // Fetch bookings when tab is active
    useEffect(() => {
        if ((activeTab === 'tickets' || activeTab === 'history') && user?.userId) {
            setBookingsLoading(true);
            bookingApi.getBookingsByUser(user.userId)
                .then(res => {
                    const data = res.data?.data || [];
                    setBookings(Array.isArray(data) ? data : []);
                })
                .catch(() => setBookings([]))
                .finally(() => setBookingsLoading(false));
        }
    }, [activeTab, user]);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        setSaveError('');
        setSaveSuccess('');
        setSaving(true);
        try {
            const res = await userApi.updateUser(user.userId, {
                fullName: form.fullName,
                phone: form.phone,
                email: form.email,
            });
            const updated = res.data?.data || res.data;
            updateUserData({ ...user, ...updated });
            setSaveSuccess('Cập nhật thông tin thành công!');
            setEditing(false);
            setTimeout(() => setSaveSuccess(''), 3000);
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    if (!user) return null;

    const initials = (user.fullName || 'U')
        .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    // Separate upcoming vs past bookings
    const now = new Date();
    const upcomingBookings = bookings.filter(b => {
        const st = b.showtime?.startTime || b.startTime;
        return st && new Date(st) > now && b.status !== 'PAID';
    });
    const pastBookings = bookings.filter(b => {
        const st = b.showtime?.startTime || b.startTime;
        return (
            !st ||
            new Date(st) <= now ||
            b.status === 'CANCELLED' ||
            b.status === 'FAILED'
        );
    });

    const BookingCard = ({ booking }) => {
        const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP.PENDING;
        const StatusIcon = statusInfo.icon;
        const movieTitle = booking.movieTitle || booking.showtime?.movie?.title || 'Phim';
        const theaterName = booking.theaterName || booking.showtime?.theater?.name || 'Phòng chiếu';
        const cinemaName = booking.cinemaName || booking.showtime?.theater?.cinema?.name || '';
        const startTime = booking.showtime?.startTime || booking.startTime;
        const seats = booking.bookingDetails || [];

        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/10 shrink-0">
                            {booking.showtime?.movie?.posterUrl ? (
                                <img
                                    src={booking.showtime.movie.posterUrl}
                                    alt={movieTitle}
                                    className="w-full h-full object-cover"
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Film className="w-4 h-4 text-slate-500" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">{movieTitle}</p>
                            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {cinemaName ? `${cinemaName} • ` : ''}{theaterName}
                            </p>
                            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {formatDateTime(startTime)}
                            </p>
                        </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex flex-wrap gap-1">
                        {seats.slice(0, 4).map((d, i) => (
                            <span key={i} className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded font-medium">
                                {d.seat?.seatLabel || d.seatLabel || `Ghế ${i + 1}`}
                            </span>
                        ))}
                        {seats.length > 4 && (
                            <span className="text-slate-400 text-xs px-2 py-0.5">+{seats.length - 4}</span>
                        )}
                    </div>
                    <p className="text-white font-bold text-sm">{formatCurrency(booking.finalAmount || booking.totalAmount)}</p>
                </div>

                {booking.bookingCode && (
                    <p className="text-slate-500 text-xs mt-2">Mã đặt vé: <span className="text-slate-300 font-mono">{booking.bookingCode}</span></p>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen py-12 px-6 md:px-20">
            <div className="max-w-[1000px] mx-auto">
                <h1 className="text-3xl font-black text-white mb-8">Tài khoản</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* ── Sidebar ── */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 text-primary text-2xl font-black">
                                {initials}
                            </div>
                            <h2 className="text-white font-bold text-lg">{user.fullName || 'Người dùng'}</h2>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                            <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-bold">
                                <Star className="w-3 h-3 fill-current" />
                                {user.role || 'USER'} Member
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                            {MENU_ITEMS.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === key ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{label}</span>
                                </button>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 text-left transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Đăng xuất</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Main Content ── */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Account Banner */}
                        <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/80 text-sm">ID tài khoản</p>
                                    <p className="text-3xl font-black text-white">#{user.userId}</p>
                                    <p className="text-white/60 text-sm mt-1">
                                        Trạng thái:{' '}
                                        <span className={user.isActive ? 'text-green-300' : 'text-red-300'}>
                                            {user.isActive ? 'Đang hoạt động' : 'Bị khóa'}
                                        </span>
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* ── Account Info Tab ── */}
                        {activeTab === 'info' && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-white font-bold text-lg">Thông tin tài khoản</h3>
                                    {!editing ? (
                                        <button
                                            onClick={() => { setEditing(true); setSaveError(''); setSaveSuccess(''); }}
                                            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Chỉnh sửa
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditing(false); setSaveError(''); }}
                                                className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center gap-1 bg-primary text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-all"
                                            >
                                                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Lưu
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {saveError && (
                                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
                                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                        <p className="text-red-400 text-sm">{saveError}</p>
                                    </div>
                                )}
                                {saveSuccess && (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-4">
                                        <p className="text-green-400 text-sm">{saveSuccess}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-slate-500 text-sm block mb-1">Họ và tên</label>
                                            <input
                                                type="text" name="fullName" value={form.fullName}
                                                onChange={handleChange} disabled={!editing}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-slate-500 text-sm block mb-1">Số điện thoại</label>
                                            <input
                                                type="tel" name="phone" value={form.phone}
                                                onChange={handleChange} disabled={!editing}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-slate-500 text-sm block mb-1">Email</label>
                                        <input
                                            type="email" name="email" value={form.email}
                                            onChange={handleChange} disabled={!editing}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-500 text-sm block mb-1">Vai trò</label>
                                        <input
                                            type="text" value={user.role || 'USER'} disabled
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-slate-400 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── History Tab ── */}
                        {activeTab === 'history' && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">Lịch sử đặt vé</h3>
                                {bookingsLoading ? (
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : bookings.length > 0 ? (
                                    <div className="space-y-3">
                                        {pastBookings.map((b, i) => (
                                            <BookingCard key={b.bookingId || i} booking={b} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                        <p className="text-slate-400">Chưa có lịch sử đặt vé</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Settings Tab ── */}
                        {activeTab === 'settings' && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">Cài đặt</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                                        <div>
                                            <p className="text-white font-medium">Thông báo email</p>
                                            <p className="text-slate-400 text-sm">Nhận thông báo về vé và ưu đãi</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                                        <div>
                                            <p className="text-white font-medium">Thông báo SMS</p>
                                            <p className="text-slate-400 text-sm">Nhận SMS xác nhận đặt vé</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                    <div className="pt-4">
                                        <button className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                                            Xóa tài khoản
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
