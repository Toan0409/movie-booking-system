import axiosClient from './axiosClient';

const genreApi = {
    getAllGenres: (keyword = '', page = 0, size = 10) =>
        axiosClient.get('/admin/genres', { params: { keyword, page, size } }),

    getAllGenresClient: (keyword = '', page = 0, size = 10) =>
        axiosClient.get('/genres', { params: { keyword, page, size } }),

    getGenreById: (id) =>
        axiosClient.get(`/genres/${id}`),

    createGenre: (data) =>
        axiosClient.post('/admin/genres', data),

    updateGenre: (id, data) =>
        axiosClient.put(`/admin/genres/${id}`, data),

    deleteGenre: (id) =>
        axiosClient.delete(`/admin/genres/${id}`),

    restoreGenre: (id) =>
        axiosClient.patch(`/admin/genres/${id}/restore`),
};

export default genreApi;
