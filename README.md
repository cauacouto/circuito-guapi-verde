# 🌿 EcoTrilhas Guapimirim

API + Frontend de Turismo Ecológico para Guapimirim - RJ  
Projeto Acadêmico — Desenvolvimento Mobile (MVO)

**Integrantes:** Cauã Couto · Gustavo Salomão · Jean Lucas Nogueira

---

## 🚀 Como Rodar

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor
npm start
# ou com hot-reload:
npm run dev

# 3. Acesse no navegador
http://localhost:3000
```

> O banco de dados SQLite é criado automaticamente com dados de exemplo na primeira execução. Não precisa configurar nada!

---

## 📁 Estrutura

```
ecotrilhas/
├── src/
│   ├── app.js                    # Entrada do servidor Express
│   ├── routes/index.js           # Todas as rotas da API
│   ├── controllers/
│   │   ├── pontosController.js
│   │   ├── usuariosController.js
│   │   └── avaliacoesController.js
│   └── database/db.js            # SQLite + seed de dados
├── public/
│   ├── index.html                # SPA Frontend
│   ├── css/main.css              # Estilos (mobile-first)
│   └── js/app.js                 # Lógica do frontend
└── package.json
```

---

## 🔗 Endpoints da API

### Pontos Turísticos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/pontos` | Lista pontos (suporta `?busca=`, `?tipo=`, `?dificuldade=`) |
| GET | `/api/pontos/:id` | Busca por ID |
| POST | `/api/pontos` | Cadastra novo ponto |
| PUT | `/api/pontos/:id` | Atualiza ponto |
| DELETE | `/api/pontos/:id` | Remove ponto (soft delete) |

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/usuarios` | Lista usuários |
| GET | `/api/usuarios/:id` | Busca por ID |
| POST | `/api/usuarios` | Cadastra usuário |
| PUT | `/api/usuarios/:id` | Atualiza usuário |
| DELETE | `/api/usuarios/:id` | Remove usuário |
| POST | `/api/usuarios/login` | Login (email + senha) |

### Avaliações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/avaliacoes` | Lista avaliações |
| GET | `/api/avaliacoes/:id` | Busca por ID |
| GET | `/api/avaliacoes/ponto/:pontoId` | Avaliações de um ponto |
| POST | `/api/avaliacoes` | Nova avaliação |
| PUT | `/api/avaliacoes/:id` | Atualiza avaliação |
| DELETE | `/api/avaliacoes/:id` | Remove avaliação |

---

## 🛠️ Tecnologias

- **Backend:** Node.js + Express
- **Banco:** SQLite (via better-sqlite3 — sem instalação separada)
- **Frontend:** HTML + CSS + JavaScript puro (responsivo, mobile-first)
