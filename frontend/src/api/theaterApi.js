import axiosClient from './axiosClient';

const theaterApi = {
    // Client endpoints
    getActiveTheaters: (page = 0, size = 10) =>
        axiosClient.get('/theaters', { params: { page, size } }),

    // Admin endpoints
    getAllTheaters: (page = 0, size = 10) =>
        axiosClient.get('/admin/theaters', { params: { page, size } }),

    getTheaterById: (id) =>
        axiosClient.get(`/admin/theaters/${id}`),

    createTheater: (data) =>
        axiosClient.post('/admin/theaters', data),

    updateTheater: (id, data) =>
        axiosClient.put(`/admin/theaters/${id}`, data),

    deleteTheater: (id) =>
        axiosClient.delete(`/admin/theaters/${id}`),

    restoreTheater: (id) =>
        axiosClient.patch(`/admin/theaters/${id}/restore`),
};

export default theaterApi;
