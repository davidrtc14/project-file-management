import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function VerTransferencia() {
  const [transferencia, setTransferencia] = useState(null);
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
      setError(err.response?.data?.erro || 'Ocorreu um erro ao carregar a transferência.');
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
        .get(`http://localhost:3000/api/transferencias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setTransferencia(res.data);
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

  if (loading) {
    return (
      <div>
        <h2>Detalhes da Transferência</h2>
        <p>Carregando detalhes da transferência...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Detalhes da Transferência</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/transferencias">Voltar para a Lista</Link>
      </div>
    );
  }

  if (!transferencia) {
    return (
      <div>
        <h2>Detalhes da Transferência</h2>
        <p>Nenhuma transferência encontrada para o ID: {id}</p>
        <Link to="/transferencias">Voltar para a Lista</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Detalhes da Transferência: {transferencia.nome_arquivo}</h2>
      
      <p><strong>Nome do Arquivo:</strong> {transferencia.nome_arquivo}</p>
      <p><strong>Descrição:</strong> {transferencia.descricao || 'N/A'}</p>
      <p><strong>Setor Remetente:</strong> {transferencia.setor_remetente}</p>
      <p><strong>Setor Destinatário:</strong> {transferencia.setor_destinatario}</p>
      <p><strong>Responsável:</strong> {transferencia.responsavel}</p>
      <p><strong>Data da Transferência:</strong> {formatarApenasData(transferencia.data_transferencia)}</p>
      <p><strong>Caminho do Arquivo:</strong> {transferencia.caminho_arquivo || 'N/A'}</p>
      <p><strong>Registrado em:</strong> {formatarDataCompleta(transferencia.criado_em)}</p>

      <div style={{ marginTop: '20px' }}>
        <Link to={`/transferencias/${transferencia.id}/editar`} style={{ marginRight: '10px' }}>Editar Transferência</Link>
        <Link to="/transferencias">Voltar para a Lista</Link>
      </div>
    </div>
  );
}