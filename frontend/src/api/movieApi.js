import axiosClient from './axiosClient';

/**
 * Movie API Service
 * Handles all movie-related API calls to the backend
 */

const movieApi = {
    /**
     * Get all movies with pagination
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Number of items per page
     * @returns {Promise} - API response
     */
    getAllMovies: (page = 0, size = 12) => {
        const params = {
            page,
            size,
        };
        return axiosClient.get('/admin/movies', { params });
    },

    /**
     * Get movie by ID
     * @param {number|string} id - Movie ID
     * @returns {Promise} - API response
     */
    getMovieById: (id) => {
        return axiosClient.get(`/movies/${id}`);
    },

    /**
     * Get now showing movies with pagination
     * @param {number} page
     * @param {number} size
     */
    getNowShowing: (page = 0, size = 12) => {
        return axiosClient.get('/movies/now-showing', { params: { page, size } });
    },

    /**
     * Get coming soon movies with pagination
     * @param {number} page
     * @param {number} size
     */
    getComingSoon: (page = 0, size = 12) => {
        return axiosClient.get('/movies/coming-soon', { params: { page, size } });
    },

    /**
     * Get featured movies (falls back gracefully if endpoint missing)
     */
    getFeaturedMovies: () => {
        return axiosClient.get('/movies/featured').catch(() =>
            axiosClient.get('/movies/now-showing', { params: { page: 0, size: 5 } })
        );
    },

    /**
     * Search movies by keyword
     * @param {string} keyword - Search keyword
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Number of items per page
     * @returns {Promise} - API response
     */
    searchMovies: (keyword, page = 0, size = 12) => {
        const params = {
            keyword,
            page,
            size,
        };
        return axiosClient.get('/movies/search', { params });
    },

    /**
     * Get movies by genre
     * @param {number|string} genreId - Genre ID
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Number of items per page
     * @returns {Promise} - API response
     */
    getMoviesByGenre: (genreId, page = 0, size = 12) => {
        const params = {
            page,
            size,
        };
        return axiosClient.get(`/movies/genre/${genreId}`, { params });
    },

    // ===== Admin endpoints =====
    createMovie: (data) =>
        axiosClient.post('/admin/movies', data),

    updateMovie: (id, data) =>
        axiosClient.put(`/admin/movies/${id}`, data),

    deleteMovie: (id) =>
        axiosClient.delete(`/admin/movies/${id}`),

    restoreMovie: (id) =>
        axiosClient.patch(`/admin/movies/${id}/restore`),

    getAllMoviesAdmin: (page = 0, size = 10) =>
        axiosClient.get('/admin/movies', { params: { page, size } }),
};

export default movieApi;

