import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Cadastro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erros, setErros] = useState([]);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErros([]);
    setSuccess('');

    try {
      const res = await axios.post('http://localhost:3000/api/auth/register', {
        email,
        password
      });
      localStorage.setItem('token', res.data.token);
      setSuccess('Cadastro realizado com sucesso!');
    } catch (err) {
      const resposta = err.response?.data;
      if (resposta?.erros) {
        setErros(resposta.erros);
      } else {
        setErros(['Falha ao realizar o cadastro.']);
      }
    }
  }

  return (
    <div>
      <h2>Cadastro no Sistema de Solicitações</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Seu email institucional"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Crie uma senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Cadastrar</button>
      </form>

      {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}

      {erros.length > 0 && (
        <ul style={{ color: 'red', marginTop: '1rem' }}>
          {erros.map((erro, idx) => (
            <li key={idx}>{erro}</li>
          ))}
        </ul>
      )}

      {success ? (
        <Link to="/home" style={{ display: 'block', marginTop: '1rem' }}>
          Ir para a Página Inicial
        </Link>
      ) : (
        <Link to="/login" style={{ display: 'block', marginTop: '1rem' }}>
          Já tem conta? Faça login
        </Link>
      )}
    </div>
  );
}
