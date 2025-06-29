import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3000/api';
const STATIC_FILES_BASE_URL = 'http://localhost:3000'; 

export default function VerSolicitacao() {
  const [solicitacao, setSolicitacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false); // Novo estado para o upload
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, logout, hasRole, loading: authLoading } = useAuth();

  const handleApiError = (err) => {
    setLoading(false);
    setUploading(false); // Parar upload em caso de erro
    if (err.response) {
      if (err.response.status === 401 || err.response.status === 403) {
        console.error("Erro de autenticação/autorização:", err.response.data.erro || err.message);
        logout();
        navigate('/login');
      } else if (err.response.data.erros && err.response.data.erros.length > 0) {
        setError(err.response.data.erros.join('; '));
      } else if (err.response.data.erro) {
        setError(err.response.data.erro);
      } else {
        setError('Ocorreu um erro inesperado ao carregar a solicitação.');
      }
    } else {
      setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      console.error('Erro de rede ou desconhecido:', err);
    }
  };

  useEffect(() => {
    if (authLoading) { return; }
    if (!user || !token) { navigate('/login'); return; }

    if (id) {
      setLoading(true);
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
  }, [id, navigate, user, token, logout, authLoading]);

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

  const handleDelete = async (idToDelete) => {
    setError('');
    if (!token) { handleApiError({ response: { status: 401 } }); return; }

    if (!hasRole('administrador')) {
        setError('Você não tem permissão para deletar solicitações.');
        return;
    }

    if (window.confirm('Tem certeza que deseja deletar esta solicitação? Esta ação não pode ser desfeita.')) {
      setLoading(true);
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

  // NOVO: Função para gerar o relatório individual PDF
  const handleGeneratePdf = async () => {
    if (!token) { handleApiError({ response: { status: 401 } }); return; }
    // A rota do backend já tem a lógica de autorização para admin ou requerente da própria solicitação.
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/solicitacoes/${id}/relatorio-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recibo_solicitacao_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Relatório PDF gerado e baixado com sucesso!');
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // NOVO: Função para lidar com o upload do arquivo assinado
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file); // 'file' deve corresponder ao nome do campo no multer do backend

    // Assegurar que apenas admins ou o setor destinatário/responsável possam fazer upload
    if (!hasRole('administrador') && user.setor_id !== solicitacao.setor_destinatario_id && user.id !== solicitacao.responsavel_setor_id) {
        setError('Você não tem permissão para anexar o relatório assinado a esta solicitação.');
        setUploading(false);
        return;
    }
    
    try {
        // Envia o arquivo para uma nova rota de upload no backend
        // Esta rota vai atualizar o caminho_arquivo_assinado e o status
        const response = await axios.put(`${API_BASE_URL}/solicitacoes/${id}/anexar-relatorio`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data' // Importante para upload de arquivo
            }
        });

        // Atualiza o estado da solicitação no frontend com os novos dados (caminho e status)
        setSolicitacao(response.data.solicitacaoAtualizada); 
        alert(response.data.mensagem);

    } catch (err) {
        console.error('Erro ao fazer upload do arquivo:', err);
        handleApiError(err);
    } finally {
        setUploading(false);
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

      <p><strong>ID da Solicitação:</strong> {solicitacao.id}</p>
      <p><strong>Nome do Documento:</strong> {solicitacao.nome_documento}</p>
      <p><strong>Descrição:</strong> {solicitacao.descricao || 'N/A'}</p>
      <p><strong>Quantidade:</strong> {solicitacao.quantidade}</p>
      {/* Use os nomes que vêm do backend. O problema de encoding é do DB/backend. */}
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
            {/* CORREÇÃO AQUI: Use STATIC_FILES_BASE_URL para o href */}
            <a href={`${STATIC_FILES_BASE_URL}${solicitacao.caminho_arquivo_assinado}`} target="_blank" rel="noopener noreferrer">Ver Documento</a>
        </p>
      }
      <p><strong>Criado em:</strong> {formatarDataCompleta(solicitacao.criado_em)}</p>

      {/* Seção para upload do relatório assinado */}
      {(hasRole('administrador') || user.setor_id === solicitacao.setor_destinatario_id || user.id === solicitacao.responsavel_setor_id) && !solicitacao.caminho_arquivo_assinado && (
          <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
              <h3>Anexar Relatório Assinado</h3>
              <p>O status da solicitação será atualizado para "Assinado" após o anexo.</p>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload} 
                disabled={uploading} 
              />
              {uploading && <p>Enviando arquivo...</p>}
              {error && <p style={{color: 'red'}}>{error}</p>}
          </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Botão Editar: Administrador vê o genérico, Funcionário vê o "Minha Solicitação" */}
        {hasRole('administrador') ? (
            <Link to={`/solicitacoes/${solicitacao.id}/editar`}>Editar</Link>
        ) : (
            hasRole('funcionario') && user && user.id === solicitacao.requerente_id && (
                <Link to={`/solicitacoes/${solicitacao.id}/editar`}>Editar Minha Solicitação</Link>
            )
        )}
        
        <Link to="/home">Voltar para a Lista</Link> {/* Sempre visível */}
        
        {/* Botão Deletar: APENAS ADMINISTRADOR */}
        {hasRole('administrador') && (
            <button
                onClick={() => handleDelete(solicitacao.id)}
                disabled={loading}
                style={{
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: '4px'
                }}
            >
                Deletar
            </button>
        )}
        
        {/* Botão Gerar Relatório PDF: Visível para Admin ou Requerente da própria solicitação */}
        {(hasRole('administrador') || (user && user.id === solicitacao.requerente_id)) && (
            <button
                onClick={handleGeneratePdf}
                disabled={loading}
                style={{
                    backgroundColor: 'blue',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: '4px'
                }}
            >
                Gerar Relatório PDF
            </button>
        )}
      </div>
    </div>
  );
}