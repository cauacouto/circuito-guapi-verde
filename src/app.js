const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database/db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', routes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ sucesso: false, erro: 'Rota não encontrada.' });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log('\n🌿 ================================');
    console.log(`🌿  EcoTrilhas Guapimirim`);
    console.log(`🌿  http://localhost:${PORT}`);
    console.log('🌿 ================================\n');
  });
}).catch(err => {
  console.error('Erro ao iniciar banco:', err);
  process.exit(1);
});

module.exports = app;
