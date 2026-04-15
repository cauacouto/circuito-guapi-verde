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
    ['Mirante do Soberbo', 'Mirante clássico na entrada de Guapimirim, com vista para o Dedo de Deus e para a Serra dos Órgãos.', 'mirante', 'facil', -22.5288, -42.9896, 'BR-116, km 93 - Guapimirim - RJ', 'https://commons.wikimedia.org/wiki/Special:FilePath/Mirante_do_soberbo_e_vista_do_PARNASO_Guapimirim.jpg'],
    ['Poço Verde (PARNASO)', 'Poço e cachoeira de águas verdes dentro da sede Guapimirim do Parque Nacional da Serra dos Órgãos.', 'cachoeira', 'moderado', -22.4918, -42.9902, 'Parque Nacional da Serra dos Órgãos - Sede Guapimirim, Guapimirim - RJ', 'https://commons.wikimedia.org/wiki/Special:FilePath/ParqueOrgaos-Guapimirim3.jpg'],
    ['Sede Guapimirim do PARNASO', 'Área histórica do parque com trilhas curtas, natureza preservada e estrutura para visitação.', 'outro', 'facil', -22.4910, -42.9900, 'Parque Nacional da Serra dos Órgãos - Sede Guapimirim, Guapimirim - RJ', 'https://commons.wikimedia.org/wiki/Special:FilePath/Parque_Nacional_da_Serra_dos_%C3%93rg%C3%A3os_Sede_Guapimirim.jpg'],
    ['Trilha Circular da Sede (PARNASO)', 'Trilha curta na sede Guapimirim, ideal para famílias e para observar a Mata Atlântica.', 'trilha', 'facil', -22.4915, -42.9894, 'Sede Guapimirim do PARNASO, Guapimirim - RJ', 'https://commons.wikimedia.org/wiki/Special:FilePath/ParqueOrgaos-Guapimirim2.jpg'],
    ['Capela de Nossa Senhora da Conceição do Soberbo', 'Capela histórica de 1713 na sede Guapimirim do PARNASO, um dos marcos culturais mais tradicionais da região.', 'outro', 'facil', -22.4912, -42.9899, 'Sede Guapimirim do PARNASO, Guapimirim - RJ', 'https://commons.wikimedia.org/wiki/Special:FilePath/Capela_NS_da_Concei%C3%A7%C3%A3o_do_Soberbo.JPG'],
    ['APA de Guapimirim', 'Área de proteção ambiental de manguezais na Baía de Guanabara, importante para observação de fauna e educação ambiental.', 'outro', 'facil', -22.6550, -43.0330, 'Área de Proteção Ambiental de Guapimirim - RJ', 'https://commons.wikimedia.org/wiki/Special:FilePath/ParqueOrgaos-Guapimirim3.jpg'],
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
