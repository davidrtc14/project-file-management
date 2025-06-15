import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Bem-vindo ao Sistema</h1>
      <nav>
        <Link to="/transferencias">Ver Transferências</Link> | <Link to="/transferencias/novo">Nova Transferência</Link>
      </nav>
    </div>
  );
}
