import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RotateCcw, Search, X, Tag } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import genreApi from '../../api/genreApi';

const GenresPage = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [form, setForm] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchGenres();
    }, [currentPage, search]);

    const fetchGenres = async () => {
        try {
            setLoading(true);
            const res = await genreApi.getAllGenres(search, currentPage, 20);
            if (res.data?.success) {
                setGenres(res.data.data.content || res.data.data || []);
                setTotalPages(res.data.data.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (genre = null) => {
        setEditingGenre(genre);
        if (genre) {
            setForm({ name: genre.name || '', description: genre.description || '' });
        } else {
            setForm({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGenre) {
                await genreApi.updateGenre(editingGenre.genreId, form);
            } else {
                await genreApi.createGenre(form);
            }
            setShowModal(false);
            fetchGenres();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        try {
            await genreApi.deleteGenre(id);
            setDeleteConfirm(null);
            fetchGenres();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleRestore = async (id) => {
        try {
            await genreApi.restoreGenre(id);
            fetchGenres();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const GENRE_COLORS = [
        'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'bg-green-500/20 text-green-400 border-green-500/30',
        'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'bg-pink-500/20 text-pink-400 border-pink-500/30',
        'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        'bg-amber-500/20 text-amber-400 border-amber-500/30',
        'bg-red-500/20 text-red-400 border-red-500/30',
    ];

    return (
        <div className="flex min-h-screen bg-[#0b1220] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <Header title="Quản lý thể loại" />
                <div className="p-6 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={e => { setSearch(e.target.value); setCurrentPage(0); }}
                                placeholder="Tìm kiếm thể loại..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm thể loại
                        </button>
                    </div>

                    {/* Genre Cards Grid */}
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse h-24"></div>
                            ))}
                        </div>
                    ) : genres.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                            <Tag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Không có thể loại nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {genres.map((genre, idx) => (
                                <div
                                    key={genre.genreId}
                                    className={`relative group border rounded-xl p-4 transition-all ${genre.isActive === false ? 'bg-white/3 border-white/5 opacity-60' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${GENRE_COLORS[idx % GENRE_COLORS.length]}`}>
                                            <Tag className="w-3 h-3 inline mr-1" />
                                            {genre.name}
                                        </span>
                                        {genre.isActive === false && (
                                            <span className="text-xs text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Đã xóa</span>
                                        )}
                                    </div>
                                    {genre.description && (
                                        <p className="text-slate-400 text-xs line-clamp-2">{genre.description}</p>
                                    )}
                                    {/* Actions */}
                                    <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1">
                                        {genre.isActive === false ? (
                                            <button onClick={() => handleRestore(genre.genreId)} className="p-1 rounded-lg bg-[#0b1220] border border-white/10 text-slate-400 hover:text-green-400 transition-colors" title="Khôi phục">
                                                <RotateCcw className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <>
                                                <button onClick={() => openModal(genre)} className="p-1 rounded-lg bg-[#0b1220] border border-white/10 text-slate-400 hover:text-white transition-colors">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setDeleteConfirm(genre.genreId)} className="p-1 rounded-lg bg-[#0b1220] border border-white/10 text-slate-400 hover:text-red-400 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400">Trang {currentPage + 1} / {totalPages}</p>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 disabled:opacity-40 hover:bg-white/10">Trước</button>
                                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 disabled:opacity-40 hover:bg-white/10">Sau</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Form Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl w-full max-w-sm">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">{editingGenre ? 'Cập nhật thể loại' : 'Thêm thể loại mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Tên thể loại *</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                    placeholder="Hành động, Tình cảm, Kinh dị..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Mô tả</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    placeholder="Mô tả về thể loại phim..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Hủy</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all">{editingGenre ? 'Cập nhật' : 'Thêm mới'}</button>
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
                        <p className="text-slate-400 text-sm mb-6">Bạn có chắc muốn xóa thể loại này không?</p>
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

export default GenresPage;
