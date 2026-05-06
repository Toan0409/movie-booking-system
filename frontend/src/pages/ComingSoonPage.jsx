import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Film, Search, ChevronLeft, ChevronRight, Calendar, Clock, X } from 'lucide-react';
import movieApi from '../api/movieApi';

/* ── helpers ── */
const normalizeMovie = (m) => ({
    id: m.movieId ?? m.id,
    title: m.title ?? 'Không có tiêu đề',
    poster: m.posterUrl ?? m.poster ?? m.imageUrl ?? null,
    genre: m.genre?.name ?? m.genreName ?? '',
    duration: m.duration ?? 0,
    ageRating: m.ageRating ?? '',
    releaseDate: m.releaseDate ?? '',
    description: m.description ?? '',
});

const formatReleaseDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    } catch {
        return dateStr;
    }
};

const getDaysUntilRelease = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
};

const MovieCard = ({ movie }) => {
    const m = normalizeMovie(movie);
    const daysLeft = getDaysUntilRelease(m.releaseDate);

    return (
        <Link to={`/movies/${m.id}`} className="group block">
            <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-slate-800 mb-3">
                {m.poster ? (
                    <img
                        src={m.poster}
                        alt={m.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90"
                        onError={(e) => { e.target.src = 'https://placehold.co/300x450/1e293b/64748b?text=No+Image'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-slate-600" />
                    </div>
                )}

                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-3">
                    {daysLeft !== null ? (
                        <div className="bg-amber-500/90 text-black text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {daysLeft} ngày nữa
                        </div>
                    ) : (
                        <div className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg">
                            Sắp ra mắt
                        </div>
                    )}
                </div>

                {/* Age Rating */}
                {m.ageRating && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded">
                        {m.ageRating}
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                        Xem chi tiết
                    </span>
                </div>
            </div>

            <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {m.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
                {m.genre && <span className="text-slate-400 text-xs">{m.genre}</span>}
                {m.releaseDate && (
                    <span className="text-amber-400 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatReleaseDate(m.releaseDate)}
                    </span>
                )}
            </div>
        </Link>
    );
};

const SkeletonCard = () => (
    <div className="animate-pulse">
        <div className="aspect-[2/3] bg-slate-800 rounded-xl mb-3"></div>
        <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
    </div>
);

const ComingSoonPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const page = parseInt(searchParams.get('page') || '0', 10);
    const search = searchParams.get('search') || '';
    const PAGE_SIZE = 12;

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (search) {
                res = await movieApi.searchMovies(search, page, PAGE_SIZE);
            } else {
                res = await movieApi.getComingSoon(page, PAGE_SIZE);
            }

            const body = res.data;
            if (body?.success) {
                const d = body.data;
                setMovies(d?.content ?? (Array.isArray(d) ? d : []));
                setTotalPages(d?.totalPages ?? 1);
                setTotalElements(d?.totalElements ?? 0);
            } else {
                setMovies([]);
            }
        } catch {
            setError('Không thể tải danh sách phim. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchMovies(); }, [fetchMovies]);

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value); else next.delete(key);
        next.set('page', '0');
        setSearchParams(next);
    };

    const goToPage = (p) => {
        const next = new URLSearchParams(searchParams);
        next.set('page', String(p));
        setSearchParams(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen py-10 px-6 md:px-20">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-8 bg-amber-500 rounded-full"></div>
                        <h1 className="text-3xl font-black text-white">Phim sắp chiếu</h1>
                    </div>
                    {totalElements > 0 && !loading && (
                        <p className="text-slate-400 ml-4">{totalElements} bộ phim sắp ra mắt</p>
                    )}
                </div>

                {/* Search */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm phim sắp chiếu..."
                            defaultValue={search}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') setParam('search', e.target.value);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                        />
                    </div>
                    {search && (
                        <button
                            onClick={() => setSearchParams({})}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-slate-400 hover:text-white text-sm transition-all"
                        >
                            <X className="w-4 h-4" />
                            Xóa bộ lọc
                        </button>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="text-center py-16">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button onClick={fetchMovies} className="bg-primary text-white font-bold py-2 px-6 rounded-lg">
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Movie Grid */}
                {!error && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {loading
                                ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonCard key={i} />)
                                : movies.map((movie) => (
                                    <MovieCard key={movie.movieId ?? movie.id} movie={movie} />
                                ))
                            }
                        </div>

                        {/* Empty state */}
                        {!loading && movies.length === 0 && (
                            <div className="text-center py-20">
                                <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg mb-2">Không tìm thấy phim nào</p>
                                <p className="text-slate-500 text-sm">Hãy quay lại sau để xem phim sắp chiếu mới nhất</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page === 0}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-40 hover:bg-white/10 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {[...Array(totalPages)].map((_, i) => {
                                    if (totalPages > 7 && Math.abs(i - page) > 2 && i !== 0 && i !== totalPages - 1) {
                                        if (i === 1 || i === totalPages - 2) return <span key={i} className="text-slate-500">…</span>;
                                        return null;
                                    }
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => goToPage(i)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${i === page
                                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                                                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-40 hover:bg-white/10 transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ComingSoonPage;
