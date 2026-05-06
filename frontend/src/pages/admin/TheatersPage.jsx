import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import theaterApi from '../../api/theaterApi';
import cinemaApi from '../../api/cinemaApi';

const THEATER_TYPES = ['STANDARD', 'IMAX', 'FOUR_DX', 'VIP'];

const TheatersPage = () => {
    const [theaters, setTheaters] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTheater, setEditingTheater] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [form, setForm] = useState({
        name: '', cinemaId: '', rowsCount: '', seatsPerRow: '', theaterType: 'STANDARD'
    });

    useEffect(() => {
        fetchTheaters();
        fetchCinemas();
    }, [currentPage]);

    const fetchTheaters = async () => {
        try {
            setLoading(true);
            const res = await theaterApi.getAllTheaters(currentPage, 10);
            if (res.data?.success) {
                setTheaters(res.data.data.content || []);
                setTotalPages(res.data.data.totalPages || 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCinemas = async () => {
        try {
            const res = await cinemaApi.getAllCinemas();
            if (res.data?.success) setCinemas(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (theater = null) => {
        setEditingTheater(theater);
        if (theater) {
            setForm({
                name: theater.name || '',
                cinemaId: theater.cinema?.cinemaId || '',
                rowsCount: theater.rowsCount || '',
                seatsPerRow: theater.seatsPerRow || '',
                theaterType: theater.theaterType || 'STANDARD',
            });
        } else {
            setForm({ name: '', cinemaId: '', rowsCount: '', seatsPerRow: '', theaterType: 'STANDARD' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name,
                cinemaId: parseInt(form.cinemaId),
                rowsCount: parseInt(form.rowsCount),
                seatsPerRow: parseInt(form.seatsPerRow),
                theaterType: form.theaterType,
            };
            if (editingTheater) {
                await theaterApi.updateTheater(editingTheater.theaterId, payload);
            } else {
                await theaterApi.createTheater(payload);
            }
            setShowModal(false);
            fetchTheaters();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        try {
            await theaterApi.deleteTheater(id);
            setDeleteConfirm(null);
            fetchTheaters();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleRestore = async (id) => {
        try {
            await theaterApi.restoreTheater(id);
            fetchTheaters();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            IMAX: 'bg-blue-500/20 text-blue-400',
            DOLBY: 'bg-purple-500/20 text-purple-400',
            FOUR_DX: 'bg-orange-500/20 text-orange-400',
            VIP: 'bg-amber-500/20 text-amber-400',
            STANDARD: 'bg-slate-500/20 text-slate-400',
        };
        return colors[type] || 'bg-slate-500/20 text-slate-400';
    };

    return (
        <div className="flex min-h-screen bg-[#0b1220] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <Header title="Quản lý phòng chiếu" />
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Danh sách phòng chiếu</h2>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm phòng
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Tên phòng</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Rạp</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Loại</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Sức chứa</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Trạng thái</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
                                    ) : theaters.length === 0 ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Không có phòng chiếu nào</td></tr>
                                    ) : theaters.map((theater) => (
                                        <tr key={theater.theaterId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="text-white font-medium">{theater.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{theater.cinemaName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTypeColor(theater.theaterType)}`}>
                                                    {theater.theaterType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">
                                                {theater.rowsCount} hàng × {theater.seatsPerRow} ghế = <span className="text-white font-medium">{theater.rowsCount * theater.seatsPerRow}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${theater.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {theater.isActive !== false ? 'Hoạt động' : 'Đã xóa'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {theater.isActive === false ? (
                                                        <button onClick={() => handleRestore(theater.theaterId)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-green-400 transition-colors" title="Khôi phục">
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => openModal(theater)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => setDeleteConfirm(theater.theaterId)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
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
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-white font-bold text-lg">
                                {editingTheater ? 'Cập nhật phòng chiếu' : 'Thêm phòng chiếu mới'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Tên phòng *</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Phòng 1" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Rạp chiếu *</label>
                                <select value={form.cinemaId} onChange={e => setForm({ ...form, cinemaId: e.target.value })} required className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none">
                                    <option value="">Chọn rạp</option>
                                    {cinemas.map(c => <option key={c.cinemaId} value={c.cinemaId}>{c.name} - {c.city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Loại phòng *</label>
                                <select value={form.theaterType} onChange={e => setForm({ ...form, theaterType: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none">
                                    {THEATER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 text-sm block mb-1">Số hàng *</label>
                                    <input type="number" value={form.rowsCount} onChange={e => setForm({ ...form, rowsCount: e.target.value })} required min="1" max="26" placeholder="10" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-sm block mb-1">Ghế/hàng *</label>
                                    <input type="number" value={form.seatsPerRow} onChange={e => setForm({ ...form, seatsPerRow: e.target.value })} required min="1" placeholder="12" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                            </div>
                            {form.rowsCount && form.seatsPerRow && (
                                <p className="text-slate-400 text-xs">Tổng sức chứa: <span className="text-white font-bold">{form.rowsCount * form.seatsPerRow} ghế</span></p>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Hủy</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all">
                                    {editingTheater ? 'Cập nhật' : 'Thêm mới'}
                                </button>
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
                        <p className="text-slate-400 text-sm mb-6">Bạn có chắc muốn xóa phòng chiếu này không?</p>
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

export default TheatersPage;
