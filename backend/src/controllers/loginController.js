const jwt = require('jsonwebtoken');
const Login = require('../models/loginModel'); 

// Controlador para registro de novos usuários
exports.register = async (req, res) => {
    const db = req.db; 
    
    // O model Login agora espera 'usuario', 'password', 'nome' e 'setor_id'
    // E também o 'action' para validação condicional dentro do model
    const login = new Login({ ...req.body, action: 'register' }, db); 
    await login.register();

    if (login.errors.length > 0) {
        return res.status(400).json({ erros: login.errors });
    }

    if (!login.user || !login.user.id || !login.user.usuario) {
        return res.status(500).json({ erro: 'Erro interno: Usuário não retornado após registro.' });
    }

    // Gerar token JWT
    const token = jwt.sign(
        { 
            id: login.user.id, 
            usuario: login.user.usuario, 
            nome: login.user.nome,
            setor_id: login.user.setor_id, // Inclua o setor_id no payload do JWT
            roles: login.user.roles 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' } 
    );
    
    res.status(201).json({
        mensagem: 'Usuário criado e logado com sucesso!',
        usuario: {
            id: login.user.id,
            usuario: login.user.usuario,
            nome: login.user.nome,       
            setor_id: login.user.setor_id, // Inclua o setor_id na resposta direta
            roles: login.user.roles      
        },
        token: token
    });
};

// Controlador para login de usuários existentes
exports.login = async (req, res) => {
    const db = req.db; 
    // Para o login, o 'action' não é estritamente necessário para o model, mas é boa prática
    const login = new Login({ ...req.body, action: 'login' }, db); 
    await login.login();

    if (login.errors.length > 0) {
        // Se o login.errors tiver algo, é um erro de credenciais inválidas ou usuário não encontrado
        return res.status(401).json({ erros: login.errors });
    }

    if (!login.user) {
        // Erro genérico caso o model não retorne o user por algum motivo
        return res.status(401).json({ erro: 'Credenciais inválidas.' }); 
    }

    // Gerar token JWT com informações do usuário e papéis
    const token = jwt.sign(
        { 
            id: login.user.id, 
            usuario: login.user.usuario, 
            nome: login.user.nome,
            setor_id: login.user.setor_id, // Inclua o setor_id no payload do JWT
            roles: login.user.roles 
        },
        process.env.JWT_SECRET
    );

    res.status(200).json({ 
        mensagem: 'Login bem-sucedido!', 
        usuario: {
            id: login.user.id,
            usuario: login.user.usuario,
            nome: login.user.nome,
            setor_id: login.user.setor_id, // Inclua o setor_id na resposta direta
            roles: login.user.roles
        },
        token 
    });
};