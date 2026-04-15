const avaliacoesService = require('../services/avaliacoesService');

const avaliacoesController = {
  listar(req, res) {
    try {
      const avs = avaliacoesService.listar();
      res.json({ sucesso: true, dados: avs, total: avs.length });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  buscarPorId(req, res) {
    try {
      const av = avaliacoesService.buscarPorId(req.params.id);
      res.json({ sucesso: true, dados: av });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  porPonto(req, res) {
    try {
      const { ponto, estatisticas, avaliacoes } = avaliacoesService.porPonto(req.params.pontoId);
      res.json({
        sucesso: true,
        ponto,
        estatisticas,
        dados: avaliacoes,
        total: avaliacoes.length
      });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  criar(req, res) {
    try {
      const nova = avaliacoesService.criar(req.body);
      res.status(201).json({ sucesso: true, dados: nova, mensagem: 'Avaliação registrada com sucesso!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  atualizar(req, res) {
    try {
      const atualizada = avaliacoesService.atualizar(req.params.id, req.body);
      res.json({ sucesso: true, dados: atualizada, mensagem: 'Avaliação atualizada!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  },

  deletar(req, res) {
    try {
      avaliacoesService.deletar(req.params.id);
      res.json({ sucesso: true, mensagem: 'Avaliação removida com sucesso!' });
    } catch (err) {
      res.status(err.status || 500).json({ sucesso: false, erro: err.message });
    }
  }
};
module.exports = avaliacoesController;
