import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // Importe 'Link' para o botão de voltar

export default function VerTransferencia() {
  const [transferencia, setTransferencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams(); // Hook para pegar o ID da URL (ex: "123" de /transferencias/123)

  useEffect(() => {
    // Só faz a requisição se um ID for encontrado na URL
    if (id) {
      const token = localStorage.getItem('token');
      setLoading(true); // Indica que os dados estão sendo carregados
      axios
        .get(`http://localhost:3000/api/transferencias/${id}`, { // Requisição ao backend pelo ID
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setTransferencia(res.data); // Define os dados da transferência no estado
          setLoading(false);         // Finaliza o estado de carregamento
        })
        .catch((err) => {
          setError(err.response?.data?.erro || 'Erro ao carregar detalhes da transferência.');
          setLoading(false); // Finaliza o estado de carregamento, mas com erro
        });
    }
  }, [id]); // O efeito é executado novamente se o 'id' na URL mudar

  // Função para formatar o timestamp de 'criado_em' (com data e hora)
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

  // Função para formatar a data simples (DD/MM/AAAA) para 'data_transferencia'
  const formatarApenasData = (dataString) => {
    if (!dataString) return 'Não disponível';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR'); // Formato padrão do local (DD/MM/AAAA)
  };


  // --- Renderização Condicional da UI ---
  // Exibe mensagem de carregamento
  if (loading) {
    return (
      <div>
        <h2>Detalhes da Transferência</h2>
        <p>Carregando detalhes da transferência...</p>
      </div>
    );
  }

  // Exibe mensagem de erro
  if (error) {
    return (
      <div>
        <h2>Detalhes da Transferência</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/transferencias">Voltar para a Lista</Link>
      </div>
    );
  }

  // Exibe mensagem se não houver dados (ex: ID inválido que retorna vazio do backend)
  if (!transferencia) {
    return (
      <div>
        <h2>Detalhes da Transferência</h2>
        <p>Nenhuma transferência encontrada para o ID: {id}</p>
        <Link to="/transferencias">Voltar para a Lista</Link>
      </div>
    );
  }

  // --- Renderização dos Detalhes da Transferência (quando os dados estão carregados) ---
  return (
    <div>
      <h2>Detalhes da Transferência: {transferencia.nome_arquivo}</h2>
      
      <p><strong>Nome do Arquivo:</strong> {transferencia.nome_arquivo}</p>
      <p><strong>Descrição:</strong> {transferencia.descricao || 'N/A'}</p>
      <p><strong>Setor Remetente:</strong> {transferencia.setor_remetente}</p>
      <p><strong>Setor Destinatário:</strong> {transferencia.setor_destinatario}</p>
      <p><strong>Responsável:</strong> {transferencia.responsavel}</p>
      <p><strong>Data da Transferência:</strong> {formatarApenasData(transferencia.data_transferencia)}</p>
      <p><strong>Caminho do Arquivo:</strong> {transferencia.caminho_arquivo || 'N/A'}</p>
      <p><strong>Registrado em:</strong> {formatarDataCompleta(transferencia.criado_em)}</p>

      {/* Botões de Ação */}
      <div style={{ marginTop: '20px' }}>
        <Link to={`/transferencias/${transferencia.id}/editar`} style={{ marginRight: '10px' }}>Editar Transferência</Link>
        <Link to="/transferencias">Voltar para a Lista</Link>
      </div>
    </div>
  );
}