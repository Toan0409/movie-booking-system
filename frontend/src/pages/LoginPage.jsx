import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to previous page or home after login
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!usernameOrEmail.trim()) {
            setError('Vui lòng nhập username hoặc email');
            return;
        }
        if (!password.trim()) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }

        setLoading(true);
        try {
            await login(usernameOrEmail.trim(), password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-6">
            <div className="max-w-[450px] mx-auto">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 text-primary mb-8">
                    <Film className="w-10 h-10" />
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                        Cinema<span className="text-white">Booking</span>
                    </h1>
                </Link>

                {/* Login Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-black text-white mb-2">Đăng nhập</h2>
                    <p className="text-slate-400 mb-6">Chào mừng trở lại! Đăng nhập để tiếp tục.</p>

                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-slate-400 text-sm block mb-2">Username hoặc Email</label>
                            <input
                                type="text"
                                value={usernameOrEmail}
                                onChange={(e) => setUsernameOrEmail(e.target.value)}
                                placeholder="Nhập username hoặc email"
                                autoComplete="username"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-slate-400 text-sm block mb-2">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    autoComplete="current-password"
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

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
                                <span className="text-slate-400 text-sm">Ghi nhớ đăng nhập</span>
                            </label>
                            <a href="#" className="text-primary text-sm hover:underline">Quên mật khẩu?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>


                </div>

                <p className="text-center text-slate-400 mt-6">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-primary font-bold hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
