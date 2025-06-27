// src/routes/dataRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware'); // Importe o middleware de papéis
const pdfController = require('../controllers/pdfController');

// Rota para listar todos os setores (acessível para não logados para o cadastro)
router.get('/setores', async (req, res) => {
    const db = req.db;
    try {
        const [setores] = await db.execute('SELECT id, nome FROM setores ORDER BY nome');
        res.status(200).json(setores);
    } catch (err) {
        console.error('Erro ao listar setores:', err);
        res.status(500).json({ erro: 'Erro ao buscar lista de setores.' });
    }
});

// Rota para listar todos os usuários (agora acessível para 'administrador' E 'funcionario')
router.get('/usuarios', authMiddleware, checkRole(['administrador', 'funcionario']), async (req, res) => { // <-- CORREÇÃO AQUI!
    const db = req.db;
    try {
        const [usuarios] = await db.execute('SELECT id, usuario, nome FROM usuarios ORDER BY nome');
        res.status(200).json(usuarios);
    } catch (err) {
        console.error('Erro ao listar usuários:', err);
        res.status(500).json({ erro: 'Erro ao buscar lista de usuários.' });
    }
});

// Rotas de geração de PDF
router.get('/solicitacoes/:id/relatorio-pdf', authMiddleware, pdfController.gerarRecibo);
router.get('/solicitacoes/relatorio-geral-pdf', authMiddleware, checkRole(['administrador']), pdfController.gerarPlanilhaGeral);

module.exports = router;