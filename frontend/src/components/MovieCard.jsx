import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const MovieCard = ({ movie }) => {
    // Handle different response structures
    const movieData = movie;

    // Extract movie properties with fallbacks
    const id = movieData?.movieId;
    const title = movieData?.title || movieData?.name || 'Unknown Title';
    const poster = movieData?.poster || movieData?.posterUrl || movieData?.imageUrl || '';
    const rating = movieData?.rating || movieData?.averageRating || 0;
    const duration = movieData?.duration || movieData?.runtime || 0;
    const genre =
        movieData?.genre?.name ||
        movieData?.genres?.[0]?.name ||
        '';
    const releaseDate = movieData?.releaseDate || movieData?.release_date || '';

    // Format duration
    const formatDuration = (minutes) => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
        }
        return `${mins}p`;
    };

    // Format release date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Get rating display
    const getRating = () => {
        if (typeof rating === 'number') {
            return rating.toFixed(1);
        }
        return rating || '0.0';
    };

    // Handle missing poster
    const handleImageError = (e) => {
        e.target.src = 'https://placehold.jp/150x150.png';
    };

    if (!id) {
        return null;
    }

    return (
        <Link to={`/movies/${id}`} className="group block">
            <div className="cursor-pointer">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-lg group-hover:ring-2 ring-primary transition-all">
                    {poster ? (
                        <img
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            src={poster}
                            alt={title}
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <span className="text-slate-500 text-sm">No Poster</span>
                        </div>
                    )}

                    {/* Rating */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <span className="text-white text-xs font-bold">{getRating()}</span>
                    </div>
                </div>

                <h4 className="text-white font-bold mb-1 group-hover:text-primary transition-colors truncate">
                    {title}
                </h4>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    {duration > 0 && (
                        <>
                            <span>{formatDuration(duration)}</span>
                            <span>•</span>
                        </>
                    )}
                    {genre && <span className="truncate">{genre}</span>}
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;

