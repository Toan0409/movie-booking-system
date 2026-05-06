import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Ticket, Play, ChevronLeft, ChevronRight, MapPin, ArrowRight, Calendar, Building2 } from 'lucide-react';
import { useNowShowing, useComingSoon, useFeaturedMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import cinemaApi from '../api/cinemaApi';

const HomePage = () => {
  const { movies: nowShowingMovies, loading: nowShowingLoading, error: nowShowingError } = useNowShowing();
  const { movies: comingSoonMovies, loading: comingSoonLoading } = useComingSoon();

  const [cinemas, setCinemas] = useState([]);
  const [cinemasLoading, setCinemasLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  // Fetch cinemas
  useEffect(() => {
    cinemaApi.getActiveCinemas()
      .then(res => {
        const data = res.data?.data || res.data || [];
        setCinemas(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch(() => setCinemas([]))
      .finally(() => setCinemasLoading(false));
  }, []);

  // Auto-rotate hero
  useEffect(() => {
    if (!nowShowingMovies || nowShowingMovies.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex(i => (i + 1) % nowShowingMovies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [nowShowingMovies]);

  const featuredMovie = nowShowingMovies?.[heroIndex] || null;
  const heroTitle = featuredMovie?.title || 'CinemaBooking';
  const heroDescription = featuredMovie?.description || 'Trải nghiệm điện ảnh đỉnh cao với hệ thống đặt vé trực tuyến tiện lợi nhất.';
  const heroImage = featuredMovie?.backdropUrl || featuredMovie?.backgroundUrl || featuredMovie?.posterUrl || '';

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative w-full aspect-[21/9] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220] via-transparent to-transparent z-10"></div>
          {heroImage ? (
            <img
              key={heroIndex}
              className="w-full h-full object-cover transition-opacity duration-700"
              src={heroImage}
              alt={heroTitle}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900"></div>
          )}
        </div>

        <div className="relative z-20 px-6 md:px-20 pb-16 max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            {featuredMovie?.status === 'COMING_SOON' ? (
              <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Sắp chiếu</span>
            ) : (
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Đang chiếu</span>
            )}
            {featuredMovie?.genre?.name && (
              <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-sm">
                {featuredMovie.genre.name}
              </span>
            )}
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight uppercase italic tracking-tighter line-clamp-2">
            {heroTitle}
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl line-clamp-3">
            {heroDescription}
          </p>

          <div className="flex flex-wrap gap-4">
            {featuredMovie && featuredMovie.status !== 'COMING_SOON' ? (
              <Link
                to={`/showtimes/${featuredMovie.movieId}`}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-primary/30 active:scale-95"
              >
                <Ticket className="w-5 h-5" />
                Đặt vé ngay
              </Link>
            ) : (
              <Link
                to="/movies/now-showing"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-xl shadow-primary/30 active:scale-95"
              >
                <Ticket className="w-5 h-5" />
                Xem phim đang chiếu
              </Link>
            )}
            {featuredMovie?.trailerUrl && (
              <a
                href={featuredMovie.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-bold py-4 px-8 rounded-xl transition-all border border-white/10"
              >
                <Play className="w-5 h-5" />
                Xem trailer
              </a>
            )}
            {!featuredMovie?.trailerUrl && (
              <Link
                to={featuredMovie ? `/movies/${featuredMovie.movieId}` : '/movies'}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-bold py-4 px-8 rounded-xl transition-all border border-white/10"
              >
                <Play className="w-5 h-5" />
                Chi tiết phim
              </Link>
            )}
          </div>
        </div>

        {/* Hero navigation dots */}
        {nowShowingMovies && nowShowingMovies.length > 1 && (
          <div className="absolute bottom-6 right-20 z-20 flex items-center gap-3">
            <button
              onClick={() => setHeroIndex(i => (i - 1 + nowShowingMovies.length) % nowShowingMovies.length)}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {nowShowingMovies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === heroIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/30'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setHeroIndex(i => (i + 1) % nowShowingMovies.length)}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* ── Now Showing Section ── */}
      <section className="px-6 md:px-20 py-16 max-w-[1440px] mx-auto">
        {nowShowingLoading ? (
          <div>
            <div className="flex items-end justify-between mb-8">
              <div className="h-9 w-48 bg-slate-800 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] rounded-xl bg-slate-800 mb-4"></div>
                  <div className="h-5 bg-slate-800 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : nowShowingError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400">{nowShowingError}</p>
          </div>
        ) : nowShowingMovies && nowShowingMovies.length > 0 ? (
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h3 className="text-3xl font-black uppercase italic text-white">Đang chiếu</h3>
                <p className="text-slate-400">Xem những bộ phim hot nhất trong rạp</p>
              </div>
              <Link to="/movies/now-showing" className="text-primary font-bold hover:underline flex items-center gap-1 text-sm">
                Xem tất cả <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {nowShowingMovies.slice(0, 5).map((movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h3 className="text-3xl font-black uppercase italic text-white">Đang chiếu</h3>
                <p className="text-slate-400">Xem những bộ phim hot nhất trong rạp</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
              <p className="text-slate-400">Không có phim đang chiếu</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Coming Soon Section ── */}
      <section className="bg-primary/5 py-16 border-y border-white/5">
        <div className="px-6 md:px-20 max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              Sắp chiếu
            </h3>
            <Link to="/movies/coming-soon" className="text-primary font-bold hover:underline flex items-center gap-1 text-sm">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {comingSoonLoading ? (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[300px] bg-slate-800/50 p-4 rounded-xl animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 aspect-[2/3] bg-slate-700 rounded-lg shrink-0"></div>
                    <div className="flex flex-col justify-center gap-2 flex-1">
                      <div className="h-3 w-16 bg-slate-700 rounded"></div>
                      <div className="h-5 w-32 bg-slate-700 rounded"></div>
                      <div className="h-4 w-20 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comingSoonMovies && comingSoonMovies.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {comingSoonMovies.map((movie) => (
                <Link
                  key={movie.movieId}
                  to={`/movies/${movie.movieId}`}
                  className="min-w-[300px] flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer shrink-0"
                >
                  <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={movie.posterUrl || movie.poster}
                      alt={movie.title}
                      onError={(e) => { e.target.src = 'https://placehold.co/96x144/1e293b/64748b?text=No+Poster'; }}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">
                      {movie.releaseDate
                        ? new Date(movie.releaseDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : 'Sắp ra mắt'}
                    </p>
                    <h4 className="text-white font-bold text-base leading-tight mb-2 line-clamp-2">
                      {movie.title}
                    </h4>
                    <div className="flex gap-2 items-center text-xs text-slate-400 flex-wrap">
                      <span className="bg-white/10 px-1.5 py-0.5 rounded">{movie.ageRating || 'P'}</span>
                      <span>{movie.genre?.name || movie.genres?.[0]?.name || 'Phim'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
              <p className="text-slate-400">Không có phim sắp chiếu</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Cinema Locations Section ── */}
      <section className="px-6 md:px-20 py-20 max-w-[1440px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-3xl font-black uppercase italic text-white mb-3">Hệ thống rạp chiếu</h3>
            <p className="text-slate-400 mb-8 text-base">
              Tìm rạp chiếu gần bạn với công nghệ âm thanh và hình ảnh hiện đại nhất.
            </p>

            <div className="space-y-3">
              {cinemasLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-white/10 rounded w-40 mb-2"></div>
                        <div className="h-3 bg-white/10 rounded w-56"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : cinemas.length > 0 ? (
                cinemas.map((cinema) => (
                  <div
                    key={cinema.cinemaId}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{cinema.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {cinema.address || cinema.city || 'Việt Nam'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                  </div>
                ))
              ) : (
                /* Fallback static cinemas */
                [
                  { name: 'CinemaBooking City Center', address: '123 Nguyễn Huệ, Q.1, TP.HCM' },
                  { name: 'CinemaBooking Landmark 81', address: '720A Điện Biên Phủ, Bình Thạnh, TP.HCM' },
                  { name: 'CinemaBooking Hà Nội', address: '6 Phạm Ngọc Thạch, Đống Đa, Hà Nội' },
                ].map((c, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{c.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{c.address}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stats / Features */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Rạp chiếu', value: cinemas.length > 0 ? `${cinemas.length}+` : '10+', desc: 'Trên toàn quốc', icon: Building2, color: 'text-primary bg-primary/10' },
              { label: 'Phim đang chiếu', value: nowShowingMovies?.length > 0 ? `${nowShowingMovies.length}+` : '20+', desc: 'Cập nhật liên tục', icon: Play, color: 'text-accent bg-accent/10' },
              { label: 'Công nghệ', value: 'IMAX', desc: 'Dolby Atmos & 4DX', icon: Star, color: 'text-amber-400 bg-amber-400/10' },
              { label: 'Đặt vé', value: '24/7', desc: 'Trực tuyến tiện lợi', icon: Ticket, color: 'text-pink-400 bg-pink-400/10' },
            ].map(({ label, value, desc, icon: Icon, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{value}</p>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
