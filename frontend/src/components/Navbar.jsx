import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, MapPin, User, LogIn, Search, LogOut, ChevronDown, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const initials = user?.fullName
        ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0b1220]/90 backdrop-blur-md px-6 md:px-20 py-4">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                {/* Logo + Nav */}
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-2 text-primary shrink-0">
                        <Film className="w-9 h-9" />
                        <h1 className="text-xl font-black tracking-tighter uppercase italic">
                            Cinema<span className="text-white">Booking</span>
                        </h1>
                    </Link>

                    {/* Navigation Menu */}
                    <nav className="hidden lg:flex items-center gap-6">
                        <Link
                            to="/"
                            className={`font-medium text-sm transition-colors ${isActive('/') ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
                        >
                            Trang chủ
                        </Link>
                        <Link
                            to="/movies/now-showing"
                            className={`font-medium text-sm transition-colors ${isActive('/movies/now-showing') ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
                        >
                            Đang chiếu
                        </Link>
                        <Link
                            to="/movies/coming-soon"
                            className={`font-medium text-sm transition-colors ${isActive('/movies/coming-soon') ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
                        >
                            Sắp chiếu
                        </Link>
                    </nav>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3 flex-1 justify-end max-w-xl">
                    {/* Search */}
                    <div className="relative w-full max-w-xs hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-white placeholder-slate-400 transition-all"
                            placeholder="Tìm kiếm phim..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>

                    {/* Location */}
                    <button className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-2 transition-all text-white shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Hà Nội</span>
                    </button>

                    {/* Auth Section */}
                    {user ? (
                        /* Logged-in user menu */
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-2 pr-3 py-1.5 transition-all"
                            >
                                <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-primary text-xs font-black">
                                    {initials}
                                </div>
                                <span className="text-white text-sm font-medium hidden md:block max-w-[100px] truncate">
                                    {user.fullName?.split(' ').pop() || 'Tài khoản'}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0f1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="text-white font-bold text-sm truncate">{user.fullName}</p>
                                        <p className="text-slate-400 text-xs truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-sm"
                                        >
                                            <User className="w-4 h-4" />
                                            Tài khoản của tôi
                                        </Link>
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-sm"
                                        >
                                            <Ticket className="w-4 h-4" />
                                            Vé của tôi
                                        </Link>
                                        {user.role === 'ADMIN' && (
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-amber-400 hover:bg-amber-500/10 transition-colors text-sm"
                                            >
                                                <Film className="w-4 h-4" />
                                                Quản trị
                                            </Link>
                                        )}
                                    </div>
                                    <div className="border-t border-white/10 py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Guest auth buttons */
                        <div className="flex items-center gap-2 shrink-0">
                            <Link
                                to="/login"
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-all text-white font-medium text-sm"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Đăng nhập</span>
                            </Link>
                            <Link
                                to="/register"
                                className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-5 rounded-full text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                <span className="hidden sm:inline">Đăng ký</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
