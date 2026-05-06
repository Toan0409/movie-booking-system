import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userData');
            }
        }
        setLoading(false);
    }, []);

    /**
     * Login: gọi POST /api/auth/login, nhận JWT token
     */
    const login = async (usernameOrEmail, password) => {
        if (!usernameOrEmail || !password) throw new Error('Vui lòng nhập email và mật khẩu');

        const res = await authApi.login({ usernameOrEmail, password });
        const authData = res.data?.data || res.data;

        // authData: { accessToken, tokenType, userId, username, email, fullName, role }
        const { accessToken, userId, username, email, fullName, role } = authData;

        const userData = { userId, username, email, fullName, role };

        // Lưu token và thông tin user vào localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('userId', String(userId));
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    /**
     * Register: gọi POST /api/auth/register
     */
    const register = async ({ username, email, password }) => {
        const res = await authApi.register({ username, email, password });
        const newUser = res.data?.data || res.data;
        // Sau khi đăng ký thành công, không tự động đăng nhập
        // Người dùng sẽ được chuyển hướng đến trang đăng nhập
        return newUser;
    };

    /**
     * Logout: clear localStorage and state
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        setUser(null);
    };

    /**
     * Update user data in context (after profile edit)
     */
    const updateUserData = (updatedUser) => {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
