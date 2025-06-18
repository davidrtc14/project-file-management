import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    const fetchSolicitacoes = async () => {
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        console.log("Nenhum token encontrado. Redirecionando para login.");
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:3000/api/solicitacoes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitacoes(res.data);
      } catch (err) {
        handleAuthError(err);
      }
    };

    fetchSolicitacoes();
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

    if (window.confirm('Tem certeza que deseja deletar esta solicitação? Esta ação não pode ser desfeita.')) {
      try {
        await axios.delete(`http://localhost:3000/api/solicitacoes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitacoes(solicitacoes.filter(s => s.id !== id));
        alert('Solicitação deletada com sucesso!');
      } catch (err) {
        handleAuthError(err);
      }
    }
  };

  return (
    <div>
      <h2>Solicitações</h2>
      <Link to="/solicitacoes/novo" style={{ marginBottom: '20px', display: 'inline-block' }}>
        + Nova Solicitação
      </Link>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {solicitacoes.map((s) => (
          <li key={s.id}>
            {s.nome_arquivo} - {s.setor_remetente} para {s.setor_destinatario} - {' '}
            {formatarData(s.criado_em)}
            {' | '}
            <Link to={`/solicitacoes/${s.id}`} style={{ marginRight: '10px' }}>Ver Detalhes</Link>
            {' | '}
            <Link to={`/solicitacoes/${s.id}/editar`} style={{ marginRight: '10px' }}>Editar</Link>
            {' | '}
            <button
              onClick={() => handleDelete(s.id)}
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
