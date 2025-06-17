import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importe 'useNavigate'

export default function Home() {
  const navigate = useNavigate(); // Hook para navegação

  // Função para lidar com o logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token do armazenamento local
    navigate('/login'); // Redireciona o usuário para a página de login
  };

  return (
    <div>
      <h1>Bem-vindo ao Sistema!</h1>
      <nav style={{ marginBottom: '20px' }}>
        {/* Links de navegação para funcionalidades */}
        <Link to="/transferencias" style={{ marginRight: '15px' }}>Ver Transferências</Link>
        <Link to="/transferencias/novo">Nova Transferência</Link>
      </nav>
      {/* Botão de Logout */}
      <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Sair
      </button>
    </div>
  );
}