import { Link } from 'react-router-dom';
import { Film, Mail, Phone, MapPin, Share2, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black py-16 px-6 md:px-20 border-t border-white/5">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1 - Logo & Description */}
                    <div className="col-span-1 lg:col-span-1">
                        <div className="flex items-center gap-2 text-primary mb-6">
                            <Film className="w-10 h-10" />
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                                Cine<span className="text-white">Pulse</span>
                            </h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Trải nghiệm điện ảnh hoàn hảo với công nghệ hiện đại và dịch vụ đẳng cấp. Đặt vé xem phim dễ dàng, nhanh chóng.
                        </p>
                        <div className="flex gap-4">
                            <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all" href="#">
                                <Share2 className="w-5 h-5" />
                            </a>
                            <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all" href="#">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-all" href="#">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2 - Quick Links */}
                    <div>
                        <h6 className="text-white font-bold uppercase tracking-widest mb-6">Liên kết nhanh</h6>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li>
                                <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                            </li>
                            <li>
                                <Link to="/movies" className="hover:text-primary transition-colors">Phim</Link>
                            </li>
                            <li>
                                <Link to="/showtimes" className="hover:text-primary transition-colors">Lịch chiếu</Link>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary transition-colors">Rạp chiếu</a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3 - Contact Info */}
                    <div>
                        <h6 className="text-white font-bold uppercase tracking-widest mb-6">Thông tin liên hệ</h6>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>contact@cinepulse.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>1900-xxxx</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>Hà Nội, Việt Nam</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4 - Newsletter */}
                    <div>
                        <h6 className="text-white font-bold uppercase tracking-widest mb-6">Newsletter</h6>
                        <p className="text-slate-400 text-sm mb-4">Nhận các ưu đãi đặc biệt và tin tức phim mới nhất.</p>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-white placeholder-slate-400"
                                placeholder="Địa chỉ email"
                                type="email"
                            />
                            <button className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom - Copyright */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-xs">© 2024 CinePulse Media Group. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-slate-500">
                        <a className="hover:text-white" href="#">Privacy Policy</a>
                        <a className="hover:text-white" href="#">Terms of Service</a>
                        <a className="hover:text-white" href="#">Cookie Settings</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

