# MotoSpeed - Loja de Pecas para Motos

Landing page responsiva para venda de pecas de motos com entrega local.

## Tecnologias

- **Frontend**: React 18 + Vite 8 + Tailwind CSS 3.4
- **Backend**: Node.js + Express 4 + MongoDB (Mongoose 7)
- **Seguranca**: Helmet (CSP + CORP headers)
- **Comunicacao**: API REST
- **Pedidos**: Via WhatsApp
- **Hospedagem**: Hostinger VPS (deploy via GitHub)

## Funcionalidades

- Itens do Dia (promocoes com badge)
- Categorias dinamicas com toggle ativa/oculta
- Carrinho sem login (contexto React)
- Finalizar pedido pelo WhatsApp
- Painel Admin completo (produtos, categorias, configuracoes)
- Header e Footer configuraveis via admin
- Randomizacao de produtos por sessao do visitante
- Upload de imagens com subpastas organizadas

## Estrutura do Projeto

```
motopecas-loja/
├── backend/                   # API Node.js + Express
│   ├── server.js              # Servidor (Helmet, Multer, rotas)
│   ├── .env                   # Variaveis de ambiente (NAO commitado)
│   ├── controllers/
│   │   ├── produtoController.js
│   │   ├── categoriaController.js
│   │   └── configController.js
│   ├── routes/
│   │   ├── produtos.js
│   │   ├── categorias.js
│   │   └── config.js
│   ├── models/
│   │   ├── Produto.js         # nome, preco, imagens[], categorias[], itemDoDia
│   │   ├── Categoria.js       # nome, descricao, imagem, ordem, ativa
│   │   └── SiteConfig.js      # header, footer, display (singleton)
│   ├── admin/                 # Painel admin (vanilla JS SPA)
│   │   ├── index.html
│   │   └── components/
│   │       ├── menu.js
│   │       ├── produtos.js
│   │       ├── categorias.js
│   │       ├── itemDoDia.js
│   │       └── configuracoes.js
│   └── uploads/               # Imagens (nao commitado)
│       ├── produtos/{id}/
│       └── categorias/{id}/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── pages/Home.jsx
│   │   ├── components/
│   │   │   ├── Hero.jsx       # Dinamico via /api/config
│   │   │   ├── Footer.jsx     # Dinamico via /api/config
│   │   │   ├── Categorias.jsx # Filtra ?ativas=true
│   │   │   ├── Destaques.jsx
│   │   │   └── Carrinho.jsx
│   │   ├── context/CarrinhoContext.jsx
│   │   └── utils/imageUtils.js
│   └── vite.config.js
└── .gitignore
```

## Desenvolvimento Local

### 1. Backend

```bash
cd backend
npm install
# Criar backend/.env com DATABASE_URL e PORT=5000
npm run dev            # nodemon na porta 5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # Vite na porta 5173 (proxy -> 5000)
```

## Variaveis de Ambiente

### Backend (`backend/.env`)

```env
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/motopecas
PORT=5000
```

### Frontend (producao)

No build de producao, se a API estiver em dominio diferente do frontend:

```env
VITE_API_URL=https://api.seudominio.com
```

> Em desenvolvimento, o proxy do Vite envia `/api` e `/uploads` para `localhost:5000` automaticamente.

---

## Painel Admin

Acesso: `http://localhost:5000/admin`

| Secao             | Descricao                                                        |
| ----------------- | ---------------------------------------------------------------- |
| **Produtos**      | CRUD com upload de ate 10 imagens, preco promocional             |
| **Categorias**    | CRUD com imagem, ordem, toggle ativa/oculta                      |
| **Itens do Dia**  | Marcar/desmarcar produtos como destaque                          |
| **Configuracoes** | Header (titulo, slogan, bg), Footer (contato, horarios), Display |

---

## Endpoints da API

### Produtos (`/api/produtos`)

| Metodo | Endpoint            | Descricao                               |
| ------ | ------------------- | --------------------------------------- |
| GET    | `/api/produtos`     | Listar todos (aceita `?itemDoDia=true`) |
| GET    | `/api/produtos/:id` | Buscar por ID                           |
| POST   | `/api/produtos`     | Criar produto                           |
| PUT    | `/api/produtos/:id` | Atualizar produto                       |
| DELETE | `/api/produtos/:id` | Excluir produto                         |

### Categorias (`/api/categorias`)

| Metodo | Endpoint              | Descricao                                 |
| ------ | --------------------- | ----------------------------------------- |
| GET    | `/api/categorias`     | Listar todas (`?ativas=true` para filtro) |
| GET    | `/api/categorias/:id` | Buscar por ID                             |
| POST   | `/api/categorias`     | Criar categoria                           |
| PUT    | `/api/categorias/:id` | Atualizar categoria                       |
| DELETE | `/api/categorias/:id` | Excluir categoria                         |

### Configuracoes (`/api/config`)

| Metodo | Endpoint      | Descricao                                       |
| ------ | ------------- | ----------------------------------------------- |
| GET    | `/api/config` | Obter config (auto-cria default se nao existir) |
| PUT    | `/api/config` | Atualizar config (merge parcial)                |

### Upload (`/api/upload`)

| Metodo | Endpoint                         | Descricao                          |
| ------ | -------------------------------- | ---------------------------------- |
| POST   | `/api/upload`                    | Upload unico (campo: `imagem`)     |
| POST   | `/api/upload-multiple`           | Upload multiplo (campo: `imagens`) |
| POST   | `/api/upload/:tipo/:id`          | Upload em subpasta                 |
| POST   | `/api/upload-multiple/:tipo/:id` | Upload multiplo em subpasta        |
| DELETE | `/api/upload`                    | Excluir arquivo (body: `file`)     |
