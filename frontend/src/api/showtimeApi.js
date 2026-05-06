import axiosClient from './axiosClient';

const showtimeApi = {
    // Client endpoints
    getTodayShowtimes: () =>
        axiosClient.get('/client/showtimes'),

    getShowtimeById: (id) =>
        axiosClient.get(`/client/showtimes/${id}`),

    getShowtimesByMovie: (movieId) =>
        axiosClient.get(`/client/showtimes/movie/${movieId}`),

    getShowtimesByTheater: (theaterId) =>
        axiosClient.get(`/client/showtimes/theater/${theaterId}`),

    getShowtimesByDate: (date) =>
        axiosClient.get('/client/showtimes/date', { params: { date } }),

    getShowtimesByMovieAndDate: (movieId, date) =>
        axiosClient.get(`/client/showtimes/movie/${movieId}/date`, { params: { date } }),

    // Admin endpoints
    getAllShowtimes: (page = 0, size = 10) =>
        axiosClient.get('/admin/showtimes', { params: { page, size } }),

    getAdminShowtimeById: (id) =>
        axiosClient.get(`/admin/showtimes/${id}`),

    getActiveShowtimes: (page = 0, size = 10) =>
        axiosClient.get('/admin/showtimes/active', { params: { page, size } }),

    getShowtimesByMovieAdmin: (movieId) =>
        axiosClient.get(`/admin/showtimes/movie/${movieId}`),

    getShowtimesByTheaterAdmin: (theaterId) =>
        axiosClient.get(`/admin/showtimes/theater/${theaterId}`),

    getShowtimesByDateAdmin: (date) =>
        axiosClient.get('/admin/showtimes/date', { params: { date } }),

    createShowtime: (data) =>
        axiosClient.post('/admin/showtimes', data),

    updateShowtime: (id, data) =>
        axiosClient.put(`/admin/showtimes/${id}`, data),

    deactivateShowtime: (id) =>
        axiosClient.delete(`/admin/showtimes/${id}`),

    activateShowtime: (id) =>
        axiosClient.patch(`/admin/showtimes/${id}/activate`),
};

export default showtimeApi;
