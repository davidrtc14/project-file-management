// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // Instalar: npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Armazena { id, usuario, nome, roles }
    const [token, setToken] = useState(localStorage.getItem('token')); // Pega o token do localStorage
    const [loading, setLoading] = useState(true); // Para indicar se a autenticação inicial está carregando

    useEffect(() => {
        const loadUserFromToken = () => {
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    // Verifique se o token expirou (opcional, mas recomendado)
                    const currentTime = Date.now() / 1000; // Tempo atual em segundos
                    if (decodedToken.exp < currentTime) {
                        console.log('Token expirado. Removendo...');
                        logout(); // Se expirou, faz logout
                    } else {
                        setUser(decodedToken); // decodedToken já contém id, usuario, roles
                    }
                } catch (error) {
                    console.error("Erro ao decodificar token:", error);
                    logout(); // Se o token for inválido, faz logout
                }
            }
            setLoading(false); // Terminou de carregar o usuário
        };

        loadUserFromToken();
    }, [token]);

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData); // { id, usuario, nome, roles }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // Função para verificar papéis (útil para proteger rotas e componentes)
    const hasRole = (roleToCheck) => {
        return user && user.roles && user.roles.includes(roleToCheck);
    };

    const auth = {
        user,
        token,
        loading,
        login,
        logout,
        hasRole
    };

    if (loading) {
        // Opcional: Renderize um spinner de carregamento ou algo similar
        return <div>Carregando autenticação...</div>; 
    }

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para facilitar o uso do contexto
export const useAuth = () => useContext(AuthContext);