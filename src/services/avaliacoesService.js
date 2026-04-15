const { getDb } = require('../database/db');
const { httpError } = require('../utils/httpError');

function listar() {
  const db = getDb();
  return db.queryAll(
    `SELECT a.*, u.nome as usuario_nome, u.foto_url as usuario_foto,
      p.nome as ponto_nome, p.tipo as ponto_tipo
      FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
      JOIN pontos_turisticos p ON p.id=a.ponto_id ORDER BY a.criado_em DESC`
  );
}

function buscarPorId(id) {
  const db = getDb();
  const av = db.queryOne(
    `SELECT a.*, u.nome as usuario_nome, p.nome as ponto_nome, p.tipo as ponto_tipo
      FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
      JOIN pontos_turisticos p ON p.id=a.ponto_id WHERE a.id=?`,
    [id]
  );
  if (!av) throw httpError(404, 'Avaliação não encontrada.');
  return av;
}

function porPonto(pontoId) {
  const db = getDb();
  const ponto = db.queryOne('SELECT * FROM pontos_turisticos WHERE id=? AND ativo=1', [pontoId]);
  if (!ponto) throw httpError(404, 'Ponto não encontrado.');

  const avs = db.queryAll(
    `SELECT a.*, u.nome as usuario_nome, u.foto_url as usuario_foto
      FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
      WHERE a.ponto_id=? ORDER BY a.criado_em DESC`,
    [pontoId]
  );
  const allNotas = avs.map((a) => a.nota);
  const media = allNotas.length ? (allNotas.reduce((s, n) => s + n, 0) / allNotas.length).toFixed(1) : null;

  return {
    ponto: { id: ponto.id, nome: ponto.nome, tipo: ponto.tipo },
    estatisticas: { media, total: avs.length },
    avaliacoes: avs
  };
}

function criar(payload) {
  const { usuario_id, ponto_id, nota, comentario } = payload || {};
  if (!usuario_id || !ponto_id || !nota) {
    throw httpError(400, 'usuario_id, ponto_id e nota são obrigatórios.');
  }
  if (nota < 1 || nota > 5) throw httpError(400, 'Nota deve ser 1-5.');

  const db = getDb();
  if (!db.queryOne('SELECT id FROM usuarios WHERE id=?', [usuario_id])) throw httpError(404, 'Usuário não encontrado.');
  if (!db.queryOne('SELECT id FROM pontos_turisticos WHERE id=? AND ativo=1', [ponto_id])) {
    throw httpError(404, 'Ponto não encontrado.');
  }

  const result = db.run(
    'INSERT INTO avaliacoes (usuario_id,ponto_id,nota,comentario) VALUES (?,?,?,?)',
    [usuario_id, ponto_id, nota, comentario || null]
  );
  return db.queryOne(
    `SELECT a.*, u.nome as usuario_nome, p.nome as ponto_nome
      FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
      JOIN pontos_turisticos p ON p.id=a.ponto_id WHERE a.id=?`,
    [result.lastInsertRowid]
  );
}

function atualizar(id, payload) {
  const db = getDb();
  const av = db.queryOne('SELECT * FROM avaliacoes WHERE id=?', [id]);
  if (!av) throw httpError(404, 'Avaliação não encontrada.');

  const { nota, comentario } = payload || {};
  if (nota && (nota < 1 || nota > 5)) throw httpError(400, 'Nota deve ser 1-5.');

  db.run('UPDATE avaliacoes SET nota=COALESCE(?,nota), comentario=COALESCE(?,comentario) WHERE id=?', [
    nota || null,
    comentario || null,
    id
  ]);
  return db.queryOne(
    `SELECT a.*, u.nome as usuario_nome, p.nome as ponto_nome
      FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id
      JOIN pontos_turisticos p ON p.id=a.ponto_id WHERE a.id=?`,
    [id]
  );
}

function deletar(id) {
  const db = getDb();
  const av = db.queryOne('SELECT * FROM avaliacoes WHERE id=?', [id]);
  if (!av) throw httpError(404, 'Avaliação não encontrada.');
  db.run('DELETE FROM avaliacoes WHERE id=?', [id]);
}

module.exports = { listar, buscarPorId, porPonto, criar, atualizar, deletar };

