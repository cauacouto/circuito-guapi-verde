const { getDb } = require('../database/db');

const pontosController = {
  listar(req, res) {
    try {
      const db = getDb();
      const { tipo, dificuldade, busca } = req.query;
      let sql = `SELECT p.*, ROUND(AVG(a.nota),1) as media_avaliacoes, COUNT(a.id) as total_avaliacoes
        FROM pontos_turisticos p LEFT JOIN avaliacoes a ON a.ponto_id = p.id
        WHERE p.ativo = 1`;
      const params = [];
      if (tipo)       { sql += ` AND p.tipo = ?`;                          params.push(tipo); }
      if (dificuldade){ sql += ` AND p.dificuldade = ?`;                   params.push(dificuldade); }
      if (busca)      { sql += ` AND (p.nome LIKE ? OR p.descricao LIKE ?)`; params.push(`%${busca}%`,`%${busca}%`); }
      sql += ` GROUP BY p.id ORDER BY media_avaliacoes DESC, p.nome ASC`;
      const pontos = db.queryAll(sql, params);
      res.json({ sucesso: true, dados: pontos, total: pontos.length });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  buscarPorId(req, res) {
    try {
      const db = getDb();
      const ponto = db.queryOne(
        `SELECT p.*, ROUND(AVG(a.nota),1) as media_avaliacoes, COUNT(a.id) as total_avaliacoes
         FROM pontos_turisticos p LEFT JOIN avaliacoes a ON a.ponto_id = p.id
         WHERE p.id = ? AND p.ativo = 1 GROUP BY p.id`, [req.params.id]);
      if (!ponto) return res.status(404).json({ sucesso: false, erro: 'Ponto não encontrado.' });
      res.json({ sucesso: true, dados: ponto });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  criar(req, res) {
    try {
      const db = getDb();
      const { nome, descricao, tipo, dificuldade, latitude, longitude, endereco, foto_url } = req.body;
      if (!nome || !tipo) return res.status(400).json({ sucesso: false, erro: 'Nome e tipo são obrigatórios.' });
      const tiposValidos = ['trilha','cachoeira','mirante','camping','outro'];
      if (!tiposValidos.includes(tipo)) return res.status(400).json({ sucesso: false, erro: 'Tipo inválido.' });
      const result = db.run(
        `INSERT INTO pontos_turisticos (nome,descricao,tipo,dificuldade,latitude,longitude,endereco,foto_url) VALUES (?,?,?,?,?,?,?,?)`,
        [nome, descricao||null, tipo, dificuldade||null, latitude||null, longitude||null, endereco||null, foto_url||null]);
      const novo = db.queryOne('SELECT * FROM pontos_turisticos WHERE id = ?', [result.lastInsertRowid]);
      res.status(201).json({ sucesso: true, dados: novo, mensagem: 'Ponto cadastrado com sucesso!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  atualizar(req, res) {
    try {
      const db = getDb();
      const ponto = db.queryOne('SELECT * FROM pontos_turisticos WHERE id = ?', [req.params.id]);
      if (!ponto) return res.status(404).json({ sucesso: false, erro: 'Ponto não encontrado.' });
      const { nome, descricao, tipo, dificuldade, latitude, longitude, endereco, foto_url } = req.body;
      db.run(`UPDATE pontos_turisticos SET
        nome=COALESCE(?,nome), descricao=COALESCE(?,descricao), tipo=COALESCE(?,tipo),
        dificuldade=COALESCE(?,dificuldade), latitude=COALESCE(?,latitude), longitude=COALESCE(?,longitude),
        endereco=COALESCE(?,endereco), foto_url=COALESCE(?,foto_url) WHERE id=?`,
        [nome||null, descricao||null, tipo||null, dificuldade||null, latitude||null, longitude||null, endereco||null, foto_url||null, req.params.id]);
      const atualizado = db.queryOne('SELECT * FROM pontos_turisticos WHERE id = ?', [req.params.id]);
      res.json({ sucesso: true, dados: atualizado, mensagem: 'Ponto atualizado com sucesso!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  deletar(req, res) {
    try {
      const db = getDb();
      const ponto = db.queryOne('SELECT * FROM pontos_turisticos WHERE id = ?', [req.params.id]);
      if (!ponto) return res.status(404).json({ sucesso: false, erro: 'Ponto não encontrado.' });
      db.run('UPDATE pontos_turisticos SET ativo = 0 WHERE id = ?', [req.params.id]);
      res.json({ sucesso: true, mensagem: 'Ponto removido com sucesso!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  }
};
module.exports = pontosController;
