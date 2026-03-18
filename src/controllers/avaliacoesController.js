const { getDb } = require('../database/db');

const avaliacoesController = {
  listar(req, res) {
    try {
      const db = getDb();
      const avs = db.queryAll(`SELECT a.*, u.nome as usuario_nome, u.foto_url as usuario_foto,
        p.nome as ponto_nome, p.tipo as ponto_tipo
        FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
        JOIN pontos_turisticos p ON p.id=a.ponto_id ORDER BY a.criado_em DESC`);
      res.json({ sucesso: true, dados: avs, total: avs.length });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  buscarPorId(req, res) {
    try {
      const db = getDb();
      const av = db.queryOne(`SELECT a.*, u.nome as usuario_nome, p.nome as ponto_nome, p.tipo as ponto_tipo
        FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
        JOIN pontos_turisticos p ON p.id=a.ponto_id WHERE a.id=?`, [req.params.id]);
      if (!av) return res.status(404).json({ sucesso: false, erro: 'Avaliação não encontrada.' });
      res.json({ sucesso: true, dados: av });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  porPonto(req, res) {
    try {
      const db = getDb();
      const ponto = db.queryOne('SELECT * FROM pontos_turisticos WHERE id=? AND ativo=1', [req.params.pontoId]);
      if (!ponto) return res.status(404).json({ sucesso: false, erro: 'Ponto não encontrado.' });
      const avs = db.queryAll(`SELECT a.*, u.nome as usuario_nome, u.foto_url as usuario_foto
        FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
        WHERE a.ponto_id=? ORDER BY a.criado_em DESC`, [req.params.pontoId]);
      const allNotas = avs.map(a => a.nota);
      const media = allNotas.length ? (allNotas.reduce((s,n)=>s+n,0)/allNotas.length).toFixed(1) : null;
      res.json({ sucesso: true, ponto: { id: ponto.id, nome: ponto.nome, tipo: ponto.tipo },
        estatisticas: { media, total: avs.length }, dados: avs, total: avs.length });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  criar(req, res) {
    try {
      const db = getDb();
      const { usuario_id, ponto_id, nota, comentario } = req.body;
      if (!usuario_id || !ponto_id || !nota) return res.status(400).json({ sucesso: false, erro: 'usuario_id, ponto_id e nota são obrigatórios.' });
      if (nota < 1 || nota > 5) return res.status(400).json({ sucesso: false, erro: 'Nota deve ser 1-5.' });
      if (!db.queryOne('SELECT id FROM usuarios WHERE id=?', [usuario_id])) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado.' });
      if (!db.queryOne('SELECT id FROM pontos_turisticos WHERE id=? AND ativo=1', [ponto_id])) return res.status(404).json({ sucesso: false, erro: 'Ponto não encontrado.' });
      const result = db.run('INSERT INTO avaliacoes (usuario_id,ponto_id,nota,comentario) VALUES (?,?,?,?)',
        [usuario_id, ponto_id, nota, comentario||null]);
      const nova = db.queryOne(`SELECT a.*, u.nome as usuario_nome, p.nome as ponto_nome
        FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
        JOIN pontos_turisticos p ON p.id=a.ponto_id WHERE a.id=?`, [result.lastInsertRowid]);
      res.status(201).json({ sucesso: true, dados: nova, mensagem: 'Avaliação registrada com sucesso!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  atualizar(req, res) {
    try {
      const db = getDb();
      const av = db.queryOne('SELECT * FROM avaliacoes WHERE id=?', [req.params.id]);
      if (!av) return res.status(404).json({ sucesso: false, erro: 'Avaliação não encontrada.' });
      const { nota, comentario } = req.body;
      if (nota && (nota < 1 || nota > 5)) return res.status(400).json({ sucesso: false, erro: 'Nota deve ser 1-5.' });
      db.run('UPDATE avaliacoes SET nota=COALESCE(?,nota), comentario=COALESCE(?,comentario) WHERE id=?',
        [nota||null, comentario||null, req.params.id]);
      const atualizada = db.queryOne(`SELECT a.*, u.nome as usuario_nome, p.nome as ponto_nome
        FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
        JOIN pontos_turisticos p ON p.id=a.ponto_id WHERE a.id=?`, [req.params.id]);
      res.json({ sucesso: true, dados: atualizada, mensagem: 'Avaliação atualizada!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  deletar(req, res) {
    try {
      const db = getDb();
      const av = db.queryOne('SELECT * FROM avaliacoes WHERE id=?', [req.params.id]);
      if (!av) return res.status(404).json({ sucesso: false, erro: 'Avaliação não encontrada.' });
      db.run('DELETE FROM avaliacoes WHERE id=?', [req.params.id]);
      res.json({ sucesso: true, mensagem: 'Avaliação removida com sucesso!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  }
};
module.exports = avaliacoesController;
