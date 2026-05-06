import axiosClient from './axiosClient';

const authApi = {
    /**
     * Đăng nhập
     * POST /api/auth/login
     * Body: { usernameOrEmail, password }
     */
    login: (data) =>
        axiosClient.post('/auth/login', data),

    /**
     * Đăng ký tài khoản mới
     * POST /api/auth/register
     * Body: { username, email, password }
     */
    register: (data) =>
        axiosClient.post('/auth/register', data),
};

export default authApi;
