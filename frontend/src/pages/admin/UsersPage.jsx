import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import userApi from '../../api/userApi';

const ROLES = ['ADMIN', 'STAFF', 'CUSTOMER'];

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState({
        username: '', fullName: '', email: '', phone: '', password: '', role: 'CUSTOMER'
    });

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await userApi.getAllUsers(currentPage, 10);
            // Users API may return array or paginated
            const data = res.data;
            if (Array.isArray(data)) {
                setUsers(data);
                setTotalPages(1);
            } else if (data?.content) {
                setUsers(data.content);
                setTotalPages(data.totalPages || 1);
            } else if (data?.data?.content) {
                setUsers(data.data.content);
                setTotalPages(data.data.totalPages || 1);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user = null) => {
        setEditingUser(user);
        setFormError('');
        if (user) {
            setForm({
                username: user.username || '',
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                password: '',
                role: user.role || 'CUSTOMER',
            });
        } else {
            setForm({ username: '', fullName: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
        }
        setShowModal(true);
    };

    const validateForm = () => {
        if (!editingUser) {
            // Validate username only on create
            if (!form.username.trim()) return 'Vui lòng nhập username';
            if (form.username.trim().length < 3) return 'Username phải có ít nhất 3 ký tự';
            if (/\s/.test(form.username)) return 'Username không được chứa khoảng trắng';
        }
        if (!form.email.trim()) return 'Vui lòng nhập email';
        if (!editingUser && !form.password.trim()) return 'Vui lòng nhập mật khẩu';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            const payload = { ...form };
            if (editingUser && !payload.password) delete payload.password;
            if (editingUser) {
                await userApi.updateUser(editingUser.userId, payload);
            } else {
                await userApi.createUser(payload);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            const serverMsg = err.response?.data?.message || 'Có lỗi xảy ra';
            if (
                serverMsg.toLowerCase().includes('username') &&
                (serverMsg.toLowerCase().includes('exist') || serverMsg.toLowerCase().includes('tồn tại') || serverMsg.toLowerCase().includes('da ton tai'))
            ) {
                setFormError('Username này đã tồn tại. Vui lòng chọn username khác.');
            } else {
                setFormError(serverMsg);
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await userApi.deleteUser(id);
            setDeleteConfirm(null);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleToggleActive = async (user) => {
        try {
            if (user.isActive) {
                await userApi.deactivateUser(user.userId);
            } else {
                await userApi.activateUser(user.userId);
            }
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const filteredUsers = users.filter(u => {
        if (!search) return true;
        const q = search.toLowerCase();
        return u.fullName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q) ||
            u.phone?.includes(q);
    });

    const getRoleColor = (role) => {
        return role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400';
    };

    return (
        <div className="flex min-h-screen bg-[#0b1220] text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:ml-64 min-w-0">
                <Header title="Quản lý người dùng" />
                <div className="p-6 space-y-6">
                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm theo tên, email, SĐT..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm người dùng
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-white">Người dùng</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-white">Email</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-white">Số điện thoại</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-white">Vai trò</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-white">Trạng thái</th>
                                        <th className="px-4 py-3 text-xs font-bold uppercase text-white text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Không có người dùng nào</td></tr>
                                    ) : filteredUsers.map((user) => (
                                        <tr key={user.userId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                        {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{user.fullName || '—'}</p>
                                                        <p className="text-slate-500 text-xs">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{user.email}</td>
                                            <td className="px-4 py-3 text-slate-300 text-sm">{user.phone || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {user.isActive !== false ? 'Hoạt động' : 'Vô hiệu'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleToggleActive(user)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Bật/Tắt">
                                                        {user.isActive !== false
                                                            ? <ToggleRight className="w-4 h-4 text-green-400" />
                                                            : <ToggleLeft className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => openModal(user)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(user.userId)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors">
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
                            <h3 className="text-white font-bold text-lg">
                                {editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Form-level error */}
                            {formError && (
                                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                    <span className="text-red-400 text-xs mt-0.5">⚠</span>
                                    <p className="text-red-400 text-xs">{formError}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">
                                    Username {!editingUser && <span className="text-red-400">*</span>}
                                </label>
                                <input
                                    value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                    required={!editingUser}
                                    disabled={!!editingUser}
                                    placeholder="Enter username"
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all ${editingUser
                                        ? 'bg-white/[0.03] border-white/5 text-slate-500 cursor-not-allowed'
                                        : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                />
                                {editingUser && (
                                    <p className="text-slate-600 text-xs mt-1">Username không thể thay đổi sau khi tạo</p>
                                )}
                                {!editingUser && (
                                    <p className="text-slate-600 text-xs mt-1">Ít nhất 3 ký tự, không chứa khoảng trắng</p>
                                )}
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Họ tên</label>
                                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Nguyễn Văn A" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Email *</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="user@example.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Số điện thoại</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0901234567" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">
                                    Mật khẩu {editingUser ? '(để trống nếu không đổi)' : '*'}
                                </label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editingUser} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Vai trò</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary outline-none">
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Hủy</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all">
                                    {editingUser ? 'Cập nhật' : 'Thêm mới'}
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
                        <p className="text-slate-400 text-sm mb-6">Bạn có chắc muốn xóa người dùng này không?</p>
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

export default UsersPage;
