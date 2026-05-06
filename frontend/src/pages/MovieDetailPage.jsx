import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Star, Clock, Calendar, MapPin, Play, Ticket } from 'lucide-react';
import { useMovieById } from '../hooks/useMovies';
import showtimeApi from '../api/showtimeApi';

/* ── helpers ── */
const formatDuration = (minutes) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}p` : `${h}h`) : `${m} phút`;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
};

const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const THEATER_TYPE_COLORS = {
    IMAX: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    '4DX': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    DOLBY: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    STANDARD: 'text-slate-400 bg-white/5 border-white/10',
};

/* ── Component ── */
const MovieDetailPage = () => {
    const { id } = useParams();
    const { movie, loading, error, refetch } = useMovieById(id);

    const [todayShowtimes, setTodayShowtimes] = useState([]);
    const [showtimesLoading, setShowtimesLoading] = useState(false);
    const [groupedCinemas, setGroupedCinemas] = useState([]);

    // Fetch today's showtimes for this movie
    useEffect(() => {
        if (!id) return;
        const fetchShowtimes = async () => {
            setShowtimesLoading(true);
            try {
                const res = await showtimeApi.getShowtimesByMovieAndDate(id, getTodayStr());
                const data = res.data?.data || [];
                setTodayShowtimes(Array.isArray(data) ? data : []);
            } catch {
                setTodayShowtimes([]);
            } finally {
                setShowtimesLoading(false);
            }
        };
        fetchShowtimes();
    }, [id]);

    // Group showtimes by theater
    useEffect(() => {
        const grouped = {};
        todayShowtimes.forEach((st) => {
            const theaterId = st.theater?.theaterId || 'unknown';
            if (!grouped[theaterId]) {
                grouped[theaterId] = {
                    theaterId,
                    theaterName: st.theater?.name || 'Phòng chiếu',
                    theaterType: st.theater?.theaterType || 'STANDARD',
                    cinemaName: st.theater?.cinema?.name || 'Rạp chiếu',
                    cinemaAddress: st.theater?.cinema?.address || '',
                    showtimes: [],
                };
            }
            grouped[theaterId].showtimes.push({
                showtimeId: st.showtimeId,
                time: formatTime(st.startTime),
                startTime: st.startTime,
                price: st.price,
            });
        });
        Object.values(grouped).forEach((g) => {
            g.showtimes.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        });
        setGroupedCinemas(Object.values(grouped));
    }, [todayShowtimes]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen">
                <div className="h-[50vh] bg-slate-800 animate-pulse"></div>
                <div className="max-w-[1200px] mx-auto px-6 md:px-20 -mt-24 relative z-20">
                    <div className="grid md:grid-cols-3 gap-8 animate-pulse">
                        <div className="aspect-[2/3] rounded-xl bg-slate-800"></div>
                        <div className="md:col-span-2 space-y-4 pt-8">
                            <div className="h-10 bg-slate-800 rounded w-3/4"></div>
                            <div className="h-6 bg-slate-800 rounded w-1/2"></div>
                            <div className="h-24 bg-slate-800 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen py-20 px-6 md:px-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-lg mb-4">{error}</p>
                    <button onClick={refetch} className="bg-primary text-white font-bold py-2 px-6 rounded-lg">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen py-20 px-6 md:px-20 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white text-lg mb-4">Không tìm thấy phim</p>
                    <Link to="/" className="text-primary font-bold hover:underline">Quay về trang chủ</Link>
                </div>
            </div>
        );
    }

    // Normalize movie data
    const title = movie.title || 'Unknown Title';
    const originalTitle = movie.originalTitle || '';
    const poster = movie.posterUrl || movie.poster || '';
    const backdrop = movie.backdropUrl || movie.backgroundUrl || poster;
    const description = movie.description || movie.synopsis || 'Không có mô tả';
    const rating = movie.rating || movie.averageRating || 0;
    const duration = movie.duration || movie.runtime || 0;
    const releaseDate = movie.releaseDate || '';
    const status = movie.status || 'NOW_SHOWING';
    const ageRating = movie.ageRating || 'P';
    const trailerUrl = movie.trailerUrl || movie.trailer || '';
    const directorName = movie.director?.name || movie.directorName || 'Đang cập nhật';
    const genreName = movie.genre?.name || movie.genres?.[0]?.name || '';
    const actors = Array.isArray(movie.actors) ? movie.actors.map((a) => a.name).join(', ') : '';

    return (
        <div className="min-h-screen">
            {/* ── Backdrop Hero ── */}
            <div className="relative w-full h-[55vh] min-h-[380px]">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/60 to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220] via-transparent to-transparent z-10"></div>
                    {backdrop ? (
                        <img
                            className="w-full h-full object-cover"
                            src={backdrop}
                            alt={title}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900"></div>
                    )}
                </div>
            </div>

            {/* ── Movie Info ── */}
            <div className="max-w-[1200px] mx-auto px-6 md:px-20 -mt-40 relative z-20 pb-20">
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {/* Poster */}
                    <div className="md:col-span-1">
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
                            {poster ? (
                                <img
                                    className="w-full h-full object-cover"
                                    src={poster}
                                    alt={title}
                                    onError={(e) => { e.target.src = 'https://placehold.co/400x600/1e293b/64748b?text=No+Poster'; }}
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                    <span className="text-slate-500">No Poster</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="md:col-span-2 flex flex-col justify-end pb-4">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${status === 'COMING_SOON' ? 'bg-amber-500/20 text-amber-400' : 'bg-primary/20 text-primary'}`}>
                                {status === 'COMING_SOON' ? 'Sắp chiếu' : 'Đang chiếu'}
                            </span>
                            <span className="bg-white/10 text-white text-xs font-bold px-2.5 py-1 rounded-lg">{ageRating}</span>
                            {genreName && (
                                <span className="bg-white/5 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-white/10">{genreName}</span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-1 uppercase italic leading-tight">
                            {title}
                        </h1>
                        {originalTitle && originalTitle !== title && (
                            <p className="text-slate-400 text-lg mb-4 italic">{originalTitle}</p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-5 text-slate-400 mb-6 flex-wrap">
                            {rating > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span className="text-white font-bold text-lg">{Number(rating).toFixed(1)}</span>
                                    <span className="text-sm">/10</span>
                                </span>
                            )}
                            {duration > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {formatDuration(duration)}
                                </span>
                            )}
                            {releaseDate && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(releaseDate)}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-2xl">
                            {description}
                        </p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-slate-500 text-xs mb-1">Đạo diễn</p>
                                <p className="text-white font-semibold text-sm">{directorName}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-slate-500 text-xs mb-1">Thể loại</p>
                                <p className="text-white font-semibold text-sm">{genreName || 'Đang cập nhật'}</p>
                            </div>
                            {actors && (
                                <div className="col-span-2 bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-slate-500 text-xs mb-1">Diễn viên</p>
                                    <p className="text-white font-semibold text-sm line-clamp-2">{actors}</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {status !== 'COMING_SOON' && (
                                <Link
                                    to={`/showtimes/${id}`}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl shadow-primary/30 active:scale-95"
                                >
                                    <Ticket className="w-5 h-5" />
                                    Đặt vé ngay
                                </Link>
                            )}
                            {trailerUrl && (
                                <a
                                    href={trailerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-8 rounded-xl transition-all border border-white/10"
                                >
                                    <Play className="w-5 h-5" />
                                    Xem trailer
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Today's Showtimes ── */}
                {status !== 'COMING_SOON' && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-primary" />
                                Lịch chiếu hôm nay
                            </h2>
                            <Link
                                to={`/showtimes/${id}`}
                                className="text-primary hover:text-primary/80 text-sm font-bold transition-colors"
                            >
                                Xem tất cả ngày →
                            </Link>
                        </div>

                        {showtimesLoading ? (
                            <div className="space-y-3">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                                        <div className="h-5 bg-white/10 rounded w-48 mb-3"></div>
                                        <div className="flex gap-2">
                                            {[...Array(4)].map((_, j) => (
                                                <div key={j} className="h-12 w-20 bg-white/10 rounded-xl"></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : groupedCinemas.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">Không có suất chiếu nào hôm nay</p>
                                <Link
                                    to={`/showtimes/${id}`}
                                    className="mt-3 inline-block text-primary text-sm font-bold hover:underline"
                                >
                                    Xem lịch chiếu các ngày khác
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {groupedCinemas.map((cinema) => {
                                    const typeColor = THEATER_TYPE_COLORS[cinema.theaterType] || THEATER_TYPE_COLORS.STANDARD;
                                    return (
                                        <div key={cinema.theaterId} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-white font-bold">{cinema.cinemaName}</h3>
                                                    <p className="text-slate-400 text-sm">{cinema.theaterName}</p>
                                                    {cinema.cinemaAddress && (
                                                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {cinema.cinemaAddress}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${typeColor}`}>
                                                    {cinema.theaterType}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {cinema.showtimes.map((st) => (
                                                    <Link
                                                        key={st.showtimeId}
                                                        to={`/booking/${st.showtimeId}`}
                                                        className="flex flex-col items-center px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:border-primary hover:bg-primary/10 text-white transition-all group"
                                                    >
                                                        <span className="font-bold text-sm group-hover:text-primary">{st.time}</span>
                                                        {st.price && (
                                                            <span className="text-[10px] text-slate-400 mt-0.5">
                                                                {Number(st.price).toLocaleString('vi-VN')}đ
                                                            </span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Coming Soon Notice ── */}
                {status === 'COMING_SOON' && (
                    <div className="mt-8">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 text-center">
                            <Calendar className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-black text-white mb-2">Sắp khởi chiếu</h3>
                            {releaseDate && (
                                <p className="text-slate-300">
                                    Phim sẽ được khởi chiếu vào ngày{' '}
                                    <span className="text-amber-400 font-bold">{formatDate(releaseDate)}</span>
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetailPage;
