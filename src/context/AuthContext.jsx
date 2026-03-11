import { createContext, useContext, useState } from 'react';
import api from '../utils/api';
import { changePassword as changePasswordApi } from '../utils/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (employeeId, password) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/auth/login', { employeeId, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true, role: data.user.role };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const changePassword = async (currentPassword, newPassword) => {
        setLoading(true);
        setError(null);
        try {
            const result = await changePasswordApi(currentPassword, newPassword);
            return { success: true, message: result.message };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, changePassword, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);