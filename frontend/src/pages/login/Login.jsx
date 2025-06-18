import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erros, setErros] = useState([]);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErros([]);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/home');
    } catch (err) {
      const resposta = err.response?.data;
      if (resposta?.erros) {
        setErros(resposta.erros);
      } else {
        setErros(['Erro ao fazer login.']);
      }
    }
  }

  return (
    <div>
      <h2>Acesso ao Sistema de Solicitações</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
