const jwt = require('jsonwebtoken');
const Login = require('../models/loginModel'); 

exports.register = async (req, res) => {
    const login = new Login(req.body);
    await login.register();

    if (login.errors.length > 0) {
        // Se houver erros de validação/criação do usuário
        return res.status(400).json({ erros: login.errors });
    }

    if (!login.user || !login.user.id || !login.user.email) {
        return res.status(500).json({ erro: 'Erro interno: Usuário não retornado após registro.' });
    }

    const token = jwt.sign(
        { id: login.user.id, email: login.user.email }, // Payload do token
        process.env.JWT_SECRET, // Chave secreta para assinar o token
        { expiresIn: '1h' } // Token expira em 1 hora
    );
    


    res.status(201).json({
        mensagem: 'Usuário criado e logado com sucesso!',
        usuario: {
            id: login.user.id,
            email: login.user.email
        },
        token: token
    });
};

exports.login = async (req, res) => {
    const login = new Login(req.body);
    await login.login();

    if (login.errors.length > 0) {
        return res.status(400).json({ erros: login.errors });
    }

    // Gerar token JWT
    const token = jwt.sign(
        { id: login.user.id, email: login.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({ mensagem: 'Login bem-sucedido!', token });
};