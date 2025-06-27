// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Importe suas páginas
import Login from './pages/login/Login';
import Cadastro from './pages/login/Cadastro';
import Home from './pages/Home'; // A Home agora terá a lista de solicitações
// import Solicitacoes from './pages/solicitacoes/Solicitacoes'; // REMOVIDO
import SolicitacaoForm from './pages/solicitacoes/SolicitacaoForm';
import VerSolicitacao from './pages/solicitacoes/VerSolicitacao';

// PrivateRoute e AdminRoute permanecem inalterados
function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) { return <div>Carregando...</div>; }
    return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
    const { user, loading, hasRole } = useAuth();
    if (loading) { return <div>Carregando...</div>; }
    if (!user) { return <Navigate to="/login" />; }
    if (!hasRole('administrador')) { return <Navigate to="/home" />; }
    return children;
}

export default function App() {
    const { user, loading } = useAuth();

    if (loading) { return <div>Carregando aplicação...</div>; }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                
                {/* Home agora é a rota da lista de solicitações */}
                <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                
                {/* A rota /solicitacoes (lista) foi movida para /home.
                    Manter as rotas de detalhes e formulário de solicitação. */}
                <Route path="/solicitacoes/:id" element={<PrivateRoute><VerSolicitacao /></PrivateRoute>} />

                {/* Rotas de formulário de solicitação, conforme suas novas regras de permissão:
                    - Criar: qualquer funcionário ou administrador
                    - Editar: administrador ou o requerente da solicitação (lógica no controller/form)
                    Então, ambas podem ser PrivateRoute.
                */}
                <Route path="/solicitacoes/novo" element={<PrivateRoute><SolicitacaoForm /></PrivateRoute>} />
                <Route path="/solicitacoes/:id/editar" element={<PrivateRoute><SolicitacaoForm /></PrivateRoute>} />
                
                <Route path="*" element={<h1>404 - Página Não Encontrada</h1>} />
            </Routes>
        </BrowserRouter>
    );
}