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
        .get(`http://localhost:3000/api/transferencias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const dataBD = res.data.data_transferencia;
          let dataFormatadaParaInput = '';
          if (dataBD) {
            dataFormatadaParaInput = new Date(dataBD).toISOString().split('T')[0];
          }
          setForm({ ...res.data, data_transferencia: dataFormatadaParaInput });
        })
        .catch(handleAuthError);
    }
  }, [id, navigate]);

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
      handleAuthError(err);
    }
  }

  return (
    <div>
      <h2>{id ? 'Editar' : 'Nova'} Transferência</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nome_arquivo">Nome do Arquivo:</label>
        <input name="nome_arquivo" value={form.nome_arquivo} onChange={handleChange} placeholder="Nome do arquivo" required />

        <label htmlFor="descricao">Descrição:</label>
        <input name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição" />

        <label htmlFor="setor_remetente">Setor Remetente:</label>
        <select id="setor_remetente" name="setor_remetente" value={form.setor_remetente} onChange={handleChange} required>
          <option value="">Selecione um setor</option>
          <option value="geee">GEEE</option>
          <option value="geaf">GEAF</option>
          <option value="geret">GERET</option>
          <option value="gesan">GESAN</option>
        </select>

        <label htmlFor="setor_destinatario">Setor Destinatário:</label>
        <select id="setor_destinatario" name="setor_destinatario" value={form.setor_destinatario} onChange={handleChange} required>
          <option value="">Selecione um setor</option>
          <option value="geee">GEEE</option>
          <option value="geaf">GEAF</option>
          <option value="geret">GERET</option>
          <option value="gesan">GESAN</option>
        </select>

        <label htmlFor="responsavel">Responsável:</label>
        <input name="responsavel" value={form.responsavel} onChange={handleChange} placeholder="Responsável" required />

        <label htmlFor="data_transferencia">Data da Transferência:</label>
        <input
          type="date"
          name="data_transferencia"
          value={form.data_transferencia}
          onChange={handleChange}
          required
        />
        
        <label htmlFor="caminho_arquivo">Caminho do Arquivo (Opcional):</label>
        <input name="caminho_arquivo" value={form.caminho_arquivo} onChange={handleChange} placeholder="Caminho do arquivo" />

        <button type="submit">Salvar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}