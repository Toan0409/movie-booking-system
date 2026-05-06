import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft } from 'lucide-react';
import showtimeApi from '../api/showtimeApi';

const ShowtimePage = () => {
    const { id } = useParams(); // movieId

    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Format date to yyyy-MM-dd (local, no timezone shift)
    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Format time from ISO string
    const formatTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Format duration
    const formatDuration = (minutes) => {
        if (!minutes) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? (m > 0 ? `${h}h ${m}p` : `${h}h`) : `${m} phút`;
    };

    // Generate next 7 days
    const getNext7Days = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const dates = getNext7Days();

    // Fetch showtimes from API
    useEffect(() => {
        const fetchShowtimes = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await showtimeApi.getShowtimesByMovieAndDate(id, formatDate(selectedDate));
                const data = res.data?.data || [];
                setShowtimes(data);

                // Extract movie info from first showtime
                if (data.length > 0 && data[0].movie) {
                    setMovie(data[0].movie);
                }
            } catch (err) {
                console.error(err);
                setError('Không thể tải lịch chiếu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchShowtimes();
    }, [id, selectedDate]);

    // Group showtimes by theater
    useEffect(() => {
        const grouped = {};

        showtimes.forEach(st => {
            const theaterId = st.theater?.theaterId || st.theaterId || 'unknown';
            const theaterName = st.theater?.name || 'Phòng chiếu';
            const theaterType = st.theater?.theaterType || '2D';
            const cinemaName = st.theater?.cinema?.name || 'Rạp chiếu';
            const cinemaAddress = st.theater?.cinema?.address || '';

            if (!grouped[theaterId]) {
                grouped[theaterId] = {
                    theaterId,
                    theaterName,
                    theaterType,
                    cinemaName,
                    cinemaAddress,
                    showtimes: [],
                };
            }

            grouped[theaterId].showtimes.push({
                showtimeId: st.showtimeId,
                time: formatTime(st.startTime),
                startTime: st.startTime,
                price: st.price,
                availableSeats: st.availableSeats ?? null,
            });
        });

        // Sort showtimes by time
        Object.values(grouped).forEach(g => {
            g.showtimes.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        });

        setCinemas(Object.values(grouped));
    }, [showtimes]);

    const THEATER_TYPE_COLORS = {
        IMAX: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        '4DX': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        DOLBY: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        STANDARD: 'text-slate-400 bg-white/5 border-white/10',
    };

    return (
        <div className="min-h-screen py-8 px-4 md:px-20">
            <div className="max-w-[1000px] mx-auto">

                {/* Back button */}
                <Link to={`/movies/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    Quay lại
                </Link>

                {/* Movie Info */}
                {movie && (
                    <div className="flex items-center gap-4 mb-8 bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0">
                            <img
                                className="w-full h-full object-cover"
                                src={movie.posterUrl || movie.poster}
                                alt={movie.title}
                                onError={e => { e.target.src = 'https://placehold.jp/56x80.png'; }}
                            />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-white">{movie.title}</h1>
                            <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm flex-wrap">
                                {movie.ageRating && (
                                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-bold">{movie.ageRating}</span>
                                )}
                                {movie.duration && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatDuration(movie.duration)}
                                    </span>
                                )}
                                {movie.genre?.name && <span>{movie.genre.name}</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Date Picker */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Chọn ngày
                    </h2>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {dates.map((date, index) => {
                            const isActive = date.toDateString() === selectedDate.toDateString();
                            const isToday = index === 0;
                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex flex-col items-center justify-center min-w-[64px] h-[72px] rounded-xl border transition-all shrink-0 ${isActive
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-primary/50 hover:text-white'
                                        }`}
                                >
                                    <span className="text-[10px] uppercase font-semibold">
                                        {isToday ? 'Hôm nay' : date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                                    </span>
                                    <span className="text-xl font-black">{date.getDate()}</span>
                                    <span className="text-[10px]">{date.toLocaleDateString('vi-VN', { month: 'short' })}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Showtimes */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Chọn suất chiếu
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                                    <div className="h-5 bg-white/10 rounded w-48 mb-3"></div>
                                    <div className="flex gap-2">
                                        {[...Array(4)].map((_, j) => (
                                            <div key={j} className="h-12 w-20 bg-white/10 rounded-lg"></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : cinemas.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
                            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">Không có suất chiếu nào vào ngày này</p>
                            <p className="text-slate-500 text-sm mt-1">Vui lòng chọn ngày khác</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cinemas.map((cinema) => {
                                const typeColor = THEATER_TYPE_COLORS[cinema.theaterType] || THEATER_TYPE_COLORS.STANDARD;
                                return (
                                    <div key={cinema.theaterId} className="bg-white/5 border border-white/10 rounded-xl p-5">
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
                                            {cinema.showtimes.map((showtime) => (
                                                <Link
                                                    key={showtime.showtimeId}
                                                    to={`/booking/${showtime.showtimeId}`}
                                                    className="flex flex-col items-center px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:border-primary hover:bg-primary/10 text-white transition-all group"
                                                >
                                                    <span className="font-bold text-sm group-hover:text-primary">{showtime.time}</span>
                                                    {showtime.price && (
                                                        <span className="text-[10px] text-slate-400 mt-0.5">
                                                            {Number(showtime.price).toLocaleString('vi-VN')}đ
                                                        </span>
                                                    )}
                                                    {showtime.availableSeats !== null && (
                                                        <span className="text-[10px] text-slate-500">
                                                            {showtime.availableSeats} ghế
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
            </div>
        </div>
    );
};

export default ShowtimePage;
