import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3000/api';
const STATIC_FILES_BASE_URL = 'http://localhost:3000'; 

export default function Home() {
  const navigate = useNavigate();
  const { logout, user, token, hasRole, loading: authLoading } = useAuth();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [setores, setSetores] = useState([]);
  const [selectedSetorId, setSelectedSetorId] = useState(null); 
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');

  const handleApiError = (err) => {
    setListLoading(false); 
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
        setError('Ocorreu um erro inesperado.');
      }
    } else {
      setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      console.error('Erro de rede ou desconhecido:', err);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) { navigate('/login'); return; }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchInitialData = async () => {
      setListLoading(true);
      try {
        const setoresRes = await axios.get(`${API_BASE_URL}/setores`, { headers });
        setSetores(setoresRes.data);

        if (selectedSetorId === null) { 
            if (hasRole('administrador')) {
                setSelectedSetorId(''); 
            } else if (user.setor_id) {
                setSelectedSetorId(user.setor_id); 
            }
        }

        let solicitacoesUrl = `${API_BASE_URL}/solicitacoes`;
        let filterSetorId = selectedSetorId; 

        if (hasRole('administrador')) {
            if (filterSetorId !== '' && filterSetorId !== null) { 
                solicitacoesUrl += `?setorId=${filterSetorId}`;
            }
        } else if (hasRole('funcionario') && user.setor_id) {
            solicitacoesUrl += `?setorId=${user.setor_id}`;
            if (selectedSetorId === null || selectedSetorId !== user.setor_id) {
                 setSelectedSetorId(user.setor_id);
            }
        } else {
            setError('Seu setor não foi definido ou permissão insuficiente. Contate o administrador.');
            setListLoading(false);
            return;
        }

        const solicitacoesRes = await axios.get(solicitacoesUrl, { headers });
        setSolicitacoes(solicitacoesRes.data);

      } catch (err) {
        handleApiError(err);
      } finally {
        setListLoading(false);
      }
    };

    fetchInitialData();
  }, [user, token, logout, navigate, authLoading, selectedSetorId, hasRole, user?.setor_id]); 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSetorChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setSelectedSetorId(value);
  };

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
    if (!token) { handleApiError({ response: { status: 401 } }); return; }

    if (!hasRole('administrador')) {
        setError('Você não tem permissão para deletar solicitações.');
        return;
    }

    if (window.confirm('Tem certeza que deseja deletar esta solicitação? Esta ação não pode ser desfeita.')) {
      setListLoading(true); 
      try {
        await axios.delete(`${API_BASE_URL}/solicitacoes/${idToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitacoes(prevSolicitacoes => prevSolicitacoes.filter(s => s.id !== idToDelete));
        alert('Solicitação deletada com sucesso!');
      } catch (err) {
        handleApiError(err);
      } finally {
        setListLoading(false);
      }
    }
  };

  const handleGeneratePlanilhaPdf = async () => {
    if (!token) { handleApiError({ response: { status: 401 } }); return; }
    if (!hasRole('administrador')) {
      setError('Acesso negado. Apenas administradores podem gerar a planilha geral.');
      return;
    }
    setListLoading(true); 
    try {
      let planilhaUrl = `${API_BASE_URL}/solicitacoes/relatorio-geral-pdf`;
      if (selectedSetorId) {
          planilhaUrl += `?setorId=${selectedSetorId}`;
      }
      
      const response = await axios.get(planilhaUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `planilha_solicitacoes_setor_${selectedSetorId || 'todos'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Planilha PDF gerada e baixada com sucesso!');
    } catch (err) {
      handleApiError(err);
    } finally {
      setListLoading(false);
    }
  };

  const getSelectedSetorName = () => {
    if (selectedSetorId === '') {
      return 'Todos os Setores (Admin)';
    }
    const setor = setores.find(s => s.id === selectedSetorId);
    return setor ? setor.nome : 'Carregando Setor...';
  };

  return (
    <div className="container"> 
      <h1>Bem-vindo, {user ? user.nome || user.usuario : 'usuário'}!</h1>
      <h2>Solicitações do Setor: {getSelectedSetorName()}</h2>

      {hasRole('administrador') && setores.length > 0 ? (
        <div className="form-field-group"> 
          <label htmlFor="filterSetor">Visualizar Solicitações do Setor:</label>
          <select
            id="filterSetor"
            value={selectedSetorId}
            onChange={handleSetorChange}
          >
            <option value="">Todos os Setores (Admin)</option>
            {setores.map(setor => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
        </div>
      ) : (
          user && user.setor_id && setores.find(s => s.id === user.setor_id) && (
            <p>Visualizando solicitações do setor: <strong>{setores.find(s => s.id === user.setor_id).nome}</strong></p>
          )
      )}

      <nav className="flex-container"> 
        {(hasRole('funcionario') || hasRole('administrador')) && ( 
          <Link to="/solicitacoes/novo" className="button" style={{ marginRight: '15px' }}>Nova Solicitação</Link>
        )}
        
        {hasRole('administrador') && (
          <button
            onClick={handleGeneratePlanilhaPdf}
            disabled={listLoading}
            className="button button-green"
          >
            Gerar Planilha PDF
          </button>
        )}
      </nav>

      {error && <p className="error-list">{error}</p>}

      {solicitacoes.length === 0 ? (
        <p>Nenhuma solicitação encontrada para este setor.</p>
      ) : (
        <ul className="solicitacoes-list"> 
          {solicitacoes.map((s) => (
            <li key={s.id} className="solicitacao-item"> 
              <strong>Documento:</strong> {s.nome_documento} ({s.quantidade})<br /> 
              <strong>De:</strong> {s.setor_remetente_nome} (Requerente: {s.requerente_nome})<br />
              <strong>Para:</strong> {s.setor_destinatario_nome} (Responsável: {s.responsavel_setor_nome})<br />
              <strong>Data Transferência:</strong> {formatarData(s.data_transferencia)}<br />
              <strong>Criado em:</strong> {formatarData(s.criado_em)}<br />
              <strong>Status:</strong> {s.status.toUpperCase()}<br />
              {s.data_recebimento && (
                  <>
                      <strong>Recebido em:</strong> {formatarData(s.data_recebimento)}<br />
                  </>
              )}
              {s.caminho_arquivo_assinado && (
                  <>
                      <strong>Arquivo Assinado:</strong>{' '}
                      <a href={`${STATIC_FILES_BASE_URL}${s.caminho_arquivo_assinado}`} target="_blank" rel="noopener noreferrer">Ver</a><br />
                  </>
              )}

              <div className="solicitacao-actions"> 
                <Link to={`/solicitacoes/${s.id}`} className="button button-secondary">Ver Detalhes</Link>
                
                {hasRole('administrador') ? (
                    <Link to={`/solicitacoes/${s.id}/editar`} className="button button-secondary">Editar</Link>
                ) : (
                    hasRole('funcionario') && user && user.id === s.requerente_id && (
                        <Link to={`/solicitacoes/${s.id}/editar`} className="button button-secondary">Editar Minha Solicitação</Link>
                    )
                )}

                {hasRole('administrador') && (
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={listLoading}
                      className="button button-red"
                    >
                      Deletar
                    </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleLogout} className="button" style={{ marginTop: '20px' }}>
        Sair
      </button>
    </div>
  );
}