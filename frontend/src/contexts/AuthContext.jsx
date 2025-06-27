// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserFromToken = () => {
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp < currentTime) {
                        logout();
                    } else {
                        setUser(decodedToken);
                    }
                } catch (error) {
                    logout();
                }
            }
            setLoading(false);
        };

        loadUserFromToken();
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const hasRole = (roleToCheck) => {
        return user && user.roles && user.roles.includes(roleToCheck);
    };

    const auth = { user, token, loading, login, logout, hasRole };

    if (loading) { return <div>Carregando autenticação...</div>; }

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);