const express = require('express');
const router = express.Router();
const solicitacaoController = require('../controllers/transferenciaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, solicitacaoController.criar);
router.get('/', authMiddleware, solicitacaoController.listar);
router.get('/:id', authMiddleware, solicitacaoController.buscar);
router.put('/:id', authMiddleware, solicitacaoController.atualizar);
router.delete('/:id', authMiddleware,  solicitacaoController.excluir);

module.exports = router;