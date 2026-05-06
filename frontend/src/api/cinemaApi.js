import axiosClient from './axiosClient';

const cinemaApi = {
    // Client endpoints
    getActiveCinemas: () =>
        axiosClient.get('/cinemas'),

    // Admin endpoints
    getAllCinemas: () =>
        axiosClient.get('/admin/cinemas'),

    getCinemaById: (id) =>
        axiosClient.get(`/admin/cinemas/${id}`),

    createCinema: (data) =>
        axiosClient.post('/admin/cinemas', data),

    updateCinema: (id, data) =>
        axiosClient.put(`/admin/cinemas/${id}`, data),

    deleteCinema: (id) =>
        axiosClient.delete(`/admin/cinemas/${id}`),

    restoreCinema: (id) =>
        axiosClient.patch(`/admin/cinemas/${id}/restore`),

    searchCinemas: (keyword) =>
        axiosClient.get('/admin/cinemas/search', { params: { keyword } }),

    getCinemasByCity: (city) =>
        axiosClient.get('/admin/cinemas/city', { params: { city } }),
};

export default cinemaApi;
