const usuariosService = require('../services/usuariosService');

const usuariosController = {
  listar(req, res) {
    try {
      const usuarios = usuariosService.listar();
      res.json({ sucesso: true, dados: usuarios, total: usuarios.length });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  buscarPorId(req, res) {
    try {
      const u = usuariosService.buscarPorId(req.params.id);
      res.json({ sucesso: true, dados: u });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  criar(req, res) {
    try {
      const novo = usuariosService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: novo, mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  atualizar(req, res) {
    try {
      const atualizado = usuariosService.atualizar(req.params.id, req.body);
      res.json({ sucesso: true, dados: atualizado, mensagem: 'Usuário atualizado!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  deletar(req, res) {
    try {
      usuariosService.deletar(req.params.id);
      res.json({ sucesso: true, mensagem: 'Usuário removido com sucesso!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  login(req, res) {
    try {
      const pub = usuariosService.login(req.body);
      res.json({ sucesso: true, dados: pub, mensagem: 'Login realizado com sucesso!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  }
};
module.exports = usuariosController;
