import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Transferencias() {
  const [transferencias, setTransferencias] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:3000/api/transferencias', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTransferencias(res.data))
      .catch((err) => setError(err.response?.data?.erro || 'Erro ao buscar transferências'));
  }, []);

  return (
    <div>
      <h2>Transferências</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {transferencias.map((t) => (
          <li key={t.id}>
            {t.nome_arquivo} - {t.setor_remetente} para {t.setor_destinatario} - {t.data_transferencia}
            {' | '}
            <Link to={`/transferencias/${t.id}/editar`}>Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
