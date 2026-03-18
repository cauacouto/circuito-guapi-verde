


# 🌿 EcoTrilhas Guapimirim

### API de Turismo Ecológico — Descobrindo as belezas naturais de Guapimirim

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![REST API](https://img.shields.io/badge/REST-API-4CAF50?style=for-the-badge&logo=fastapi&logoColor=white)](https://restfulapi.net/)
[![Mobile](https://img.shields.io/badge/Mobile-Dev-2196F3?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-FFC107?style=for-the-badge)](.)

<br/>

> *"Guapimirim esconde trilhas que poucos conhecem, cachoeiras que encantam e mirantes que inspiram. Esta API foi criada para mudar isso."*

<br/>

</div>

---

## 🗺️ Sobre o Projeto

O **EcoTrilhas Guapimirim** é uma API RESTful desenvolvida como projeto acadêmico da disciplina de **Desenvolvimento Mobile (MVO)**, com o objetivo de promover e democratizar o acesso às informações sobre os atrativos naturais do município de **Guapimirim, RJ** — porta de entrada para a Serra dos Órgãos e um dos destinos de ecoturismo mais ricos do estado.

A plataforma conecta visitantes aos **pontos turísticos locais** — como trilhas, cachoeiras, mirantes e campings — permitindo que a comunidade contribua com avaliações, descobertas e experiências, fortalecendo o **turismo sustentável e responsável**.

---

## 👥 Integrantes do Grupo

<br/>

<div align="center">

| 🌿 | Integrante |
|:---:|:---|
| 🧑‍💻 | **Cauã Couto** |
| 🧑‍💻 | **Gustavo Salomão** |
| 🧑‍💻 | **Jean Lucas Nogueira** |

</div>

---

## 🎯 Objetivo

Facilitar a **descoberta e valorização** dos atrativos naturais de Guapimirim, incentivando o turismo sustentável e a interação entre visitantes e a natureza local por meio de uma plataforma colaborativa, acessível e moderna.

---

## 🧩 Entidades Principais

O sistema é estruturado em torno de **três entidades centrais** que se relacionam para formar uma experiência completa de turismo ecológico:

<br/>

### 🏞️ Ponto Turístico
> Rota principal: `/pontos`

Representa um **local turístico cadastrado** no sistema. Pode ser:

- 🥾 **Trilhas** — percursos na mata com diferentes níveis de dificuldade
- 💧 **Cachoeiras** — quedas d'água e poços naturais para banho
- ⛰️ **Mirantes** — pontos de observação com vistas panorâmicas
- ⛺ **Campings** — áreas para acampamento em contato com a natureza

Cada ponto possui informações detalhadas sobre localização, descrição, dificuldade de acesso, infraestrutura disponível e muito mais.

---

### 👤 Usuário
> Rota principal: `/usuarios`

Representa os **visitantes e turistas** que utilizam a plataforma. Os usuários podem:

- 📝 Criar e gerenciar sua conta
- 🔍 Explorar pontos turísticos cadastrados
- ⭐ Avaliar e comentar sobre suas experiências
- 🗺️ Contribuir com informações sobre locais visitados

---

### ⭐ Avaliação
> Rota principal: `/avaliacoes`

Permite que os usuários **compartilhem suas experiências** nos pontos turísticos, por meio de:

- 🔢 **Notas** — pontuação numérica de 1 a 5
- 💬 **Comentários** — relato textual da visita
- 📅 **Registro de data** — histórico das avaliações ao longo do tempo

---

## 🔗 Endpoints da API

### 🏞️ Pontos Turísticos — `/pontos`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/pontos` | Lista todos os pontos turísticos |
| `GET` | `/pontos/:id` | Busca um ponto turístico por ID |
| `POST` | `/pontos` | Cadastra um novo ponto turístico |
| `PUT` | `/pontos/:id` | Atualiza um ponto turístico |
| `DELETE` | `/pontos/:id` | Remove um ponto turístico |

### 👤 Usuários — `/usuarios`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/usuarios` | Lista todos os usuários |
| `GET` | `/usuarios/:id` | Busca um usuário por ID |
| `POST` | `/usuarios` | Cadastra um novo usuário |
| `PUT` | `/usuarios/:id` | Atualiza dados de um usuário |
| `DELETE` | `/usuarios/:id` | Remove um usuário |

### ⭐ Avaliações — `/avaliacoes`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/avaliacoes` | Lista todas as avaliações |
| `GET` | `/avaliacoes/:id` | Busca uma avaliação por ID |
| `GET` | `/avaliacoes/ponto/:pontoId` | Avaliações de um ponto específico |
| `POST` | `/avaliacoes` | Registra uma nova avaliação |
| `PUT` | `/avaliacoes/:id` | Atualiza uma avaliação |
| `DELETE` | `/avaliacoes/:id` | Remove uma avaliação |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Um gerenciador de banco de dados compatível

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/ecotrilhas-guapimirim.git

# 2. Acesse a pasta do projeto
cd ecotrilhas-guapimirim

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 5. Execute o servidor
npm start
```

O servidor estará disponível em: **`http://localhost:3000`**

---

## 📁 Estrutura do Projeto

```
ecotrilhas-guapimirim/
│
├── 📂 src/
│   ├── 📂 controllers/        # Lógica de controle das rotas
│   │   ├── pontoController.js
│   │   ├── usuarioController.js
│   │   └── avaliacaoController.js
│   │
│   ├── 📂 models/             # Modelos de dados
│   │   ├── Ponto.js
│   │   ├── Usuario.js
│   │   └── Avaliacao.js
│   │
│   ├── 📂 routes/             # Definição das rotas
│   │   ├── pontos.js
│   │   ├── usuarios.js
│   │   └── avaliacoes.js
│   │
│   └── 📄 app.js              # Configuração principal da aplicação
│
├── 📄 .env.example            # Exemplo de configuração de ambiente
├── 📄 package.json
└── 📄 README.md
```

---

## 🌱 Sobre Guapimirim

<div align="center">

*Guapimirim é um município da Região Metropolitana do Rio de Janeiro, reconhecido pela riqueza de sua flora e fauna, pela Reserva Ecológica de Guapimirim e pela proximidade com o Parque Nacional da Serra dos Órgãos. A cidade é um ponto estratégico para o ecoturismo na Baixada Fluminense e na Serra Fluminense.*

</div>

---

## 📄 Licença

Este projeto foi desenvolvido para fins **acadêmicos** na disciplina de Desenvolvimento Mobile (MVO).

---

<div align="center">

Feito com 🌿 e ☕ por **Cauã Couto**, **Gustavo Salomão** e **Jean Lucas Nogueira**

*Projeto Acadêmico — Desenvolvimento Mobile (MVO)*

<br/>

**🌿 Preserve a natureza. Explore com responsabilidade. 🌿**

</div>
