import axiosClient from './axiosClient';

const actorApi = {
    getAllActors: (keyword = '', page = 0, size = 10) =>
        axiosClient.get('/admin/actors', { params: { keyword, page, size } }),

    getActorById: (id) =>
        axiosClient.get(`/admin/actors/${id}`),

    createActor: (data) =>
        axiosClient.post('/admin/actors', data),

    updateActor: (id, data) =>
        axiosClient.put(`/admin/actors/${id}`, data),

    deleteActor: (id) =>
        axiosClient.delete(`/admin/actors/${id}`),
};

export default actorApi;
