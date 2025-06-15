import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Transferencias from './pages/Transferencias';
import TransferenciaForm from './pages/TransferenciaForm';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" element={<Login />} />
        <Route
          path="/cadastro"
          element={
              <Cadastro />
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/transferencias"
          element={
            <PrivateRoute>
              <Transferencias />
            </PrivateRoute>
          }
        />
        <Route
          path="/transferencias/novo"
          element={
            <PrivateRoute>
              <TransferenciaForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/transferencias/:id/editar"
          element={
            <PrivateRoute>
              <TransferenciaForm />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
