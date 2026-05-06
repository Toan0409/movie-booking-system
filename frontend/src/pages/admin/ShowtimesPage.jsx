import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import showtimeApi from '../../api/showtimeApi';
import movieApi from '../../api/movieApi';
import theaterApi from '../../api/theaterApi';

const ShowtimesPage = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShowtime, setEditingShowtime] = useState(null);
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [form, setForm] = useState({
        movieId: '', theaterId: '', startTime: '', endTime: '', price: ''
    });

    useEffect(() => {
        fetchShowtimes();
        fetchMoviesAndTheaters();
    }, [currentPage]);

    const fetchShowtimes = async () => {
        try {
            setLoading(true);
            const res = await showtimeApi.getAllShowtimes(currentPage, 10);
            if (res.data?.success) {
                setShowtimes(res.data.data.content || []);
                setTotalPages(res.data.data.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoviesAndTheaters = async () => {
        try {
            const [moviesRes, theatersRes] = await Promise.all([
                movieApi.getAllMovies(0, 100),
                theaterApi.getAllTheaters(0, 100),
            ]);
            if (moviesRes.data?.success) setMovies(moviesRes.data.data.content || []);
            if (theatersRes.data?.success) setTheaters(theatersRes.data.data.content || []);
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (showtime = null) => {
        setEditingShowtime(showtime);
        if (showtime) {
            setForm({
                movieId: showtime.movie?.movieId || '',
                theaterId: showtime.theater?.theaterId || '',
                startTime: showtime.startTime?.slice(0, 16) || '',
                endTime: showtime.endTime?.slice(0, 16) || '',
                price: showtime.price || '',
            });
        } else {
            setForm({ movieId: '', theaterId: '', startTime: '', endTime: '', price: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                movieId: parseInt(form.movieId),
                theaterId: parseInt(form.theaterId),
                startTime: form.startTime,
                endTime: form.endTime || null,
                price: parseFloat(form.price),
            };
            if (editingShowtime) {
                await showtimeApi.updateShowtime(editingShowtime.showtimeId, payload);
            } else {
                await showtimeApi.createShowtime(payload);
            }
            setShowModal(false);
            fetchShowtimes();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleToggle = async (showtime) => {
        try {
            if (showtime.isActive) {
                await showtimeApi.deactivateShowtime(showtime.showtimeId);
            } else {
                await showtimeApi.activateShowtime(showtime.showtimeId);
            }
            fetchShowtimes();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const formatDateTime = (dt) => {
        if (!dt) return '';
        return new Date(dt).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="flex min-h-screen bg-[#0b1220] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <Header title="Quản lý suất chiếu" />
                <div className="p-6 space-y-6">
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Danh sách suất chiếu</h2>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm suất chiếu
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Phim</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Phòng chiếu</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Bắt đầu</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Kết thúc</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Giá vé</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Trạng thái</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
                                    ) : showtimes.length === 0 ? (
                                        <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Không có suất chiếu nào</td></tr>
                                    ) : showtimes.map((st) => (
                                        <tr key={st.showtimeId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="text-white font-medium text-sm">{st.movie?.title}</p>
                                                <p className="text-slate-400 text-xs">{st.movie?.ageRating}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-white text-sm">{st.theater?.name}</p>
                                                <p className="text-slate-400 text-xs">{st.theater?.theaterType}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{formatDateTime(st.startTime)}</td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{formatDateTime(st.endTime)}</td>
                                            <td className="px-4 py-3 text-primary font-medium text-sm">{formatCurrency(st.price)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${st.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {st.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleToggle(st)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Bật/Tắt">
                                                        {st.isActive ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => openModal(st)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                            <p className="text-xs text-slate-400">Trang {currentPage + 1} / {totalPages}</p>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 disabled:opacity-40 hover:bg-white/10">Trước</button>
                                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 disabled:opacity-40 hover:bg-white/10">Sau</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-white font-bold text-lg">
                                {editingShowtime ? 'Cập nhật suất chiếu' : 'Thêm suất chiếu mới'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Phim *</label>
                                <select value={form.movieId} onChange={e => setForm({ ...form, movieId: e.target.value })} required className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none">
                                    <option value="">Chọn phim</option>
                                    {movies.map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Phòng chiếu *</label>
                                <select value={form.theaterId} onChange={e => setForm({ ...form, theaterId: e.target.value })} required className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none">
                                    <option value="">Chọn phòng chiếu</option>
                                    {theaters.map(t => <option key={t.theaterId} value={t.theaterId}>{t.name} ({t.theaterType})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Thời gian bắt đầu *</label>
                                <input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Thời gian kết thúc</label>
                                <input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Giá vé (VND) *</label>
                                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="0" placeholder="90000" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Hủy</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all">
                                    {editingShowtime ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowtimesPage;
