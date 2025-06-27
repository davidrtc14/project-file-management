// src/routes/solicitacoesRoutes.js

const express = require('express');
const router = express.Router();
const solicitacaoController = require('../controllers/solicitacaoController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const upload = require('../config/multerConfig'); // <-- Importar o multer configurado

// Rotas para as operações de Solicitações (CRUD)

// Criar Solicitação: Qualquer usuário autenticado (admin ou funcionario)
router.post('/', authMiddleware, checkRole(['administrador', 'funcionario']), solicitacaoController.criar);

// Listar Solicitações: Qualquer usuário autenticado (admin vê todas, funcionario vê por setor)
// A lógica de filtro está dentro do solicitacaoController.listar
router.get('/', authMiddleware, solicitacaoController.listar); 

// Buscar Solicitação por ID: Qualquer usuário autenticado (admin vê qualquer, funcionario vê do seu setor ou própria)
// A lógica de filtro está dentro do solicitacaoController.buscar
router.get('/:id', authMiddleware, solicitacaoController.buscar);

// Atualizar Solicitação: Qualquer usuário autenticado (admin ou funcionario)
router.put('/:id', authMiddleware, checkRole(['administrador', 'funcionario']), solicitacaoController.atualizar);
router.put('/:id/anexar-relatorio', authMiddleware, upload.single('file'), solicitacaoController.anexarRelatorioAssinado);

// Excluir Solicitação: Apenas Administradores
router.delete('/:id', authMiddleware, checkRole(['administrador']), solicitacaoController.excluir);

module.exports = router;