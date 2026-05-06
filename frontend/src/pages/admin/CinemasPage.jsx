import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RotateCcw, Search } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import cinemaApi from '../../api/cinemaApi';

const CinemasPage = () => {
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCinema, setEditingCinema] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({
        name: '', address: '', city: '', phone: '', email: '', description: ''
    });

    useEffect(() => {
        fetchCinemas();
    }, []);

    const fetchCinemas = async () => {
        try {
            setLoading(true);
            const res = await cinemaApi.getAllCinemas();
            if (res.data?.success) {
                setCinemas(res.data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (cinema = null) => {
        setEditingCinema(cinema);
        if (cinema) {
            setForm({
                name: cinema.name || '',
                address: cinema.address || '',
                city: cinema.city || '',
                phone: cinema.phone || '',
                email: cinema.email || '',
                description: cinema.description || '',
            });
        } else {
            setForm({ name: '', address: '', city: '', phone: '', email: '', description: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCinema) {
                await cinemaApi.updateCinema(editingCinema.cinemaId, form);
            } else {
                await cinemaApi.createCinema(form);
            }
            setShowModal(false);
            fetchCinemas();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        try {
            await cinemaApi.deleteCinema(id);
            setDeleteConfirm(null);
            fetchCinemas();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleRestore = async (id) => {
        try {
            await cinemaApi.restoreCinema(id);
            fetchCinemas();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0b1220] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <Header title="Quản lý rạp chiếu" />
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Danh sách rạp chiếu</h2>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm rạp
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Tên rạp</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Địa chỉ</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Thành phố</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Liên hệ</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400">Trạng thái</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-400 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
                                    ) : cinemas.length === 0 ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Không có rạp nào</td></tr>
                                    ) : cinemas.map((cinema) => (
                                        <tr key={cinema.cinemaId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="text-white font-medium">{cinema.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{cinema.address}</td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{cinema.city}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-300 text-sm">{cinema.phone}</p>
                                                <p className="text-slate-400 text-xs">{cinema.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${cinema.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {cinema.isActive !== false ? 'Hoạt động' : 'Đã xóa'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {cinema.isActive === false ? (
                                                        <button onClick={() => handleRestore(cinema.cinemaId)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-green-400 transition-colors" title="Khôi phục">
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => openModal(cinema)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => setDeleteConfirm(cinema.cinemaId)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors">
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
                    </div>
                </div>
            </main>

            {/* Form Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-white font-bold text-lg">
                                {editingCinema ? 'Cập nhật rạp chiếu' : 'Thêm rạp chiếu mới'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-slate-400 text-sm block mb-1">Tên rạp *</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="CGV Vincom Center" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-slate-400 text-sm block mb-1">Địa chỉ *</label>
                                    <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required placeholder="72 Lê Thánh Tôn, Q.1" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-sm block mb-1">Thành phố *</label>
                                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required placeholder="Hồ Chí Minh" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-sm block mb-1">Số điện thoại</label>
                                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="028 3822 9999" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-slate-400 text-sm block mb-1">Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contact@cgv.vn" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-slate-400 text-sm block mb-1">Mô tả</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Mô tả về rạp..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Hủy</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all">
                                    {editingCinema ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f1a2e] border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center">
                        <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">Xác nhận xóa</h3>
                        <p className="text-slate-400 text-sm mb-6">Bạn có chắc muốn xóa rạp chiếu này không?</p>
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

export default CinemasPage;
