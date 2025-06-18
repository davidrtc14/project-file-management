import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function SolicitacaoForm() {
  const [form, setForm] = useState({
    nome_documento: '',
    descricao: '',
    quantidade: '',
    setor_remetente: '',
    setor_destinatario: '',
    requerente: '',
    responsavel_setor: '',
    data_solicitacao: '',
    observacoes: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const handleAuthError = (err) => {
    if (err.response && err.response.status === 403) {
      console.log("Token expirado ou inválido. Redirecionando para login.");
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      setError(err.response?.data?.erro || 'Ocorreu um erro.');
    }
  };

  useEffect(() => {
    if (id) {
      const token = localStorage.getItem('token');
      axios
        .get(`http://localhost:3000/api/solicitacoes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const dataBD = res.data.data_transferencia;
          const dataFormatada = dataBD ? new Date(dataBD).toISOString().split('T')[0] : '';
          setForm({ ...res.data, data_transferencia: dataFormatada });
        })
        .catch(handleAuthError);
    }
  }, [id, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'quantidade' ? Number(value) : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      if (id) {
        await axios.put(`http://localhost:3000/api/solicitacoes/${id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:3000/api/solicitacoes', form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/solicitacoes');
    } catch (err) {
      handleAuthError(err);
    }
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
          value={form.nome_documento}
          onChange={handleChange}
          placeholder="Nome do documento"
          required
        />

        <label htmlFor="descricao">Descrição:</label>
        <textarea
          id="descricao"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          placeholder="Descrição"
        />

        <label htmlFor="quantidade">Quantidade:</label>
        <select
          id="quantidade"
          name="quantidade"
          value={form.quantidade}
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

        <label htmlFor="setor_remetente">Setor Remetente:</label>
        <select
          id="setor_remetente"
          name="setor_remetente"
          value={form.setor_remetente}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um setor</option>
          <option value="geee">GEEE</option>
          <option value="geaf">GEAF</option>
          <option value="geret">GERET</option>
          <option value="gesan">GESAN</option>
        </select>

        <label htmlFor="setor_destinatario">Setor Destinatário:</label>
        <select
          id="setor_destinatario"
          name="setor_destinatario"
          value={form.setor_destinatario}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um setor</option>
          <option value="geee">GEEE</option>
          <option value="geaf">GEAF</option>
          <option value="geret">GERET</option>
          <option value="gesan">GESAN</option>
        </select>

        <label htmlFor="requerente">Requerente:</label>
        <input
          type="text"
          id="requerente"
          name="requerente"
          value={form.requerente}
          onChange={handleChange}
          placeholder="Requerente"
          required
        />

        <label htmlFor="responsavel_setor">Responsável do Setor:</label>
        <input
          type="text"
          id="responsavel_setor"
          name="responsavel_setor"
          value={form.responsavel_setor}
          onChange={handleChange}
          placeholder="Responsável do Setor"
          required
        />

        <label htmlFor="data_transferencia">Data da Solicitação:</label>
        <input
          type="date"
          id="data_transferencia"
          name="data_transferencia"
          value={form.data_transferencia}
          onChange={handleChange}
          required
        />

        <label htmlFor="observacoes">Observações:</label>
        <textarea
          id="observacoes"
          name="observacoes"
          value={form.observacoes}
          onChange={handleChange}
          placeholder="Observações"
        />

        <button type="submit">Salvar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
