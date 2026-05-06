import axiosClient from './axiosClient';

const userApi = {
    createUser: (data) =>
        axiosClient.post('/admin/users', data),

    getAllUsers: (page = 0, size = 10) =>
        axiosClient.get('/admin/users', { params: { page, size } }),

    getUserById: (id) =>
        axiosClient.get(`/admin/users/${id}`),

    updateUser: (id, data) =>
        axiosClient.put(`/admin/users/${id}`, data),

    deleteUser: (id) =>
        axiosClient.delete(`/admin/users/${id}`),

    activateUser: (id) =>
        axiosClient.patch(`/admin/users/${id}/activate`),

    deactivateUser: (id) =>
        axiosClient.patch(`/admin/users/${id}/deactivate`),
};

export default userApi;
