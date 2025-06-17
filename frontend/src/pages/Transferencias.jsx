import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Transferencias() {
  const [transferencias, setTransferencias] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:3000/api/transferencias', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTransferencias(res.data))
      .catch((err) => setError(err.response?.data?.erro || 'Erro ao buscar transferências'));
  }, []);

  const formatarData = (dataString) => {
    if (!dataString) return 'Data indisponível';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

   const handleDelete = async (id) => {
    setError(''); // Limpa erros anteriores
    const token = localStorage.getItem('token');

    // CONFIRMAÇÃO: Pergunta ao usuário antes de deletar
    if (window.confirm('Tem certeza que deseja deletar esta transferência? Esta ação não pode ser desfeita.')) {
      try {
        await axios.delete(`http://localhost:3000/api/transferencias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Se a exclusão no backend for bem-sucedida, atualiza a lista no frontend
        setTransferencias(transferencias.filter(t => t.id !== id));
        alert('Transferência deletada com sucesso!');
      } catch (err) {
        setError(err.response?.data?.erro || 'Erro ao deletar transferência');
      }
    }
  }

  return (
    <div>
      <h2>Transferências</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {transferencias.map((t) => (
          <li key={t.id}>
            {t.nome_arquivo} - {t.setor_remetente} para {t.setor_destinatario} - {' '}
            {formatarData(t.criado_em)}
            {' | '}
            <button><Link to={`/transferencias/${t.id}`}>Ver Detalhes</Link></button>
            {' | '}
            <button><Link to={`/transferencias/${t.id}/editar`}>Editar</Link></button>
            {' | '}
            <button onClick={() => handleDelete(t.id)}>
              Deletar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}