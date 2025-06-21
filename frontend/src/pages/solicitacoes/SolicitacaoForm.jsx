// src/pages/solicitacoes/SolicitacaoForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importe o hook de autenticação

// Constante para a URL base da sua API (boa prática)
const API_BASE_URL = 'http://localhost:3000/api'; 

export default function SolicitacaoForm() {
    const { user, token, logout } = useAuth(); // Obtenha user, token e logout do contexto
    const navigate = useNavigate();
    const { id } = useParams(); // ID da solicitação para edição

    const [formData, setFormData] = useState({
        nome_documento: '',
        descricao: '',
        quantidade: '',
        setor_remetente_id: '',       // <-- Agora é ID
        setor_destinatario_id: '',    // <-- Agora é ID
        // requerente_id: '',           // Será preenchido automaticamente pelo user.id
        responsavel_setor_id: '',     // <-- Agora é ID
        data_transferencia: '',
        observacoes: '',
        status: 'pendente',           // Novo campo, com default
        data_recebimento: '',         // Novo campo
        caminho_arquivo_assinado: ''  // Novo campo
    });
    
    const [setores, setSetores] = useState([]); // Para popular os selects de setor
    const [usuarios, setUsuarios] = useState([]); // Para popular os selects de responsável
    const [erros, setErros] = useState([]);      // Para exibir múltiplos erros do backend
    const [loading, setLoading] = useState(true); // Para controlar o estado de carregamento

    // Função centralizada para lidar com erros de autenticação/autorização
    const handleApiError = (err) => {
        setLoading(false);
        if (err.response) {
            // Erros 401 (Unauthorized) ou 403 (Forbidden) devem deslogar ou redirecionar
            if (err.response.status === 401 || err.response.status === 403) {
                console.error("Erro de autenticação/autorização:", err.response.data.erro || err.message);
                logout(); // Usa a função logout do contexto
                navigate('/login');
            } else if (err.response.data.erros && err.response.data.erros.length > 0) {
                // Erros de validação do backend (array de strings)
                setErros(err.response.data.erros);
            } else if (err.response.data.erro) {
                // Erro genérico do backend (string única)
                setErros([err.response.data.erro]);
            } else {
                setErros(['Ocorreu um erro inesperado na requisição.']);
            }
        } else {
            // Erros de rede, etc.
            setErros(['Não foi possível conectar ao servidor. Verifique sua conexão.']);
            console.error('Erro de rede ou desconhecido:', err);
        }
    };

    // useEffect para buscar dados mestres (setores, usuários) e dados da solicitação (se estiver editando)
    useEffect(() => {
        if (!token) { // Certifique-se que há um token para buscar dados
            navigate('/login');
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Buscar Setores
                const setoresRes = await axios.get(`${API_BASE_URL}/setores`, { headers });
                setSetores(setoresRes.data);

                // 2. Buscar Usuários (para Responsável pelo Setor)
                // Se você tiver uma rota /api/usuarios para listar todos os usuários, use-a aqui.
                // Se não, você precisará criar uma ou popular essa lista de outra forma.
                const usuariosRes = await axios.get(`${API_BASE_URL}/usuarios`, { headers });
                setUsuarios(usuariosRes.data);


                // 3. Se estiver editando, buscar dados da solicitação
                if (id) {
                    const solicitacaoRes = await axios.get(`${API_BASE_URL}/solicitacoes/${id}`, { headers });
                    const solicitacaoData = solicitacaoRes.data;

                    // Formatar a data para o input type="date"
                    const dataTransferenciaFormatada = solicitacaoData.data_transferencia ? 
                                                       new Date(solicitacaoData.data_transferencia).toISOString().split('T')[0] : '';
                    const dataRecebimentoFormatada = solicitacaoData.data_recebimento ? 
                                                     new Date(solicitacaoData.data_recebimento).toISOString().slice(0, 16) : ''; // Para DATETIME-local


                    setFormData({
                        nome_documento: solicitacaoData.nome_documento,
                        descricao: solicitacaoData.descricao,
                        quantidade: solicitacaoData.quantidade,
                        setor_remetente_id: solicitacaoData.setor_remetente_id,
                        setor_destinatario_id: solicitacaoData.setor_destinatario_id,
                        // requerente_id: solicitacaoData.requerente_id, // Requerente_id é fixo do usuário logado
                        responsavel_setor_id: solicitacaoData.responsavel_setor_id,
                        data_transferencia: dataTransferenciaFormatada,
                        observacoes: solicitacaoData.observacoes,
                        status: solicitacaoData.status,
                        data_recebimento: dataRecebimentoFormatada,
                        caminho_arquivo_assinado: solicitacaoData.caminho_arquivo_assinado
                    });
                }
            } catch (err) {
                handleApiError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate, token, logout]); // Dependências do useEffect

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'quantidade' ? Number(value) : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErros([]); // Limpa erros anteriores

        if (!token) {
            handleApiError({ response: { status: 401 } }); // Força erro de auth se não tiver token
            return;
        }

        setLoading(true);
        try {
            const dataToSubmit = { ...formData };
            dataToSubmit.requerente_id = user.id; // Garante que o requerente_id é o do usuário logado

            if (id) {
                // Ao atualizar, só envie os campos que podem ser modificados e que estão no formulário
                // O backend já filtra o que pode ser atualizado.
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
            navigate('/solicitacoes'); // Redireciona para a lista
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Carregando formulário...</div>; // Exibe carregamento
    }

    return (
        <div>
            <h2>{id ? 'Editar' : 'Nova'} Solicitação de Documentos</h2>
            <form onSubmit={handleSubmit}>
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

                <label htmlFor="descricao">Descrição:</label>
                <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao || ''} // Garante que seja string para evitar erro
                    onChange={handleChange}
                    placeholder="Descrição"
                />

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

                {/* Requerente não é um input, é preenchido pelo usuário logado */}
                <p>Requerente: <strong>{user ? user.nome || user.usuario : 'Carregando...'}</strong></p>


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

                <label htmlFor="data_transferencia">Data da Transferência:</label>
                <input
                    type="date"
                    id="data_transferencia"
                    name="data_transferencia"
                    value={formData.data_transferencia}
                    onChange={handleChange}
                    required
                />
                
                <label htmlFor="status">Status:</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                >
                    <option value="pendente">Pendente</option>
                    <option value="recebido">Recebido</option>
                    <option value="assinado">Assinado</option>
                    <option value="recusado">Recusado</option>
                </select>

                <label htmlFor="data_recebimento">Data de Recebimento:</label>
                <input
                    type="datetime-local" // Para incluir hora e data
                    id="data_recebimento"
                    name="data_recebimento"
                    value={formData.data_recebimento}
                    onChange={handleChange}
                />

                <label htmlFor="caminho_arquivo_assinado">Caminho do Arquivo Assinado:</label>
                <input
                    type="text"
                    id="caminho_arquivo_assinado"
                    name="caminho_arquivo_assinado"
                    value={formData.caminho_arquivo_assinado || ''}
                    onChange={handleChange}
                    placeholder="Ex: /uploads/documento_assinado.pdf"
                />

                <label htmlFor="observacoes">Observações:</label>
                <textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes || ''}
                    onChange={handleChange}
                    placeholder="Observações"
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </form>

            {erros.length > 0 && (
                <ul style={{ color: 'red', marginTop: '1rem' }}>
                    {erros.map((err, idx) => (
                        <li key={idx}>{err}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}