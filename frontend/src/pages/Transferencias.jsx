import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Importe 'useNavigate'

export default function Transferencias() {
  const [transferencias, setTransferencias] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleAuthError = (err) => {
    if (err.response && err.response.status === 403) {
      console.log("Token expirado ou inválido. Redirecionando para login.");
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      setError(err.response?.data?.erro || 'Ocorreu um erro inesperado.');
    }
  };

  useEffect(() => {
    const fetchTransferencias = async () => {
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        console.log("Nenhum token encontrado. Redirecionando para login.");
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:3000/api/transferencias', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransferencias(res.data);
      } catch (err) {
        handleAuthError(err);
      }
    };

    fetchTransferencias();
  }, [navigate]);

  const formatarData = (dataString) => {
    if (!dataString) return 'Data indisponível';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleDelete = async (id) => {
    setError('');
    const token = localStorage.getItem('token');

    if (!token) {
        console.log("Nenhum token encontrado para deletar. Redirecionando para login.");
        navigate('/login');
        return;
    }

    if (window.confirm('Tem certeza que deseja deletar esta transferência? Esta ação não pode ser desfeita.')) {
      try {
        await axios.delete(`http://localhost:3000/api/transferencias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransferencias(transferencias.filter(t => t.id !== id));
        alert('Transferência deletada com sucesso!');
      } catch (err) {
        handleAuthError(err);
      }
    }
  };

  return (
    <div>
      <h2>Transferências</h2>
      <Link to="/transferencias/novo" style={{ marginBottom: '20px', display: 'inline-block' }}>
        + Nova Transferência
      </Link>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {transferencias.map((t) => (
          <li key={t.id}>
            {t.nome_arquivo} - {t.setor_remetente} para {t.setor_destinatario} - {' '}
            {formatarData(t.criado_em)}
            {' | '}
            <Link to={`/transferencias/${t.id}`} style={{ marginRight: '10px' }}>Ver Detalhes</Link>
            {' | '}
            <Link to={`/transferencias/${t.id}/editar`} style={{ marginRight: '10px' }}>Editar</Link>
            {' | '}
            <button
              onClick={() => handleDelete(t.id)}
              style={{
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Deletar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}