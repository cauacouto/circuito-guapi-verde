const { getDb } = require('../database/db');

const usuariosController = {
  listar(req, res) {
    try {
      const db = getDb();
      const usuarios = db.queryAll('SELECT id,nome,email,foto_url,criado_em FROM usuarios ORDER BY nome');
      res.json({ sucesso: true, dados: usuarios, total: usuarios.length });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  buscarPorId(req, res) {
    try {
      const db = getDb();
      const u = db.queryOne('SELECT id,nome,email,foto_url,criado_em FROM usuarios WHERE id=?', [req.params.id]);
      if (!u) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado.' });
      res.json({ sucesso: true, dados: u });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  criar(req, res) {
    try {
      const db = getDb();
      const { nome, email, senha, foto_url } = req.body;
      if (!nome || !email || !senha) return res.status(400).json({ sucesso: false, erro: 'Nome, email e senha obrigatórios.' });
      const existe = db.queryOne('SELECT id FROM usuarios WHERE email=?', [email]);
      if (existe) return res.status(409).json({ sucesso: false, erro: 'E-mail já cadastrado.' });
      const result = db.run('INSERT INTO usuarios (nome,email,senha,foto_url) VALUES (?,?,?,?)', [nome, email, senha, foto_url||null]);
      const novo = db.queryOne('SELECT id,nome,email,foto_url,criado_em FROM usuarios WHERE id=?', [result.lastInsertRowid]);
      res.status(201).json({ sucesso: true, dados: novo, mensagem: 'Usuário cadastrado com sucesso!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  atualizar(req, res) {
    try {
      const db = getDb();
      const u = db.queryOne('SELECT * FROM usuarios WHERE id=?', [req.params.id]);
      if (!u) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado.' });
      const { nome, email, senha, foto_url } = req.body;
      if (email && email !== u.email) {
        const existe = db.queryOne('SELECT id FROM usuarios WHERE email=? AND id!=?', [email, req.params.id]);
        if (existe) return res.status(409).json({ sucesso: false, erro: 'E-mail já em uso.' });
      }
      db.run(`UPDATE usuarios SET nome=COALESCE(?,nome), email=COALESCE(?,email),
        senha=COALESCE(?,senha), foto_url=COALESCE(?,foto_url) WHERE id=?`,
        [nome||null, email||null, senha||null, foto_url||null, req.params.id]);
      const atualizado = db.queryOne('SELECT id,nome,email,foto_url,criado_em FROM usuarios WHERE id=?', [req.params.id]);
      res.json({ sucesso: true, dados: atualizado, mensagem: 'Usuário atualizado!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  deletar(req, res) {
    try {
      const db = getDb();
      const u = db.queryOne('SELECT * FROM usuarios WHERE id=?', [req.params.id]);
      if (!u) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado.' });
      db.run('DELETE FROM usuarios WHERE id=?', [req.params.id]);
      res.json({ sucesso: true, mensagem: 'Usuário removido com sucesso!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  },

  login(req, res) {
    try {
      const db = getDb();
      const { email, senha } = req.body;
      if (!email || !senha) return res.status(400).json({ sucesso: false, erro: 'Email e senha obrigatórios.' });
      const u = db.queryOne('SELECT * FROM usuarios WHERE email=? AND senha=?', [email, senha]);
      if (!u) return res.status(401).json({ sucesso: false, erro: 'Credenciais inválidas.' });
      const { senha: _, ...pub } = u;
      res.json({ sucesso: true, dados: pub, mensagem: 'Login realizado com sucesso!' });
    } catch(err) { res.status(500).json({ sucesso: false, erro: err.message }); }
  }
};
module.exports = usuariosController;
