// src/pages/login/Cadastro.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext'; // Importe o hook de autenticação

export default function Cadastro() {
  const [usuario, setUsuario] = useState(''); // Mudou de email para usuario
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState(''); // Novo campo para o nome
  const [erros, setErros] = useState([]);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // Obtém a função de login do contexto

  async function handleSubmit(e) {
    e.preventDefault();
    setErros([]);
    setSuccess('');

    try {
      // Envie 'usuario' (que pode ser email), 'password' e 'nome'
      const res = await axios.post('http://localhost:3000/api/auth/register', {
        usuario,
        password,
        nome // Inclua o nome na requisição
      });

      // Se o cadastro for bem-sucedido, chame a função login do AuthContext
      // res.data.usuario deve conter { id, usuario, nome, roles }
      authLogin(res.data.token, res.data.usuario); 
      
      setSuccess('Cadastro realizado com sucesso! Você será redirecionado para a página inicial.');
      // Redireciona após um pequeno delay para a mensagem de sucesso ser vista
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
    <div>
      <h2>Cadastro no Sistema de Solicitações</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text" // Pode ser 'email' ou 'text'
          placeholder="Nome de Usuário ou Email" 
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Crie uma senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input // Novo input para o nome
          type="text"
          placeholder="Seu nome completo"
          value={nome}
          onChange={e => setNome(e.target.value)}
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

      {/* Remove o Link condicional, o redirecionamento é feito via navigate */}
      <Link to="/login" style={{ display: 'block', marginTop: '1rem' }}>
        Já tem conta? Faça login
      </Link>
    </div>
  );
}