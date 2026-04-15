const pontosService = require('../services/pontosService');

const pontosController = {
  listar(req, res) {
    try {
      const pontos = pontosService.listar(req.query);
      res.json({ sucesso: true, dados: pontos, total: pontos.length });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  buscarPorId(req, res) {
    try {
      const ponto = pontosService.buscarPorId(req.params.id);
      res.json({ sucesso: true, dados: ponto });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  criar(req, res) {
    try {
      const novo = pontosService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: novo, mensagem: 'Ponto turistico cadastrado com sucesso!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  atualizar(req, res) {
    try {
      const atualizado = pontosService.atualizar(req.params.id, req.body);
      res.json({ sucesso: true, dados: atualizado, mensagem: 'Ponto turistico atualizado com sucesso!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  deletar(req, res) {
    try {
      pontosService.deletar(req.params.id);
      res.json({ sucesso: true, mensagem: 'Ponto turistico removido com sucesso!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  }
};
module.exports = pontosController;
