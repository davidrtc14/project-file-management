// src/pages/solicitacoes/Solicitacoes.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importe o hook de autenticação

// Constante para a URL base da sua API
const API_BASE_URL = 'http://localhost:3000/api'; 

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [listLoading, setListLoading] = useState(true); // Para o carregamento da lista
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Renomeado a variável 'loading' de useAuth para 'authLoading' para clareza
  const { user, token, logout, hasRole, loading: authLoading } = useAuth(); 

  // Função centralizada para lidar com erros de API
  const handleApiError = (err) => {
    setListLoading(false); // Parar o carregamento em caso de erro
    if (err.response) {
      if (err.response.status === 401 || err.response.status === 403) {
        console.error("Erro de autenticação/autorização ao buscar solicitações:", err.response.data.erro || err.message);
        logout(); // Usa a função logout do contexto para deslogar
        navigate('/login');
      } else if (err.response.data.erros && err.response.data.erros.length > 0) {
        // Erros de validação do backend (array de strings)
        setError(err.response.data.erros.join('; ')); // Junta os erros para exibir
      } else if (err.response.data.erro) {
        // Erro genérico do backend (string única)
        setError(err.response.data.erro);
      } else {
        setError('Ocorreu um erro inesperado ao buscar solicitações.');
      }
    } else {
      setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      console.error('Erro de rede ou desconhecido:', err);
    }
  };

  // useEffect para buscar as solicitações
  useEffect(() => {
    // Ação principal do useEffect: carregar dados SÓ DEPOIS que o AuthContext terminar de carregar
    if (authLoading) { 
        return; // Espera o contexto de autenticação carregar o usuário/token
    }

    // Se o AuthContext já carregou e não há usuário/token, redireciona.
    // Isso é uma salvaguarda, pois o PrivateRoute já faria isso.
    if (!user || !token) { 
        navigate('/login');
        return;
    }
    
    const fetchSolicitacoes = async () => {
      setError(''); // Limpa erros anteriores
      setListLoading(true); // Inicia o carregamento da lista

      try {
        const res = await axios.get(`${API_BASE_URL}/solicitacoes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitacoes(res.data);
      } catch (err) {
        handleApiError(err);
      } finally {
        setListLoading(false); // Finaliza o carregamento da lista
      }
    };

    fetchSolicitacoes();
    // Dependências: user e token para re-buscar se o status de login mudar.
    // logout e navigate para evitar warnings de ESLint (são estáveis do React Router/Context).
    // authLoading para garantir que a busca comece após a autenticação inicial.
  }, [user, token, logout, navigate, authLoading]); 

  const formatarData = (dataString) => {
    if (!dataString) return 'Data indisponível';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleDelete = async (idToDelete) => { 
    setError('');
    // Verifica se há token antes de prosseguir (redundante se a rota for protegida por authMiddleware, mas é uma boa prática)
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
      setListLoading(true); // Inicia o carregamento da lista (para o botão ficar desabilitado)
      try {
        await axios.delete(`${API_BASE_URL}/solicitacoes/${idToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Remove a solicitação deletada do estado local para atualizar a UI
        setSolicitacoes(prevSolicitacoes => prevSolicitacoes.filter(s => s.id !== idToDelete));
        alert('Solicitação deletada com sucesso!');
      } catch (err) {
        handleApiError(err);
      } finally {
        setListLoading(false); // Finaliza o carregamento
      }
    }
  };

  // Exibe feedback de carregamento enquanto os dados estão sendo buscados
  if (authLoading || listLoading) { 
    return <div>Carregando solicitações...</div>; 
  }

  return (
    <div>
      <h2>Solicitações</h2>
      {/* Link para criar nova solicitação, visível apenas para usuários com papel 'requerente' */}
      {hasRole('requerente') && (
        <Link to="/solicitacoes/novo" style={{ marginBottom: '20px', display: 'inline-block' }}>
          + Nova Solicitação
        </Link>
      )}
      
      {/* Exibe mensagens de erro, se houver */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* Renderiza a lista de solicitações ou uma mensagem se vazia */}
      {solicitacoes.length === 0 ? (
        <p>Nenhuma solicitação encontrada.</p>
      ) : (
        <ul>
          {solicitacoes.map((s) => (
            <li key={s.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              {/* Exibindo detalhes da solicitação usando os nomes completos dos JOINs do backend */}
              <strong>Documento:</strong> {s.nome_documento} ({s.quantidade})<br />
              <strong>De:</strong> {s.setor_remetente_nome} (Requerente: {s.requerente_nome})<br />
              <strong>Para:</strong> {s.setor_destinatario_nome} (Responsável: {s.responsavel_setor_nome})<br />
              <strong>Data Transferência:</strong> {formatarData(s.data_transferencia)}<br />
              <strong>Criado em:</strong> {formatarData(s.criado_em)}<br />
              <strong>Status:</strong> {s.status.toUpperCase()}<br />
              {/* Renderização condicional para data de recebimento, se existir */}
              {s.data_recebimento && (
                  <>
                      <strong>Recebido em:</strong> {formatarData(s.data_recebimento)}<br />
                  </>
              )}
              {/* Renderização condicional para o link do arquivo assinado, se existir */}
              {s.caminho_arquivo_assinado && (
                  <>
                      <strong>Arquivo Assinado:</strong>{' '} 
                      <a href={s.caminho_arquivo_assinado} target="_blank" rel="noopener noreferrer">Ver</a><br />
                  </>
              )}

              <div style={{ marginTop: '10px' }}>
                <Link to={`/solicitacoes/${s.id}`} style={{ marginRight: '10px' }}>Ver Detalhes</Link>
                {/* Botões de Editar e Deletar aparecem apenas para Administradores */}
                {hasRole('administrador') && (
                  <>
                    <Link to={`/solicitacoes/${s.id}/editar`} style={{ marginRight: '10px' }}>Editar</Link>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={listLoading} // Botão desabilitado durante o carregamento/exclusão
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        cursor: listLoading ? 'not-allowed' : 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      Deletar
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}