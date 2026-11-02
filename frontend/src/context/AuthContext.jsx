// 1. Imports
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

// 2. Context Declaration
const AuthContext = createContext(null);

// 3. Authentication Provider
export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loading, setLoading] = useState(false);

    // Register User
    const register = async (userData) => {
        setLoading(true);

        try {
            const response = await api.post('/auth/register', userData);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            setUser(response.data.user);

            return response.data;

        } finally {
            setLoading(false);
        }
    };

    // Login User
    const login = async (credentials) => {
        setLoading(true);

        try {
            const response = await api.post('/auth/login', credentials);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            setUser(response.data.user);

            return response.data;

        } finally {
            setLoading(false);
        }
    };

    // Logout User
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // 4. Context Value
    const value = {
        user,
        loading,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 5. Custom Hook
export const useAuth = () => {
    return useContext(AuthContext);
};