const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

// Rota para registrar um novo usuário
router.post('/register', authController.register);

// Rota para login de usuário
router.post('/login', authController.login);

module.exports = router;
