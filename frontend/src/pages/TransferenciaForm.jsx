import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function TransferenciaForm() {
  const [form, setForm] = useState({
    nome_arquivo: '',
    descricao: '',
    setor_remetente: '',
    setor_destinatario: '',
    responsavel: '',
    data_transferencia: '',
    caminho_arquivo: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const token = localStorage.getItem('token');
      axios
        .get(`http://localhost:3000/api/transferencias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setForm(res.data))
        .catch((err) => setError(err.response?.data?.erro || 'Erro ao carregar transferência'));
    }
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      if (id) {
        await axios.put(`http://localhost:3000/api/transferencias/${id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:3000/api/transferencias', form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/transferencias');
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao salvar transferência');
    }
  }

  return (
    <div>
      <h2>{id ? 'Editar' : 'Nova'} Transferência</h2>
      <form onSubmit={handleSubmit}>
        <input name="nome_arquivo" value={form.nome_arquivo} onChange={handleChange} placeholder="Nome do arquivo" required />
        <input name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição" />
        <input name="setor_remetente" value={form.setor_remetente} onChange={handleChange} placeholder="Setor Remetente" required />
        <input name="setor_destinatario" value={form.setor_destinatario} onChange={handleChange} placeholder="Setor Destinatário" required />
        <input name="responsavel" value={form.responsavel} onChange={handleChange} placeholder="Responsável" required />
        <input
          type="date"
          name="data_transferencia"
          value={form.data_transferencia}
          onChange={handleChange}
          required
        />
        <input name="caminho_arquivo" value={form.caminho_arquivo} onChange={handleChange} placeholder="Caminho do arquivo" />
        <button type="submit">Salvar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
