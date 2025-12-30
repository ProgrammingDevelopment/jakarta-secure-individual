
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // ideally verify token with backend, for now decode or assume valid
            setUser({ username: localStorage.getItem('username') });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axios.post('http://localhost:3001/api/auth/login', { username, password });
            setToken(res.data.token);
            setUser({ username: res.data.username });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const register = async (username, password, role) => {
        try {
            await axios.post('http://localhost:3001/api/auth/register', { username, password, role });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
