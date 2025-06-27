import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3000/api';

export default function SolicitacaoForm() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        nome_documento: '',
        descricao: '',
        quantidade: '',
        setor_remetente_id: '',
        setor_destinatario_id: '',
        responsavel_setor_id: '',
        data_transferencia: '',
        observacoes: '',
        status: 'pendente', // Status inicial para criação
        data_recebimento: '',
        caminho_arquivo_assinado: ''
    });

    const [setores, setSetores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [erros, setErros] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleApiError = (err) => {
        setLoading(false);
        if (err.response) {
            if (err.response.status === 401 || err.response.status === 403) {
                console.error("Erro de autenticação/autorização:", err.response.data.erro || err.message);
                logout();
                navigate('/login');
            } else if (err.response.data.erros && err.response.data.erros.length > 0) {
                setErros(err.response.data.erros);
            } else if (err.response.data.erro) {
                setErros([err.response.data.erro]);
            } else {
                setErros(['Ocorreu um erro inesperado na requisição.']);
            }
        } else {
            setErros(['Não foi possível conectar ao servidor. Verifique sua conexão.']);
            console.error('Erro de rede ou desconhecido:', err);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const fetchData = async () => {
            setLoading(true);
            try {
                const setoresRes = await axios.get(`${API_BASE_URL}/setores`, { headers });
                setSetores(setoresRes.data);

                const usuariosRes = await axios.get(`${API_BASE_URL}/usuarios`, { headers });
                setUsuarios(usuariosRes.data);

                if (id) { // Modo de Edição
                    const solicitacaoRes = await axios.get(`${API_BASE_URL}/solicitacoes/${id}`, { headers });
                    const solicitacaoData = solicitacaoRes.data;

                    console.log('Dados da solicitação recebidos no SolicitacaoForm para edição:', solicitacaoData); // <-- Mantenha este log

                    const dataTransferenciaFormatada = solicitacaoData.data_transferencia ?
                        new Date(solicitacaoData.data_transferencia).toISOString().split('T')[0] : '';
                    const dataRecebimentoFormatada = solicitacaoData.data_recebimento ?
                        new Date(solicitacaoData.data_recebimento).toISOString().slice(0, 16) : '';

                    setFormData({
                        nome_documento: solicitacaoData.nome_documento,
                        descricao: solicitacaoData.descricao,
                        quantidade: solicitacaoData.quantidade,
                        setor_remetente_id: solicitacaoData.setor_remetente_id,
                        setor_destinatario_id: solicitacaoData.setor_destinatario_id,
                        responsavel_setor_id: solicitacaoData.responsavel_setor_id,
                        data_transferencia: dataTransferenciaFormatada,
                        observacoes: solicitacaoData.observacoes,
                        data_recebimento: dataRecebimentoFormatada,
                    });
                } else { // Modo de Criação
                    setFormData(prev => ({
                        ...prev,
                        requerente_id: user.id,
                        setor_remetente_id: user.setor_id
                    }));
                }
            } catch (err) {
                handleApiError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate, token, logout, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantidade' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErros([]);

        if (!token) {
            handleApiError({ response: { status: 401 } });
            return;
        }

        setLoading(true);
        try {
            const dataToSubmit = { ...formData };
            dataToSubmit.requerente_id = user.id; // Garante que o requerente_id é o do usuário logado

            // Remover campos que não devem ser enviados ou são gerados automaticamente pelo backend na CRIAÇÃO
            if (!id) { // Se estiver criando
                delete dataToSubmit.status; // Status é padrão 'pendente'
                delete dataToSubmit.data_recebimento; // É preenchido automaticamente
                delete dataToSubmit.caminho_arquivo_assinado; // É anexado depois
            }

            if (id) {
                await axios.put(`${API_BASE_URL}/solicitacoes/${id}`, dataToSubmit, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Solicitação atualizada com sucesso!');
            } else {
                await axios.post(`${API_BASE_URL}/solicitacoes`, dataToSubmit, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Solicitação criada com sucesso!');
            }
            navigate('/home'); // Redireciona para a home após salvar
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Carregando formulário...</div>;
    }

    return (
  <div className="container">
    <form onSubmit={handleSubmit} className="form-wrapper">
      <h2>{id ? 'Editar' : 'Nova'} Solicitação de Documentos</h2>  
      <div className="form-field-group">
        <label htmlFor="nome_documento">Nome do(s) Documento(s):</label>
        <input
          type="text"
          id="nome_documento"
          name="nome_documento"
          value={formData.nome_documento}
          onChange={handleChange}
          placeholder="Nome do documento"
          required
        />
      </div>

      <div className="form-field-group">
        <label htmlFor="descricao">Descrição:</label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao || ''}
          onChange={handleChange}
          placeholder="Descrição"
        />
      </div>

      <div className="form-field-group">
        <label htmlFor="quantidade">Quantidade:</label>
        <select
          id="quantidade"
          name="quantidade"
          value={formData.quantidade}
          onChange={handleChange}
          required
        >
          <option value="">Selecione uma quantidade</option>
          {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label htmlFor="setor_remetente_id">Setor Remetente:</label>
        <select
          id="setor_remetente_id"
          name="setor_remetente_id"
          value={formData.setor_remetente_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um setor</option>
          {setores.map(setor => (
            <option key={setor.id} value={setor.id}>
              {setor.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label htmlFor="setor_destinatario_id">Setor Destinatário:</label>
        <select
          id="setor_destinatario_id"
          name="setor_destinatario_id"
          value={formData.setor_destinatario_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um setor</option>
          {setores.map(setor => (
            <option key={setor.id} value={setor.id}>
              {setor.nome}
            </option>
          ))}
        </select>
      </div>

      <p className="req">
        Requerente: <strong>{user ? user.nome || user.usuario : 'Carregando...'}</strong>
      </p>

      <div className="form-field-group">
        <label htmlFor="responsavel_setor_id">Responsável do Setor:</label>
        <select
          id="responsavel_setor_id"
          name="responsavel_setor_id"
          value={formData.responsavel_setor_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um responsável</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>
              {u.nome || u.usuario}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field-group">
        <label htmlFor="data_transferencia">Data da Transferência:</label>
        <input
          type="date"
          id="data_transferencia"
          name="data_transferencia"
          value={formData.data_transferencia}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-field-group">
        <label htmlFor="observacoes">Observações:</label>
        <textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes || ''}
          onChange={handleChange}
          placeholder="Observações"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>

      {erros.length > 0 && (
        <ul className="error-list">
          {erros.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      )}
    </form>
  </div>
);
}

