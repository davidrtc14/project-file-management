import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h1>Bem-vindo ao Sistema!</h1>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/transferencias" style={{ marginRight: '15px' }}>Ver Transferências</Link>
        <Link to="/transferencias/novo">Nova Transferência</Link>
      </nav>
      <button onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
}