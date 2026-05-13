import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agree: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const validate = () => {
        if (!form.username.trim()) return 'Vui lòng nhập username';
        if (form.username.trim().length < 3) return 'Username phải có ít nhất 3 ký tự';
        if (/\s/.test(form.username)) return 'Username không được chứa khoảng trắng';
        if (!form.email.trim()) return 'Vui lòng nhập email';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email không hợp lệ';
        if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        if (form.password !== form.confirmPassword) return 'Mật khẩu xác nhận không khớp';
        if (!form.agree) return 'Vui lòng đồng ý với điều khoản dịch vụ';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            await register({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const serverMsg =
                err.response?.data?.message ||
                err.response?.data?.data?.username ||
                err.response?.data?.data?.email ||
                err.message ||
                '';
            // Hiển thị lỗi rõ ràng khi username đã tồn tại
            if (
                serverMsg.toLowerCase().includes('username') &&
                (serverMsg.toLowerCase().includes('exist') || serverMsg.toLowerCase().includes('tồn tại') || serverMsg.toLowerCase().includes('da ton tai'))
            ) {
                setError('Username này đã được sử dụng. Vui lòng chọn username khác.');
            } else {
                setError(serverMsg || 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-6">
            <div className="max-w-[450px] mx-auto">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 text-primary mb-8">
                    <Film className="w-10 h-10" />
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                        Cinema<span className="text-white">Booking</span>
                    </h1>
                </Link>

                {/* Register Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-black text-white mb-2">Đăng ký</h2>
                    <p className="text-slate-400 mb-6">Tạo tài khoản để đặt vé nhanh chóng.</p>

                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Alert */}
                    {success && (
                        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-5">
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                            <p className="text-green-400 text-sm">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-slate-400 text-sm block mb-2">
                                Username <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                autoComplete="username"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                            <p className="text-slate-500 text-xs mt-1">Ít nhất 3 ký tự, không chứa khoảng trắng</p>
                        </div>

                        <div>
                            <label className="text-slate-400 text-sm block mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                autoComplete="email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-slate-400 text-sm block mb-2">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                                    autoComplete="new-password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-400 text-sm block mb-2">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu"
                                autoComplete="new-password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                name="agree"
                                checked={form.agree}
                                onChange={handleChange}
                                className="w-4 h-4 accent-primary rounded mt-1 cursor-pointer"
                            />
                            <span className="text-slate-400 text-sm">
                                Tôi đồng ý với{' '}
                                <a href="#" className="text-primary hover:underline">Điều khoản dịch vụ</a>
                                {' '}và{' '}
                                <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Đang đăng ký...
                                </>
                            ) : (
                                'Đăng ký'
                            )}
                        </button>
                    </form>


                </div>

                <p className="text-center text-slate-400 mt-6">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
