// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Importe o hook de autenticação

// Importe suas páginas
import Login from './pages/login/Login';
import Cadastro from './pages/login/Cadastro';
import Home from './pages/Home';
import Solicitacoes from './pages/solicitacoes/Solicitacoes';
import SolicitacaoForm from './pages/solicitacoes/SolicitacaoForm';
import VerSolicitacao from './pages/solicitacoes/VerSolicitacao';

// PrivateRoute: Requer apenas que o usuário esteja autenticado
function PrivateRoute({ children }) {
    const { user, loading } = useAuth(); // Use o hook para acessar o estado
    
    if (loading) {
        // Opcional: um spinner de carregamento enquanto o token é verificado
        return <div>Carregando...</div>; 
    }

    return user ? children : <Navigate to="/login" />;
}

// AdminRoute: Requer que o usuário esteja autenticado E seja um 'administrador'
function AdminRoute({ children }) {
    const { user, loading, hasRole } = useAuth(); // Use o hook para acessar o estado e a função hasRole

    if (loading) {
        return <div>Carregando...</div>;
    }

    // Se não estiver logado, redireciona para o login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Se não tiver o papel de administrador, redireciona para a home ou outra página de erro
    if (!hasRole('administrador')) {
        return <Navigate to="/home" />; // Ou uma página de erro 403 / acesso negado
    }

    return children;
}


export default function App() {
    // Não precisamos mais de localStorage.getItem('token') diretamente aqui,
    // o AuthProvider já cuida da verificação inicial.
    const { user, loading } = useAuth(); // Para o redirecionamento inicial

    if (loading) {
        return <div>Carregando aplicação...</div>; // Renderiza algo enquanto o AuthProvider carrega
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Rota inicial: se logado, vai pra home; senão, vai pra login */}
                <Route
                    path="/"
                    element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                
                {/* Rotas protegidas (precisam de qualquer usuário logado) */}
                <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/solicitacoes" element={<PrivateRoute><Solicitacoes /></PrivateRoute>} />
                <Route path="/solicitacoes/:id" element={<PrivateRoute><VerSolicitacao /></PrivateRoute>} />

                {/* Rotas protegidas (precisam de ADMIN) */}
                <Route path="/solicitacoes/novo" element={<AdminRoute><SolicitacaoForm /></AdminRoute>} />
                <Route path="/solicitacoes/:id/editar" element={<AdminRoute><SolicitacaoForm /></AdminRoute>} />
                {/* ATENÇÃO: As rotas acima são apenas um exemplo.
                   Você precisa definir quais rotas são apenas para Admin e quais são para qualquer usuário logado.
                   Se "novo" e "editar" puderem ser acessados por requerentes, mude para PrivateRoute.
                   A lógica fina de quem pode editar QUAL solicitação é no backend.
                */}
                
                <Route path="*" element={<h1>404 - Página Não Encontrada</h1>} />
            </Routes>
        </BrowserRouter>
    );
}