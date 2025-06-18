import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function VerSolicitacao() {
  const [solicitacao, setSolicitacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  const handleAuthError = (err) => {
    if (err.response && (err.response.status === 403 || err.response.status === 401)) {
      console.log("Token expirado ou inválido. Redirecionando para login.");
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      setError(err.response?.data?.erro || 'Ocorreu um erro ao carregar a solicitação.');
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("Nenhum token encontrado. Redirecionando para login.");
      navigate('/login');
      return;
    }

    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/api/solicitacoes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setSolicitacao(res.data);
          setLoading(false);
        })
        .catch(handleAuthError);
    }
  }, [id, navigate]);

  const formatarDataCompleta = (dataString) => {
    if (!dataString) return 'Não disponível';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatarApenasData = (dataString) => {
    if (!dataString) return 'Não disponível';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
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
        alert('Solicitação deletada com sucesso!');
        navigate('/solicitacoes');
      } catch (err) {
        handleAuthError(err);
      }
    }
  };

  if (loading) {
    return (
      <div>
        <h2>Detalhes da Solicitação</h2>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Detalhes da Solicitação</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/solicitacoes">Voltar para a Lista</Link>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <div>
        <h2>Detalhes da Solicitação</h2>
        <p>Nenhuma solicitação encontrada para o ID: {id}</p>
        <Link to="/solicitacoes">Voltar para a Lista</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Detalhes da Solicitação: {solicitacao.nome_documento}</h2>

      <p><strong>Nome do Documento:</strong> {solicitacao.nome_documento}</p>
      <p><strong>Descrição:</strong> {solicitacao.descricao || 'N/A'}</p>
      <p><strong>Quantidade:</strong> {solicitacao.quantidade}</p>
      <p><strong>Setor Remetente:</strong> {solicitacao.setor_remetente}</p>
      <p><strong>Setor Destinatário:</strong> {solicitacao.setor_destinatario}</p>
      <p><strong>Requerente:</strong> {solicitacao.requerente}</p>
      <p><strong>Responsável do Setor:</strong> {solicitacao.responsavel_setor}</p>
      <p><strong>Data da Solicitação:</strong> {formatarApenasData(solicitacao.data_transferencia)}</p>
      <p><strong>Observações:</strong> {solicitacao.observacoes || 'N/A'}</p>
      <p><strong>Registrado em:</strong> {formatarDataCompleta(solicitacao.criado_em)}</p>

      <div style={{ marginTop: '20px' }}>
        <Link to={`/solicitacoes/${solicitacao.id}/editar`} style={{ marginRight: '10px' }}>Editar</Link>
        <Link to="/solicitacoes">Voltar para a Lista</Link>
        <button
          onClick={() => handleDelete(solicitacao.id)}
          style={{
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            margin: '10px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Deletar
        </button>
      </div>
    </div>
  );
}
