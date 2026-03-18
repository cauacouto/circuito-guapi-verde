const express = require('express');
const router = express.Router();
const pontosController = require('../controllers/pontosController');
const usuariosController = require('../controllers/usuariosController');
const avaliacoesController = require('../controllers/avaliacoesController');

// Pontos Turísticos
router.get('/pontos', pontosController.listar);
router.get('/pontos/:id', pontosController.buscarPorId);
router.post('/pontos', pontosController.criar);
router.put('/pontos/:id', pontosController.atualizar);
router.delete('/pontos/:id', pontosController.deletar);

// Usuários
router.get('/usuarios', usuariosController.listar);
router.get('/usuarios/:id', usuariosController.buscarPorId);
router.post('/usuarios', usuariosController.criar);
router.put('/usuarios/:id', usuariosController.atualizar);
router.delete('/usuarios/:id', usuariosController.deletar);
router.post('/usuarios/login', usuariosController.login);

// Avaliações
router.get('/avaliacoes', avaliacoesController.listar);
router.get('/avaliacoes/:id', avaliacoesController.buscarPorId);
router.get('/avaliacoes/ponto/:pontoId', avaliacoesController.porPonto);
router.post('/avaliacoes', avaliacoesController.criar);
router.put('/avaliacoes/:id', avaliacoesController.atualizar);
router.delete('/avaliacoes/:id', avaliacoesController.deletar);

module.exports = router;
