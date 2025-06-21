const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // <-- Adicione bcryptjs para hashing de senhas
const Login = require('../models/loginModel'); 

// Controlador para registro de novos usuários
exports.register = async (req, res) => {
    // req.db está disponível aqui graças ao dbMiddleware
    const db = req.db; 
    
    // O modelo Login precisa receber o pool de conexão
    const login = new Login(req.body, db); 
    await login.register();

    if (login.errors.length > 0) {
        return res.status(400).json({ erros: login.errors });
    }

    if (!login.user || !login.user.id || !login.user.usuario) { // Mudado de email para usuario
        return res.status(500).json({ erro: 'Erro interno: Usuário não retornado após registro.' });
    }

    // Gerar token JWT (Payload deve incluir o ID do usuário e os papéis para autorização futura)
    // Supondo que login.user.roles seja um array de nomes de papéis (ex: ['requerente'])
    const token = jwt.sign(
        { 
            id: login.user.id, 
            usuario: login.user.usuario, // Mudado de email para usuario
            roles: login.user.roles, // <-- Inclua os papéis no token
            nome: login.user.nome
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' } 
    );
    
    res.status(201).json({
        mensagem: 'Usuário criado e logado com sucesso!',
        usuario: {
            id: login.user.id,
            usuario: login.user.usuario, // Mudado de email para usuario
            nome: login.user.nome,       // Inclua o nome para o frontend
            roles: login.user.roles      // Inclua os papéis para o frontend
        },
        token: token
    });
};

// Controlador para login de usuários existentes
exports.login = async (req, res) => {
    const db = req.db; // Acesse o pool de conexão
    const login = new Login(req.body, db); 
    await login.login();

    if (login.errors.length > 0) {
        return res.status(400).json({ erros: login.errors });
    }

    if (!login.user) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' }); // Se o login.user não for setado, o login falhou
    }

    // Gerar token JWT com informações do usuário e papéis
    const token = jwt.sign(
        { 
            id: login.user.id, 
            usuario: login.user.usuario, 
            roles: login.user.roles,
            nome: login.user.nome
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({ 
        mensagem: 'Login bem-sucedido!', 
        usuario: {
            id: login.user.id,
            usuario: login.user.usuario,
            nome: login.user.nome,
            roles: login.user.roles
        },
        token 
    });
};