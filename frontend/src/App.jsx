import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Login from './pages/Login/Login';
import Cadastro from './pages/Login/Cadastro';
import Home from './pages/Home/Home';
import SolicitacaoForm from './pages/SolicitacaoForm/SolicitacaoForm';
import VerSolicitacao from './pages/VerSolicitacao/VerSolicitacao';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div>Carregando...</div>;
    return user ? children : <Navigate to="/login" />;
}

export default function App() {
    const { user, loading } = useAuth();
    const location = useLocation();
    const hideHeaderFooter = ['/login', '/cadastro'].includes(location.pathname);

    if (loading) return <div>Carregando aplicação...</div>;

    return (
        <>
            {!hideHeaderFooter && <Header />}

            <div className='container'>
                <Routes>
                    <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/solicitacoes/novo" element={<PrivateRoute><SolicitacaoForm /></PrivateRoute>} />
                    <Route path="/solicitacoes/:id" element={<PrivateRoute><VerSolicitacao /></PrivateRoute>} />
                    <Route path="/solicitacoes/:id/editar" element={<PrivateRoute><SolicitacaoForm /></PrivateRoute>} />
                    <Route path="*" element={<h1>404 - Página Não Encontrada</h1>} />
                </Routes>
            </div>

            {!hideHeaderFooter && <Footer />}
        </>
    );
}
