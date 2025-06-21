const express = require('express');
const router = express.Router();
const solicitacaoController = require('../controllers/solicitacaoController');
const authMiddleware = require('../middlewares/authMiddleware'); 
const checkRole = require('../middlewares/roleMiddleware');     // <-- Importe o middleware de papéis aqui

// Rotas para as operações de Solicitações:

// Criar Solicitação:
// Apenas usuários logados que sejam 'administrador' OU 'requerente' podem criar.
router.post('/', authMiddleware, checkRole(['administrador', 'requerente']), solicitacaoController.criar);

// Listar Solicitações:
// Usuários 'administrador' veem todas.
// Usuários 'requerente' veem apenas as suas (lógica de filtro no controller).
// Aqui, apenas authMiddleware é necessário. A lógica de permissão mais fina (quem vê o quê)
// está DENTRO do solicitacaoController.listar.
router.get('/', authMiddleware, solicitacaoController.listar); 

// Buscar Solicitação por ID:
// Usuários 'administrador' veem qualquer uma.
// Usuários 'requerente' veem apenas as suas (lógica de filtro no controller).
// authMiddleware é suficiente. A lógica de permissão mais fina está no solicitacaoController.buscar.
router.get('/:id', authMiddleware, solicitacaoController.buscar);

// Atualizar Solicitação:
// Apenas usuários com papel 'administrador' podem atualizar.
router.put('/:id', authMiddleware, checkRole(['administrador']), solicitacaoController.atualizar);

// Excluir Solicitação:
// Apenas usuários com papel 'administrador' podem excluir.
router.delete('/:id', authMiddleware, checkRole(['administrador']), solicitacaoController.excluir);

module.exports = router;