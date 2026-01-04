import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = response.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return response.data;
    };

    const register = async (name, email, password, password_confirmation) => {
        const response = await api.post('/auth/register', {
            name,
            email,
            password,
            password_confirmation,
        });
        const { token: newToken, user: userData } = response.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return response.data;
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
