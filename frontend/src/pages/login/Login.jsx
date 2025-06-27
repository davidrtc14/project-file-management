import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3000/api'; 

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [erros, setErros] = useState([]);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setErros([]);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        usuario,
        password
      });

      authLogin(res.data.token, res.data.usuario); 
      navigate('/home'); 
    } catch (err) {
      console.error("Erro no login:", err.response?.data || err);
      const resposta = err.response?.data;
      if (resposta?.erros && resposta.erros.length > 0) {
        setErros(resposta.erros);
      } else if (resposta?.erro) {
        setErros([resposta.erro]);
      } else {
        setErros(['Erro inesperado ao fazer login. Tente novamente mais tarde.']);
      }
    }
  }

  return (
    <div className="container">
      <h2>Acesso ao Sistema de Solicitações</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="usuario">Nome de Usuário ou Email:</label>
        <input
          type="text"
          id="usuario"
          name="usuario"
          placeholder="Nome de Usuário ou Email"
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          required
        />
        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>

      <Link to={'/cadastro'} className="link-cadastro">Ainda não tem conta? Cadastre-se</Link> {/* Exemplo de link com classe */}

      {erros.length > 0 && (
        <ul className="error-list">
          {erros.map((erro, idx) => (
            <li key={idx}>{erro}</li>
          ))}
        </ul>
      )}
    </div>
  );
}