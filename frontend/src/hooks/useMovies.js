import { useState, useEffect, useCallback } from 'react';
import movieApi from '../api/movieApi';

/**
 * Custom hook for fetching now showing movies
 * @returns {Object} - movies, loading, error, refetch
 */
export const useNowShowing = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNowShowing = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await movieApi.getNowShowing();
            console.log("Now Showing API:", response.data);
            // Handle the API response structure
            if (response.data && response.data.success) {
                setMovies(response.data.data.content || []);
            } else {
                // Fallback if data structure is different
                setMovies(response.data.data || response.data || []);
            }
        } catch (err) {
            console.error('Error fetching now showing movies:', err);
            setError(err.message || 'Failed to fetch now showing movies');
            setMovies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNowShowing();
    }, [fetchNowShowing]);

    return { movies, loading, error, refetch: fetchNowShowing };
};

/**
 * Custom hook for fetching coming soon movies
 * @returns {Object} - movies, loading, error, refetch
 */
export const useComingSoon = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchComingSoon = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await movieApi.getComingSoon();

            if (response.data && response.data.success) {
                setMovies(response.data.data.content || []);
            } else {
                setMovies(response.data.data || response.data || []);
            }
        } catch (err) {
            console.error('Error fetching coming soon movies:', err);
            setError(err.message || 'Failed to fetch coming soon movies');
            setMovies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComingSoon();
    }, [fetchComingSoon]);

    return { movies, loading, error, refetch: fetchComingSoon };
};

/**
 * Custom hook for fetching featured movies
 * @returns {Object} - movies, loading, error, refetch
 */
export const useFeaturedMovies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFeatured = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await movieApi.getFeaturedMovies();

            if (response.data && response.data.success) {
                setMovies(response.data.data.content || []);
            } else {
                setMovies(response.data.data || response.data || []);
            }
        } catch (err) {
            console.error('Error fetching featured movies:', err);
            setError(err.message || 'Failed to fetch featured movies');
            setMovies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeatured();
    }, [fetchFeatured]);

    return { movies, loading, error, refetch: fetchFeatured };
};

/**
 * Custom hook for fetching a single movie by ID
 * @param {number|string} id - Movie ID
 * @returns {Object} - movie, loading, error, refetch
 */
export const useMovieById = (id) => {
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMovie = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const response = await movieApi.getMovieById(id);

            if (response.data && response.data.success) {
                setMovie(response.data.data);
            } else {
                setMovie(response.data);
            }
        } catch (err) {
            console.error('Error fetching movie:', err);
            setError(err.message || 'Failed to fetch movie details');
            setMovie(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchMovie();
    }, [fetchMovie]);

    return { movie, loading, error, refetch: fetchMovie };
};

/**
 * Custom hook for searching movies
 * @param {string} keyword - Search keyword
 * @returns {Object} - movies, loading, error, search
 */
export const useSearchMovies = (keyword) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const search = useCallback(async (searchKeyword) => {
        if (!searchKeyword || searchKeyword.trim() === '') {
            setMovies([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await movieApi.searchMovies(searchKeyword);

            if (response.data && response.data.success) {
                setMovies(response.data.data.content || []);
            } else {
                setMovies(response.data.data || response.data || []);
            }
        } catch (err) {
            console.error('Error searching movies:', err);
            setError(err.message || 'Failed to search movies');
            setMovies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (keyword) {
            search(keyword);
        }
    }, [keyword, search]);

    return { movies, loading, error, search };
};

export default {
    useNowShowing,
    useComingSoon,
    useFeaturedMovies,
    useMovieById,
    useSearchMovies,
};

