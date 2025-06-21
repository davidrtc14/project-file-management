// src/pages/solicitacoes/VerSolicitacao.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importe o hook de autenticação

// Constante para a URL base da sua API
const API_BASE_URL = 'http://localhost:3000/api'; 

export default function VerSolicitacao() {
  const [solicitacao, setSolicitacao] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carregamento para a solicitação
  const [error, setError] = useState('');
  const { id } = useParams(); // ID da solicitação da URL
  const navigate = useNavigate();
  // Obtém user, token, logout e hasRole do contexto, e authLoading do AuthContext
  const { user, token, logout, hasRole, loading: authLoading } = useAuth(); 

  // Função centralizada para lidar com erros de API
  const handleApiError = (err) => {
    setLoading(false); // Parar o carregamento em caso de erro
    if (err.response) {
      // Erros 401 (Unauthorized) ou 403 (Forbidden) devem deslogar ou redirecionar
      if (err.response.status === 401 || err.response.status === 403) {
        console.error("Erro de autenticação/autorização ao buscar solicitação:", err.response.data.erro || err.message);
        logout(); // Usa a função logout do contexto
        navigate('/login');
      } else if (err.response.data.erros && err.response.data.erros.length > 0) {
        // Erros de validação do backend (array de strings)
        setError(err.response.data.erros.join('; ')); // Junta os erros para exibir
      } else if (err.response.data.erro) {
        // Erro genérico do backend (string única)
        setError(err.response.data.erro);
      } else {
        setError('Ocorreu um erro inesperado ao carregar a solicitação.');
      }
    } else {
      // Erros de rede, etc.
      setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      console.error('Erro de rede ou desconhecido:', err);
    }
  };

  // useEffect para buscar os detalhes da solicitação
  useEffect(() => {
    // Se o AuthContext ainda está carregando, espera.
    if (authLoading) {
      return; 
    }

    // Se o AuthContext já carregou e não há usuário/token, redireciona.
    if (!user || !token) { 
        navigate('/login');
        return;
    }

    if (id) {
      setLoading(true); // Inicia o carregamento da solicitação específica
      axios
        .get(`${API_BASE_URL}/solicitacoes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setSolicitacao(res.data);
          setLoading(false);
        })
        .catch(handleApiError);
    }
  }, [id, navigate, user, token, logout, authLoading]); // Adicionadas dependências do AuthContext

  // Função para formatar data e hora completas
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

  // Função para formatar apenas a data
  const formatarApenasData = (dataString) => {
    if (!dataString) return 'Não disponível';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Lógica de exclusão da solicitação
  const handleDelete = async (idToDelete) => { // Renomeado id para idToDelete
    setError('');
    if (!token) {
      handleApiError({ response: { status: 401 } }); 
      return;
    }

    // Verifica a permissão do usuário logado antes de permitir a ação na UI
    if (!hasRole('administrador')) {
        setError('Você não tem permissão para deletar solicitações.');
        return;
    }

    if (window.confirm('Tem certeza que deseja deletar esta solicitação? Esta ação não pode ser desfeita.')) {
      setLoading(true); // Desabilita botões enquanto deleta
      try {
        await axios.delete(`${API_BASE_URL}/solicitacoes/${idToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Solicitação deletada com sucesso!');
        navigate('/solicitacoes'); // Redireciona para a lista após deletar
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Renderização condicional baseada no estado de carregamento e erro
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

  // Renderização dos detalhes da solicitação
  return (
    <div>
      <h2>Detalhes da Solicitação: {solicitacao.nome_documento}</h2>

      <p><strong>ID da Solicitação:</strong> {solicitacao.id}</p>
      <p><strong>Nome do Documento:</strong> {solicitacao.nome_documento}</p>
      <p><strong>Descrição:</strong> {solicitacao.descricao || 'N/A'}</p>
      <p><strong>Quantidade:</strong> {solicitacao.quantidade}</p>
      {/* Usando os nomes completos que vêm do backend via JOIN */}
      <p><strong>Setor Remetente:</strong> {solicitacao.setor_remetente_nome}</p>
      <p><strong>Setor Destinatário:</strong> {solicitacao.setor_destinatario_nome}</p>
      <p><strong>Requerente:</strong> {solicitacao.requerente_nome}</p>
      <p><strong>Responsável do Setor:</strong> {solicitacao.responsavel_setor_nome}</p>
      <p><strong>Data da Transferência:</strong> {formatarApenasData(solicitacao.data_transferencia)}</p>
      <p><strong>Observações:</strong> {solicitacao.observacoes || 'N/A'}</p>
      <p><strong>Status:</strong> {solicitacao.status ? solicitacao.status.toUpperCase() : 'N/A'}</p>
      {solicitacao.data_recebimento && 
        <p><strong>Recebido em:</strong> {formatarDataCompleta(solicitacao.data_recebimento)}</p>
      }
      {solicitacao.caminho_arquivo_assinado && 
        <p>
            <strong>Arquivo Assinado:</strong>{' '}
            <a href={solicitacao.caminho_arquivo_assinado} target="_blank" rel="noopener noreferrer">Ver Documento</a>
        </p>
      }
      <p><strong>Criado em:</strong> {formatarDataCompleta(solicitacao.criado_em)}</p>

      <div style={{ marginTop: '20px' }}>
        {/* Botão Editar visível apenas para Administradores */}
        {hasRole('administrador') && (
            <Link to={`/solicitacoes/${solicitacao.id}/editar`} style={{ marginRight: '10px' }}>Editar</Link>
        )}
        <Link to="/solicitacoes">Voltar para a Lista</Link>
        {/* Botão Deletar visível apenas para Administradores */}
        {hasRole('administrador') && (
            <button
                onClick={() => handleDelete(solicitacao.id)}
                disabled={loading} // Desabilita durante o carregamento/exclusão
                style={{
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    margin: '0 10px', // Ajuste a margem para não colar com o link Voltar
                    cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: '4px'
                }}
            >
                Deletar
            </button>
        )}
      </div>
    </div>
  );
}