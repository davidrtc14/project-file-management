// src/routes/loginRoutes.js

const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/register', loginController.register); // Recebe 'usuario', 'password', 'nome', 'setor_id'
router.post('/login', loginController.login);       // Recebe 'usuario', 'password'

module.exports = router;