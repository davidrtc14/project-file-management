import React, {useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();


async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/api/auth/register', { 
        email, 
        password 
    });
      setSuccess('Usuário cadastrado com sucesso!')
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao fazer login');
    }
  }

   return (
        <div>
            <h2>Cadastre-se</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit">Entrar</button>
            </form>
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}