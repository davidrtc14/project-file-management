// src/middlewares/roleMiddleware.js

const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        // req.user deve ter sido populado pelo authMiddleware
        if (!req.user || !req.user.roles) {
            // Isso geralmente significa que authMiddleware não foi executado ou falhou
            return res.status(401).json({ erro: 'Autenticação necessária.' });
        }

        const userRoles = req.user.roles; // Array de papéis do usuário logado (ex: ['requerente', 'administrador'])

        // Verifica se o usuário possui PELO MENOS UM dos papéis requeridos para a rota
        const hasPermission = userRoles.some(role => requiredRoles.includes(role));

        if (hasPermission) {
            next(); // O usuário tem a permissão necessária, continua para o próximo middleware/controller
        } else {
            return res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente para esta ação.' });
        }
    };
};

module.exports = checkRole;