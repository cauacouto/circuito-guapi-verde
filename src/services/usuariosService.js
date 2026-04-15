const { getDb } = require('../database/db');
const { httpError } = require('../utils/httpError');

function listar() {
  const db = getDb();
  return db.queryAll('SELECT id,nome,email,foto_url,criado_em FROM usuarios ORDER BY nome');
}

function buscarPorId(id) {
  const db = getDb();
  const u = db.queryOne('SELECT id,nome,email,foto_url,criado_em FROM usuarios WHERE id=?', [id]);
  if (!u) throw httpError(404, 'Usuário não encontrado.');
  return u;
}

function criar({ nome, email, senha, foto_url }) {
  if (!nome || !email || !senha) throw httpError(400, 'Nome, email e senha obrigatórios.');
  const db = getDb();
  const existe = db.queryOne('SELECT id FROM usuarios WHERE email=?', [email]);
  if (existe) throw httpError(409, 'E-mail já cadastrado.');

  const result = db.run(
    'INSERT INTO usuarios (nome,email,senha,foto_url) VALUES (?,?,?,?)',
    [nome, email, senha, foto_url || null]
  );
  return db.queryOne('SELECT id,nome,email,foto_url,criado_em FROM usuarios WHERE id=?', [result.lastInsertRowid]);
}

function atualizar(id, { nome, email, senha, foto_url }) {
  const db = getDb();
  const u = db.queryOne('SELECT * FROM usuarios WHERE id=?', [id]);
  if (!u) throw httpError(404, 'Usuário não encontrado.');

  if (email && email !== u.email) {
    const existe = db.queryOne('SELECT id FROM usuarios WHERE email=? AND id!=?', [email, id]);
    if (existe) throw httpError(409, 'E-mail já em uso.');
  }

  db.run(
    `UPDATE usuarios SET nome=COALESCE(?,nome), email=COALESCE(?,email),
      senha=COALESCE(?,senha), foto_url=COALESCE(?,foto_url) WHERE id=?`,
    [nome || null, email || null, senha || null, foto_url || null, id]
  );
  return db.queryOne('SELECT id,nome,email,foto_url,criado_em FROM usuarios WHERE id=?', [id]);
}

function deletar(id) {
  const db = getDb();
  const u = db.queryOne('SELECT * FROM usuarios WHERE id=?', [id]);
  if (!u) throw httpError(404, 'Usuário não encontrado.');
  db.run('DELETE FROM usuarios WHERE id=?', [id]);
}

function login({ email, senha }) {
  if (!email || !senha) throw httpError(400, 'Email e senha obrigatórios.');
  const db = getDb();
  const u = db.queryOne('SELECT * FROM usuarios WHERE email=? AND senha=?', [email, senha]);
  if (!u) throw httpError(401, 'Credenciais inválidas.');
  const { senha: _senha, ...pub } = u;
  return pub;
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar, login };

