// src/pages/login/Login.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importe o hook de autenticação

export default function Login() {
  const [usuario, setUsuario] = useState(''); // Mude de email para usuario
  const [password, setPassword] = useState('');
  const [erros, setErros] = useState([]);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // Renomeie para evitar conflito com a função de login do contexto

  async function handleSubmit(e) {
    e.preventDefault();
    setErros([]); // Limpa erros anteriores
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        usuario, // Envie 'usuario' em vez de 'email'
        password
      });

      // Se o login for bem-sucedido, chame a função login do AuthContext
      // res.data.usuario deve conter { id, usuario, nome, roles }
      authLogin(res.data.token, res.data.usuario); 
      
      navigate('/home'); // Redireciona para a página inicial
    } catch (err) {
      console.error("Erro no login:", err.response?.data || err);
      const resposta = err.response?.data;
      if (resposta?.erros && resposta.erros.length > 0) {
        setErros(resposta.erros);
      } else if (resposta?.erro) { // Se o backend retornar um único erro como { erro: '...' }
        setErros([resposta.erro]);
      } else {
        setErros(['Erro inesperado ao fazer login. Tente novamente mais tarde.']);
      }
    }
  }

  return (
    <div>
      <h2>Acesso ao Sistema de Solicitações</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text" // Pode ser 'email' ou 'text' dependendo se 'usuario' é sempre um email
          placeholder="Nome de Usuário ou Email" // Texto do placeholder
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>

      <Link to={'/cadastro'}>Ainda não tem conta? Cadastre-se</Link>

      {erros.length > 0 && (
        <ul style={{ color: 'red', marginTop: '1rem' }}>
          {erros.map((erro, idx) => (
            <li key={idx}>{erro}</li>
          ))}
        </ul>
      )}
    </div>
  );
}