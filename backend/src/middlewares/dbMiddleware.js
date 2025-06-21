// src/middlewares/dbMiddleware.js

const db = require('../db/db'); // Importa o objeto que contém a função getPool

const dbMiddleware = (req, res, next) => {
    try {
        req.db = db.getPool(); // Obtém o pool de conexões
        next();
    } catch (error) {
        console.error('Erro no middleware de DB:', error.message);
        res.status(500).send('Erro interno do servidor: Banco de dados não disponível.');
    }
};

module.exports = dbMiddleware;