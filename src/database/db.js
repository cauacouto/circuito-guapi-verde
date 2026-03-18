const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.sqlite');

let db = null;
let helpers = null;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  createTables();
  seedData();
  saveDb();
  helpers = buildHelpers();
  return helpers;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function buildHelpers() {
  return {
    queryAll(sql, params = []) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    queryOne(sql, params = []) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows[0] || null;
    },
    run(sql, params = []) {
      db.run(sql, params);
      const stmt = db.prepare('SELECT last_insert_rowid() as id');
      stmt.step();
      const row = stmt.getAsObject();
      stmt.free();
      saveDb();
      return { lastInsertRowid: row.id };
    }
  };
}

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    foto_url TEXT,
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS pontos_turisticos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT NOT NULL,
    dificuldade TEXT,
    latitude REAL,
    longitude REAL,
    endereco TEXT,
    foto_url TEXT,
    ativo INTEGER DEFAULT 1,
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    ponto_id INTEGER NOT NULL,
    nota INTEGER NOT NULL,
    comentario TEXT,
    criado_em TEXT DEFAULT (datetime('now','localtime'))
  )`);
}

function seedData() {
  const stmt = db.prepare('SELECT COUNT(*) as c FROM pontos_turisticos');
  stmt.step();
  const row = stmt.getAsObject();
  stmt.free();
  if (row.c > 0) return;

  db.run(`INSERT INTO usuarios (nome, email, senha) VALUES
    ('Admin EcoTrilhas', 'admin@ecotrilhas.com', 'admin123'),
    ('João Aventureiro', 'joao@email.com', '123456'),
    ('Maria Natureza', 'maria@email.com', '123456')`);

  const pontos = [
    ['Trilha da Serra dos Órgãos', 'Trilha deslumbrante com vistas panorâmicas da Serra dos Órgãos. Percurso de 8km com subidas moderadas e paisagens únicas da Mata Atlântica.', 'trilha', 'moderado', -22.4731, -42.9831, 'Estrada do Colono, Guapimirim - RJ', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'],
    ['Cachoeira Véu de Noiva', 'Uma das cachoeiras mais belas da região, com queda de 40 metros em meio à vegetação exuberante. Ideal para banho e contemplação.', 'cachoeira', 'facil', -22.4810, -42.9650, 'Trilha do Rio Soberbo, Guapimirim - RJ', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    ['Mirante do Pico do Caledônia', 'Mirante com visão privilegiada de toda a Baía de Guanabara e da cidade do Rio de Janeiro. Vista incrível ao pôr do sol.', 'mirante', 'dificil', -22.4590, -42.9780, 'Alto do Pico Caledônia, Guapimirim - RJ', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
    ['Camping Rio Soberbo', 'Área de camping às margens do Rio Soberbo, com estrutura para barracas e fogueiras. Contato direto com a natureza e trilhas próximas.', 'camping', 'facil', -22.4900, -42.9720, 'Margem do Rio Soberbo, Guapimirim - RJ', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    ['Trilha das Bromélias', 'Trilha interpretativa com guia, percorrendo áreas ricas em bromélias, orquídeas e fauna silvestre. Ótima para ecoturismo educativo.', 'trilha', 'facil', -22.4755, -42.9900, 'Centro de Visitantes, Guapimirim - RJ', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
    ['Cachoeira do Inferno', 'Cachoeira imponente com 60 metros de queda livre, acessível por trilha de 2km. Apesar do nome, é um paraíso de beleza natural.', 'cachoeira', 'dificil', -22.4650, -42.9580, 'Parque Estadual dos Três Picos, Guapimirim - RJ', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800'],
  ];

  for (const p of pontos) {
    db.run('INSERT INTO pontos_turisticos (nome,descricao,tipo,dificuldade,latitude,longitude,endereco,foto_url) VALUES (?,?,?,?,?,?,?,?)', p);
  }

  const avs = [
    [2,1,5,'Trilha incrível! A vista lá de cima compensa cada subida. Recomendo muito!'],
    [3,1,4,'Muito bonito, mas exige preparo físico. Levem bastante água.'],
    [2,2,5,'A cachoeira é simplesmente perfeita. Água cristalina e lugar tranquilo.'],
    [3,3,5,'O pôr do sol no mirante é algo que não tem preço. Experiência única!'],
    [2,4,4,'Ótimo camping, estrutura básica mas o ambiente compensa. Rio lindo!'],
    [3,5,5,'Trilha das Bromélias é perfeita para conhecer a flora local.'],
  ];
  for (const a of avs) {
    db.run('INSERT INTO avaliacoes (usuario_id,ponto_id,nota,comentario) VALUES (?,?,?,?)', a);
  }
}

function getDb() {
  return helpers;
}

module.exports = { initDb, getDb };
