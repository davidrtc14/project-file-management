// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Acessa o cabeçalho 'Authorization'
    const authHeader = req.headers.authorization;

    // 1. Verifica se o cabeçalho 'Authorization' existe e começa com 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Token não fornecido ou formato inválido (esperado: Bearer <token>).' });
    }

    // Extrai o token da string "Bearer <token>"
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verifica o token usando a chave secreta
        // Se o token for válido, 'decoded' conterá o payload do token (id, usuario, roles)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Anexa as informações decodificadas do usuário ao objeto 'req'
        // Isso tornará 'req.user.id', 'req.user.usuario' e 'req.user.roles' disponíveis
        // nos controllers e middlewares subsequentes.
        req.user = decoded; 

        // 4. Continua para o próximo middleware ou para a função do controller
        next(); 

    } catch (err) {
        // Captura e trata diferentes tipos de erros do JWT
        if (err.name === 'TokenExpiredError') {
            // Token expirou
            return res.status(401).json({ erro: 'Token de autenticação expirado. Por favor, faça login novamente.' });
        } else if (err.name === 'JsonWebTokenError') {
            // Token inválido (assinatura, formato, etc.)
            return res.status(401).json({ erro: 'Token de autenticação inválido.' });
        } else {
            // Outros erros inesperados
            console.error('Erro desconhecido na verificação do token:', err);
            return res.status(500).json({ erro: 'Erro interno do servidor ao autenticar.' });
        }
    }
};