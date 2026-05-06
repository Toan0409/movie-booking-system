import { useState, useEffect } from 'react';
import bookingApi from '../../api/bookingApi';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(amount || 0);

const TopMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        bookingApi.getAllBookings()
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

                // Aggregate revenue by movie title
                const movieMap = {};
                data.forEach(b => {
                    if (b.status === 'CANCELLED') return;
                    const title = b.movieTitle || b.showtime?.movie?.title || 'Không rõ';
                    if (!movieMap[title]) movieMap[title] = { revenue: 0, tickets: 0 };
                    movieMap[title].revenue += b.finalAmount || 0;
                    movieMap[title].tickets += b.bookingDetails?.length || 0;
                });

                // Sort by revenue desc, take top 5
                const sorted = Object.entries(movieMap)
                    .map(([name, stats]) => ({ name, ...stats }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);

                // Calculate progress relative to max
                const maxRevenue = sorted[0]?.revenue || 1;
                const withProgress = sorted.map(m => ({
                    ...m,
                    progress: Math.round((m.revenue / maxRevenue) * 100),
                }));

                setMovies(withProgress);
            })
            .catch(() => setMovies([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex-1 p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/10">
            <h2 className="text-lg font-black text-white mb-6">Phim bán chạy</h2>

            {loading ? (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                            <div className="h-3 bg-white/10 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            ) : movies.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                    Chưa có dữ liệu
                </div>
            ) : (
                <div className="space-y-5">
                    {movies.map((movie, index) => (
                        <div key={index} className="group">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-slate-500 text-xs font-bold w-4 shrink-0">
                                        #{index + 1}
                                    </span>
                                    <span className="font-semibold text-white text-sm truncate">
                                        {movie.name}
                                    </span>
                                </div>
                                <span className="text-primary font-bold text-xs shrink-0 ml-2">
                                    {formatCurrency(movie.revenue)}
                                </span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-700"
                                    style={{ width: `${movie.progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-slate-500 text-xs">{movie.tickets} vé</span>
                                <span className="text-slate-500 text-xs">{movie.progress}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopMovies;
