import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Film, Search, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import movieApi from '../api/movieApi';
import genreApi from '../api/genreApi';

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

const MovieCard = ({ movie }) => {
    const m = normalizeMovie(movie);
    return (
        <Link to={`/movies/${m.id}`} className="group block">
            <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-slate-800 mb-3">
                {m.poster ? (
                    <img
                        src={m.poster}
                        alt={m.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://placehold.co/300x450/1e293b/64748b?text=No+Image'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-slate-600" />
                    </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        Đặt vé ngay
                    </span>
                </div>
                {/* Age Rating Badge */}
                {m.ageRating && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded">
                        {m.ageRating}
                    </div>
                )}
            </div>
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {m.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
                {m.genre && (
                    <span className="text-slate-400 text-xs">{m.genre}</span>
                )}
                {m.duration > 0 && (
                    <span className="text-slate-500 text-xs">• {m.duration} phút</span>
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

const NowShowingPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const page = parseInt(searchParams.get('page') || '0', 10);
    const search = searchParams.get('search') || '';
    const genreId = searchParams.get('genre') || '';
    const PAGE_SIZE = 12;

    // Fetch genres for filter
    useEffect(() => {
        genreApi.getAllGenresClient?.()
            .then((res) => {
                const data = res.data?.data?.content || res.data?.data || res.data || [];
                setGenres(Array.isArray(data) ? data : []);
            })
            .catch(() => { });
    }, []);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            if (search) {
                res = await movieApi.searchMovies(search, page, PAGE_SIZE);
            } else if (genreId) {
                res = await movieApi.getMoviesByGenre(genreId, page, PAGE_SIZE);
            } else {
                res = await movieApi.getNowShowing(page, PAGE_SIZE);
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
    }, [page, search, genreId]);

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
                        <div className="w-1 h-8 bg-primary rounded-full"></div>
                        <h1 className="text-3xl font-black text-white">Phim đang chiếu</h1>
                    </div>
                    {totalElements > 0 && !loading && (
                        <p className="text-slate-400 ml-4">{totalElements} bộ phim</p>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm phim..."
                            defaultValue={search}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') setParam('search', e.target.value);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none text-sm"
                        />
                    </div>

                    {/* Genre Filter */}
                    {genres.length > 0 && (
                        <select
                            value={genreId}
                            onChange={(e) => setParam('genre', e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="" className="bg-slate-900">Tất cả thể loại</option>
                            {genres.map((g) => (
                                <option key={g.genreId ?? g.id} value={g.genreId ?? g.id} className="bg-slate-900">
                                    {g.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Clear filters */}
                    {(search || genreId) && (
                        <button
                            onClick={() => setSearchParams({})}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-slate-400 hover:text-white text-sm transition-all"
                        >
                            <X className="w-4 h-4" />
                            Xóa bộ lọc
                        </button>
                    )}
                </div>

                {/* Active filter tags */}
                {(search || genreId) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {search && (
                            <span className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                                <Search className="w-3 h-3" />
                                "{search}"
                                <button onClick={() => setParam('search', '')}><X className="w-3 h-3" /></button>
                            </span>
                        )}
                        {genreId && (
                            <span className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                                <SlidersHorizontal className="w-3 h-3" />
                                {genres.find((g) => String(g.genreId ?? g.id) === genreId)?.name || 'Thể loại'}
                                <button onClick={() => setParam('genre', '')}><X className="w-3 h-3" /></button>
                            </span>
                        )}
                    </div>
                )}

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
                                <Film className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg mb-2">Không tìm thấy phim nào</p>
                                <p className="text-slate-500 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
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
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
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

export default NowShowingPage;
