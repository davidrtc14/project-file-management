const jwt = require('jsonwebtoken');
const Login = require('../models/loginModel');

exports.register = async (req, res) => {
    const login = new Login(req.body);
    await login.register();

    if (login.errors.length > 0) {
        return res.status(400).json({ erros: login.errors });
    }

    res.status(201).json({ mensagem: 'Usuário criado com sucesso!', usuario: login.user });
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
        process.env.JWT_SECRET, // você vai definir isso no .env
        { expiresIn: '1h' }
    );

    res.status(200).json({ mensagem: 'Login bem-sucedido!', token });
};
