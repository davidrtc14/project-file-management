import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3000/api'; 

export default function Cadastro() {
  const [usuario, setUsuario] = useState(''); 
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [setorId, setSetorId] = useState(''); 
  const [setores, setSetores] = useState([]);
  const [erros, setErros] = useState([]);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login: authLogin, token } = useAuth(); 

  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {}; 
        const res = await axios.get(`${API_BASE_URL}/setores`, { headers });
        setSetores(res.data);
      } catch (err) {
        console.error("Erro ao buscar setores para cadastro:", err);
        setErros(['Não foi possível carregar a lista de setores.']);
      }
    };
    fetchSetores();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErros([]);
    setSuccess('');

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        usuario,
        password,
        nome,
        setor_id: Number(setorId),
        action: 'register'
      });

      authLogin(res.data.token, res.data.usuario); 
      
      setSuccess('Cadastro realizado com sucesso! Você será redirecionado para a página inicial.');
      setTimeout(() => {
        navigate('/home'); 
      }, 2000); 

    } catch (err) {
      console.error("Erro no cadastro:", err.response?.data || err);
      const resposta = err.response?.data;
      if (resposta?.erros && resposta.erros.length > 0) {
        setErros(resposta.erros);
      } else if (resposta?.erro) { 
        setErros([resposta.erro]);
      } else {
        setErros(['Falha inesperada ao realizar o cadastro. Tente novamente mais tarde.']);
      }
    }
  }

  return (
    <div className="container">
      <h2>Cadastro no Sistema de Solicitações</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="usuario">Nome de Usuário ou Email:</label>
        <input
          type="text" 
          placeholder="Nome de Usuário ou Email" 
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          required
        />
        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          placeholder="Crie uma senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <label htmlFor="nome">Nome:</label>
        <input
          type="text"
          placeholder="Seu nome completo"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        
        <label htmlFor="setorId">Seu Setor:</label>
        <select
          id="setorId"
          name="setorId"
          value={setorId}
          onChange={e => setSetorId(e.target.value)}
          required
        >
          <option value="">Selecione seu setor</option>
          {setores.map(setor => (
            <option key={setor.id} value={setor.id}>
              {setor.nome}
            </option>
          ))}
        </select>

        <button type="submit">Cadastrar</button>
      

      {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}

      {erros.length > 0 && (
        <ul style={{ color: 'red', marginTop: '1rem' }}>
          {erros.map((erro, idx) => (
            <li key={idx}>{erro}</li>
          ))}
        </ul>
      )}

      <Link to="/login" style={{ display: 'block', marginTop: '1rem' }}>
        Já tem conta? Faça login
      </Link>
      </form>
    </div>
  );
}