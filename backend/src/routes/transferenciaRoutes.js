const express = require('express');
const router = express.Router();
const transferenciaController = require('../controllers/transferenciaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, transferenciaController.criar);
router.get('/', authMiddleware, transferenciaController.listar);
router.get('/:id', authMiddleware, transferenciaController.buscar);
router.put('/:id', authMiddleware, transferenciaController.atualizar);
router.delete('/:id', authMiddleware,  transferenciaController.excluir);

module.exports = router;