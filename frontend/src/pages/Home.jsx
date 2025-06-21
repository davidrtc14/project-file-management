// src/pages/Home.jsx (assumindo que Home.jsx está em src/pages/Home.jsx)

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importe o useAuth hook

export default function Home() {
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // Use o hook para acessar a função de logout e os dados do usuário

  const handleLogout = () => {
    logout(); // Chama a função de logout do contexto
    navigate('/login'); // Redireciona para a página de login
  };

  return (
    <div>
      {/* Exemplo de como usar os dados do usuário */}
      <h1>Bem-vindo, {user ? user.nome || user.usuario : 'usuário'}!</h1> 
      <h2>Bem-vindo ao seu inbox!</h2>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/solicitacoes" style={{ marginRight: '15px' }}>Ver Solicitações</Link>
        {/* Exemplo de exibição condicional baseada em papel */}
        {user && user.roles && user.roles.includes('requerente') && (
          <Link to="/solicitacoes/novo">Nova Solicitação</Link>
        )}
        {/* Você pode ter outros links condicionais para 'administrador' aqui também */}
      </nav>
      <button onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
}