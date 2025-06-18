import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Cadastro from './pages/login/Cadastro';
import Home from './pages/Home';
import Solicitacoes from './pages/solicitacoes/Solicitacoes';
import SolicitacaoForm from './pages/solicitacoes/SolicitacaoForm';
import VerSolicitacao from './pages/solicitacoes/VerSolicitacao';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={localStorage.getItem('token') ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitacoes"
          element={
            <PrivateRoute>
              <Solicitacoes />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitacoes/novo"
          element={
            <PrivateRoute>
              <SolicitacaoForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitacoes/:id/editar"
          element={
            <PrivateRoute>
              <SolicitacaoForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitacoes/:id"
          element={
            <PrivateRoute>
              <VerSolicitacao />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<h1>404 - Página Não Encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
