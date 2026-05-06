import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import directorApi from '../../api/directorApi';

const DirectorsPage = () => {
    const [directors, setDirectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDirector, setEditingDirector] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [form, setForm] = useState({ name: '', biography: '', birthDate: '', nationality: '', imageUrl: '' });

    useEffect(() => {
        fetchDirectors();
    }, [currentPage, search]);

    const fetchDirectors = async () => {
        try {
            setLoading(true);
            const res = await directorApi.getAllDirectors(search, currentPage, 10);
            if (res.data?.success) {
                setDirectors(res.data.data.content || res.data.data || []);
                setTotalPages(res.data.data.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (director = null) => {
        setEditingDirector(director);
        if (director) {
            setForm({
                name: director.name || '',
                biography: director.biography || '',
                birthDate: director.birthDate || '',
                nationality: director.nationality || '',
                imageUrl: director.imageUrl || '',
            });
        } else {
            setForm({ name: '', biography: '', birthDate: '', nationality: '', imageUrl: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name.trim(),
                biography: form.biography || null,
                birthDate: form.birthDate || null,      // ← "" → null
                nationality: form.nationality || null,
                imageUrl: form.imageUrl || null,
            };

            console.log('Payload gửi lên:', payload); // Debug
            if (editingDirector) {
                await directorApi.updateDirector(editingDirector.directorId, form);
            } else {
                await directorApi.createDirector(form);
            }
            setShowModal(false);
            fetchDirectors();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        try {
            await directorApi.deleteDirector(id);
            setDeleteConfirm(null);
            fetchDirectors();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0b1220] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <Header title="Quản lý đạo diễn" />
                <div className="p-6 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={e => { setSearch(e.target.value); setCurrentPage(0); }}
                                placeholder="Tìm kiếm đạo diễn..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm đạo diễn
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Đạo diễn</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Quốc tịch</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Ngày sinh</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
                                    ) : directors.length === 0 ? (
                                        <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">Không có đạo diễn nào</td></tr>
                                    ) : directors.map((director) => (
                                        <tr key={director.directorId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 shrink-0">
                                                        {director.imageUrl ? (
                                                            <img src={director.imageUrl} alt={director.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                                                                {director.name?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{director.name}</p>
                                                        {director.biography && <p className="text-slate-400 text-xs truncate max-w-[200px]">{director.biography}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{director.nationality || '—'}</td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{director.birthDate || '—'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openModal(director)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(director.directorId)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors">
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
                            <p className="text-xs text-slate-400">Trang {currentPage + 1} / {totalPages}</p>
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
                    <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">{editingDirector ? 'Cập nhật đạo diễn' : 'Thêm đạo diễn mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Tên đạo diễn *</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Nguyễn Văn A" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 text-sm block mb-1">Quốc tịch</label>
                                    <input value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} placeholder="Việt Nam" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-sm block mb-1">Ngày sinh</label>
                                    <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">URL ảnh đại diện</label>
                                <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Tiểu sử</label>
                                <textarea value={form.biography} onChange={e => setForm({ ...form, biography: e.target.value })} rows={3} placeholder="Mô tả về đạo diễn..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Hủy</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all">{editingDirector ? 'Cập nhật' : 'Thêm mới'}</button>
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
                        <p className="text-slate-400 text-sm mb-6">Bạn có chắc muốn xóa đạo diễn này không?</p>
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

export default DirectorsPage;
