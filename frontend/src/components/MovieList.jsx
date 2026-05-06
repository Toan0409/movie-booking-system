import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MovieCard from './MovieCard';

const MovieList = ({
    movies = [],
    title,
    subtitle,
    viewAllLink,
    loading,
    error,
    emptyMessage = 'Không có phim nào',
    showViewAll = true,
    className = ''
}) => {
    // Loading skeleton
    if (loading) {
        return (
            <div className={className}>
                {title && (
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-black uppercase italic text-white">{title}</h3>
                            {subtitle && <p className="text-slate-400">{subtitle}</p>}
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="aspect-[2/3] rounded-xl bg-slate-800 mb-4"></div>
                            <div className="h-5 bg-slate-800 rounded mb-2 w-3/4"></div>
                            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={className}>
                {title && (
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-black uppercase italic text-white">{title}</h3>
                            {subtitle && <p className="text-slate-400">{subtitle}</p>}
                        </div>
                    </div>
                )}
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (!movies || movies.length === 0) {
        return (
            <div className={className}>
                {title && (
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-black uppercase italic text-white">{title}</h3>
                            {subtitle && <p className="text-slate-400">{subtitle}</p>}
                        </div>
                    </div>
                )}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                    <p className="text-slate-400">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Section header */}
            {(title || subtitle) && (
                <div className="flex items-end justify-between mb-8">
                    <div>
                        {title && (
                            <h3 className="text-3xl font-black uppercase italic text-white">{title}</h3>
                        )}
                        {subtitle && <p className="text-slate-400">{subtitle}</p>}
                    </div>
                    {showViewAll && viewAllLink && (
                        <Link
                            to={viewAllLink}
                            className="text-primary font-bold hover:underline flex items-center gap-1"
                        >
                            Xem tất cả <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            )}

            {/* Movie grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
};

export default MovieList;

