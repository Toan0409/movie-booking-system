import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Film,
    Building2,
    Calendar,
    Ticket,
    Users,
    Armchair,
    UserRound,
    Clapperboard,
    Tag,
    Home,
    ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Phim', path: '/admin/movies', icon: Film },
    { label: 'Rạp chiếu', path: '/admin/cinemas', icon: Building2 },
    { label: 'Phòng chiếu', path: '/admin/theaters', icon: Clapperboard },
    { label: 'Ghế ngồi', path: '/admin/seats', icon: Armchair },
    { label: 'Suất chiếu', path: '/admin/showtimes', icon: Calendar },
    { label: 'Đặt vé', path: '/admin/bookings', icon: Ticket },
    { label: 'Người dùng', path: '/admin/users', icon: Users },
    { label: 'Diễn viên', path: '/admin/actors', icon: UserRound },
    { label: 'Đạo diễn', path: '/admin/directors', icon: UserRound },
    { label: 'Thể loại', path: '/admin/genres', icon: Tag },
];

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-64 border-r border-white/10 bg-[#080f1e] fixed lg:flex flex-col h-screen hidden z-40">
            {/* Logo */}
            <div className="p-5 flex items-center gap-3 border-b border-white/10">
                <div className="bg-primary rounded-xl p-2 shrink-0">
                    <Film className="text-white w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-black text-base leading-none text-white">CinemaAdmin</h1>
                    <p className="text-xs text-white/50 mt-0.5">Management Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive(path)
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                            }`}
                    >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive(path) ? 'text-primary' : 'text-white/40 group-hover:text-white'}`} />
                        <span className="text-sm font-medium flex-1">{label}</span>
                        {isActive(path) && <ChevronRight className="w-3 h-3 text-primary" />}
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 space-y-2">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-white/5 hover:text-white transition-all text-sm font-medium"
                >
                    <Home className="w-4 h-4" />
                    Về trang chủ
                </Link>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0"></div>
                        <span className="text-xs font-medium text-green-400">API Connected</span>
                    </div>
                    <p className="text-xs text-white/30 mt-1">localhost:8000</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
