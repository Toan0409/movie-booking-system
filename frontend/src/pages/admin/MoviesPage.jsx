import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Star, Film, Clock } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import movieApi from '../../api/movieApi';
import genreApi from '../../api/genreApi';
import directorApi from '../../api/directorApi';
import actorApi from '../../api/actorApi';

const STATUS_OPTIONS = ['NOW_SHOWING', 'COMING_SOON', 'ENDED'];
const AGE_RATINGS = ['P', 'K', 'T13', 'T16', 'T18', 'C'];

const MoviesPage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [genres, setGenres] = useState([]);
    const [directors, setDirectors] = useState([]);

    const [form, setForm] = useState({
        title: '', originalTitle: '', description: '', duration: '',
        releaseDate: '', ageRating: 'P', status: 'NOW_SHOWING',
        posterUrl: '', backdropUrl: '', trailerUrl: '',
        genreId: '', directorId: '', rating: '',
    });

    useEffect(() => {
        fetchMovies();
    }, [currentPage, search]);

    useEffect(() => {
        // Load genres and directors for form selects
        const loadFormData = async () => {
            try {
                const [gRes, dRes] = await Promise.all([
                    genreApi.getAllGenres('', 0, 100),
                    directorApi.getAllDirectors('', 0, 100),
                ]);
                if (gRes.data?.success) setGenres(gRes.data.data.content || gRes.data.data || []);
                if (dRes.data?.success) setDirectors(dRes.data.data.content || dRes.data.data || []);
            } catch (err) {
                console.error('Failed to load form data:', err);
            }
        };
        loadFormData();
    }, []);

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const res = search
                ? await movieApi.searchMovies(search, currentPage, 10)
                : await movieApi.getAllMovies(currentPage, 10);

            const data = res.data?.data;
            if (data) {
                setMovies(data.content || data || []);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm chuyển boolean flags từ response → status string cho form
    const deriveStatus = (movie) => {
        if (movie.isNowShowing) return 'NOW_SHOWING';
        if (movie.isComingSoon) return 'COMING_SOON';
        return 'ENDED';
    };

    const openModal = (movie = null) => {
        setEditingMovie(movie);
        if (movie) {
            setForm({
                title: movie.title || '',
                originalTitle: movie.originalTitle || '',
                description: movie.description || '',
                duration: movie.duration || '',
                releaseDate: movie.releaseDate || '',
                ageRating: movie.ageRating || 'P',
                status: deriveStatus(movie),
                posterUrl: movie.posterUrl || '',
                backdropUrl: '',
                trailerUrl: movie.trailerUrl || '',
                genreId: movie.genre?.genreId || '',
                directorId: movie.director?.directorId || '',
                rating: movie.rating || '',
            });
        } else {
            setForm({
                title: '', originalTitle: '', description: '', duration: '',
                releaseDate: '', ageRating: 'P', status: 'NOW_SHOWING',
                posterUrl: '', backdropUrl: '', trailerUrl: '',
                genreId: '', directorId: '', rating: '',
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: form.title,
                originalTitle: form.originalTitle || undefined,
                description: form.description || undefined,
                duration: form.duration ? parseInt(form.duration) : undefined,
                releaseDate: form.releaseDate || undefined,
                ageRating: form.ageRating || undefined,
                posterUrl: form.posterUrl || undefined,
                trailerUrl: form.trailerUrl || undefined,
                rating: form.rating ? parseFloat(form.rating) : undefined,
                genreId: form.genreId ? parseInt(form.genreId) : undefined,
                directorId: form.directorId ? parseInt(form.directorId) : undefined,
                // Chuyển status string → boolean flags theo backend DTO
                isNowShowing: form.status === 'NOW_SHOWING',
                isComingSoon: form.status === 'COMING_SOON',
                isFeatured: false,
            };
            if (editingMovie) {
                await movieApi.updateMovie(editingMovie.movieId, payload);
            } else {
                await movieApi.createMovie(payload);
            }
            setShowModal(false);
            fetchMovies();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        try {
            await movieApi.deleteMovie(id);
            setDeleteConfirm(null);
            fetchMovies();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const STATUS_BADGE = {
        NOW_SHOWING: 'bg-green-500/20 text-green-400 border-green-500/30',
        COMING_SOON: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        ENDED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    const STATUS_LABEL = {
        NOW_SHOWING: 'Đang chiếu',
        COMING_SOON: 'Sắp chiếu',
        ENDED: 'Đã kết thúc',
    };

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none";
    const labelCls = "text-slate-300 text-xs block mb-1";
    const selectCls = "w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none";

    return (
        <div className="flex min-h-screen bg-[#0b1220] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <Header title="Quản lý phim" />
                <div className="p-6 space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={e => { setSearch(e.target.value); setCurrentPage(0); }}
                                placeholder="Tìm kiếm phim..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm phim
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Phim</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Thể loại</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Thời lượng</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Đánh giá</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Trạng thái</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
                                    ) : movies.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center">
                                                <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                                <p className="text-slate-400">Không có phim nào</p>
                                            </td>
                                        </tr>
                                    ) : movies.map((movie) => (
                                        <tr key={movie.movieId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/10 shrink-0">
                                                        {movie.posterUrl ? (
                                                            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Film className="w-4 h-4 text-slate-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold text-sm">{movie.title}</p>
                                                        <p className="text-slate-400 text-xs">{movie.director?.name || '—'}</p>
                                                        {movie.releaseDate && <p className="text-slate-500 text-xs">{movie.releaseDate}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{movie.genre?.name || '—'}</td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">
                                                {movie.duration ? (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                        {movie.duration} phút
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {movie.rating ? (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                        <span className="text-white font-medium">{movie.rating}</span>
                                                    </span>
                                                ) : <span className="text-slate-500">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {(() => {
                                                    const status = deriveStatus(movie);
                                                    return (
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${STATUS_BADGE[status]}`}>
                                                            {STATUS_LABEL[status]}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openModal(movie)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(movie.movieId)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                            <p className="text-xs text-slate-400">{totalElements} phim • Trang {currentPage + 1} / {totalPages}</p>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 disabled:opacity-40 hover:bg-white/10">Trước</button>
                                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 disabled:opacity-40 hover:bg-white/10">Sau</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Form Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f1a2e] z-10">
                            <h3 className="text-white font-bold text-lg">{editingMovie ? 'Cập nhật phim' : 'Thêm phim mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className={labelCls}>Tên phim (Tiếng Việt) *</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Tên phim..." className={inputCls} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>Tên gốc</label>
                                    <input value={form.originalTitle} onChange={e => setForm({ ...form, originalTitle: e.target.value })} placeholder="Original title..." className={inputCls} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>Mô tả</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Nội dung phim..." className={`${inputCls} resize-none`} />
                                </div>
                                <div>
                                    <label className={labelCls}>Thời lượng (phút)</label>
                                    <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="120" min="1" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Ngày khởi chiếu</label>
                                    <input type="date" value={form.releaseDate} onChange={e => setForm({ ...form, releaseDate: e.target.value })} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Giới hạn tuổi</label>
                                    <select value={form.ageRating} onChange={e => setForm({ ...form, ageRating: e.target.value })} className={selectCls}>
                                        {AGE_RATINGS.map(r => <option className='' key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Trạng thái</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={selectCls}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Thể loại</label>
                                    <select value={form.genreId} onChange={e => setForm({ ...form, genreId: e.target.value })} className={selectCls}>
                                        <option value="">-- Chọn thể loại --</option>
                                        {genres.map(g => <option key={g.genreId} value={g.genreId}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Đạo diễn</label>
                                    <select value={form.directorId} onChange={e => setForm({ ...form, directorId: e.target.value })} className={selectCls}>
                                        <option value="">-- Chọn đạo diễn --</option>
                                        {directors.map(d => <option key={d.directorId} value={d.directorId}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Điểm đánh giá (0-10)</label>
                                    <input type="number" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} placeholder="8.5" min="0" max="10" step="0.1" className={inputCls} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>URL Poster</label>
                                    <input value={form.posterUrl} onChange={e => setForm({ ...form, posterUrl: e.target.value })} placeholder="https://..." className={inputCls} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>URL Backdrop</label>
                                    <input value={form.backdropUrl} onChange={e => setForm({ ...form, backdropUrl: e.target.value })} placeholder="https://..." className={inputCls} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>URL Trailer</label>
                                    <input value={form.trailerUrl} onChange={e => setForm({ ...form, trailerUrl: e.target.value })} placeholder="https://youtube.com/..." className={inputCls} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Hủy</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all">{editingMovie ? 'Cập nhật' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center">
                        <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">Xác nhận xóa</h3>
                        <p className="text-slate-400 text-sm mb-6">Bạn có chắc muốn xóa phim này không?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm font-medium">Hủy</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold">Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoviesPage;
