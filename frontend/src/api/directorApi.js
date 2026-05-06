import axiosClient from './axiosClient';

const directorApi = {
    getAllDirectors: (keyword = '', page = 0, size = 10) =>
        axiosClient.get('/admin/directors', { params: { keyword, page, size } }),

    getDirectorById: (id) =>
        axiosClient.get(`/admin/directors/${id}`),

    createDirector: (data) =>
        axiosClient.post('/admin/directors', data),

    updateDirector: (id, data) =>
        axiosClient.put(`/admin/directors/${id}`, data),

    deleteDirector: (id) =>
        axiosClient.delete(`/admin/directors/${id}`),
};

export default directorApi;
