const { getDb } = require('../database/db');
const { httpError } = require('../utils/httpError');

function listar({ tipo, dificuldade, busca } = {}) {
  const db = getDb();
  let sql = `SELECT p.*, ROUND(AVG(a.nota),1) as media_avaliacoes, COUNT(a.id) as total_avaliacoes
    FROM pontos_turisticos p LEFT JOIN avaliacoes a ON a.ponto_id = p.id
    WHERE p.ativo = 1`;
  const params = [];
  if (tipo) {
    sql += ' AND p.tipo = ?';
    params.push(tipo);
  }
  if (dificuldade) {
    sql += ' AND p.dificuldade = ?';
    params.push(dificuldade);
  }
  if (busca) {
    sql += ' AND (p.nome LIKE ? OR p.descricao LIKE ?)';
    params.push(`%${busca}%`, `%${busca}%`);
  }
  sql += ' GROUP BY p.id ORDER BY media_avaliacoes DESC, p.nome ASC';
  return db.queryAll(sql, params);
}

function buscarPorId(id) {
  const db = getDb();
  const ponto = db.queryOne(
    `SELECT p.*, ROUND(AVG(a.nota),1) as media_avaliacoes, COUNT(a.id) as total_avaliacoes
     FROM pontos_turisticos p LEFT JOIN avaliacoes a ON a.ponto_id = p.id
     WHERE p.id = ? AND p.ativo = 1 GROUP BY p.id`,
    [id]
  );
  if (!ponto) throw httpError(404, 'Ponto não encontrado.');
  return ponto;
}

function criar(payload) {
  const { nome, descricao, tipo, dificuldade, latitude, longitude, endereco, foto_url } = payload || {};
  if (!nome || !tipo) throw httpError(400, 'Nome e tipo são obrigatórios.');
  const tiposValidos = ['trilha', 'cachoeira', 'mirante', 'camping', 'outro'];
  if (!tiposValidos.includes(tipo)) throw httpError(400, 'Tipo inválido.');

  const db = getDb();
  const result = db.run(
    'INSERT INTO pontos_turisticos (nome,descricao,tipo,dificuldade,latitude,longitude,endereco,foto_url) VALUES (?,?,?,?,?,?,?,?)',
    [nome, descricao || null, tipo, dificuldade || null, latitude || null, longitude || null, endereco || null, foto_url || null]
  );
  return db.queryOne('SELECT * FROM pontos_turisticos WHERE id = ?', [result.lastInsertRowid]);
}

function atualizar(id, payload) {
  const db = getDb();
  const ponto = db.queryOne('SELECT * FROM pontos_turisticos WHERE id = ?', [id]);
  if (!ponto) throw httpError(404, 'Ponto não encontrado.');

  const { nome, descricao, tipo, dificuldade, latitude, longitude, endereco, foto_url } = payload || {};
  db.run(
    `UPDATE pontos_turisticos SET
      nome=COALESCE(?,nome), descricao=COALESCE(?,descricao), tipo=COALESCE(?,tipo),
      dificuldade=COALESCE(?,dificuldade), latitude=COALESCE(?,latitude), longitude=COALESCE(?,longitude),
      endereco=COALESCE(?,endereco), foto_url=COALESCE(?,foto_url) WHERE id=?`,
    [nome || null, descricao || null, tipo || null, dificuldade || null, latitude || null, longitude || null, endereco || null, foto_url || null, id]
  );
  return db.queryOne('SELECT * FROM pontos_turisticos WHERE id = ?', [id]);
}

function deletar(id) {
  const db = getDb();
  const ponto = db.queryOne('SELECT * FROM pontos_turisticos WHERE id = ?', [id]);
  if (!ponto) throw httpError(404, 'Ponto não encontrado.');
  db.run('UPDATE pontos_turisticos SET ativo = 0 WHERE id = ?', [id]);
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };

