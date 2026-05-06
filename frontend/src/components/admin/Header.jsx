import { Bell, Search, User } from 'lucide-react';

const Header = ({ title = 'Dashboard' }) => {
    return (
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
                <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
            <div className="flex items-center gap-3">
                <button className="size-10 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                    <Bell className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-white hidden md:block">Admin</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
