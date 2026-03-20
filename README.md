# 🛵 MotoPeças - Loja de Peças para Motos

Landing page responsiva para venda de peças de motos com entrega local.

## 🚀 Tecnologias

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Segurança**: Helmet (CSP headers)
- **Comunicação**: API REST
- **Pedidos**: Via WhatsApp

## 🔧 Funcionalidades

- Itens do Dia (promoções)
- Categorias dinâmicas
- Carrinho sem login
- Finalizar pedido pelo WhatsApp
- Painel Admin para gestão de produtos e categorias

## 📦 Como rodar

1. **Backend**

   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

> MongoDB deve estar rodando localmente ou use MongoDB Atlas.

## ⚙️ Variáveis de Ambiente

Crie um arquivo `backend/.env`:

```env
DATABASE_URL=mongodb://localhost:27017/motopecas
PORT=5000
```

> Em produção, altere `VITE_API_URL` no frontend para o domínio da API.

---

## 🔐 Painel Admin

### Acesso

O painel administrativo é acessado pelo navegador em:

```
http://localhost:5000/admin
```

> **Nota:** O admin é servido como arquivo estático pelo backend. Não há sistema de login implementado — o acesso é aberto. Em produção, recomenda-se proteger a rota `/admin` com autenticação (ex: middleware de senha, JWT ou proxy reverso com senha).

### Funcionalidades do Admin

#### 📦 Produtos (`/admin` — tela principal)

| Ação            | Descrição                                                                                |
| --------------- | ---------------------------------------------------------------------------------------- |
| **Cadastrar**   | Formulário com nome, preço, preço promocional, descrição, categorias e upload de imagens |
| **Listar**      | Tabela com todos os produtos cadastrados                                                 |
| **Editar**      | Clique em "Editar" na tabela para preencher o formulário com os dados do produto         |
| **Excluir**     | Clique em "Excluir" na tabela (com confirmação)                                          |
| **Item do Dia** | Checkbox para marcar/desmarcar produto como destaque                                     |

#### 🖼️ Upload de Imagens

- Até **10 imagens** por produto
- Formatos aceitos: `.jpg`, `.jpeg`, `.png`, `.webp`
- Tamanho máximo: **5MB** por arquivo
- Preview das imagens antes do envio
- Imagens novas são exibidas com badge **"NOVA"**
- Botão para remover imagens individuais

#### 💰 Máscara de Moeda

Os campos de preço possuem formatação automática no padrão brasileiro (`R$ 299,90`).
O preço promocional é validado para ser menor que o preço normal.

### Estrutura do Admin

```
backend/admin/
├── index.html          # Página principal (formulário + lista de produtos)
├── script.js           # Lógica separada (versão modular, para referência)
├── input.css           # CSS fonte (Tailwind)
├── output.css          # CSS compilado (Tailwind)
└── components/         # Componentes JS modulares (versão SPA)
    ├── menu.js         # Navegação lateral
    ├── produtos.js     # CRUD de produtos
    ├── categorias.js   # CRUD de categorias
    └── itemDoDia.js    # Gestão de itens em destaque
```

### Arquitetura Backend (MVC)

```
backend/
├── server.js              # Servidor Express (Helmet, Multer, rotas)
├── controllers/
│   ├── produtoController.js   # Lógica de negócio de produtos
│   └── categoriaController.js # Lógica de negócio de categorias
├── routes/
│   ├── produtos.js        # Rotas → controller de produtos
│   └── categorias.js      # Rotas → controller de categorias
├── models/
│   ├── Produto.js         # Schema: nome, preco, imagens[], categorias[], itemDoDia
│   └── Categoria.js       # Schema: nome, descricao, imagem, ordem
└── uploads/               # Imagens enviadas pelo admin
```

### Endpoints da API

#### Produtos (`/api/produtos`)

| Método | Endpoint            | Descrição                               |
| ------ | ------------------- | --------------------------------------- |
| GET    | `/api/produtos`     | Listar todos (aceita `?itemDoDia=true`) |
| GET    | `/api/produtos/:id` | Buscar por ID                           |
| POST   | `/api/produtos`     | Criar produto                           |
| PUT    | `/api/produtos/:id` | Atualizar produto                       |
| DELETE | `/api/produtos/:id` | Excluir produto                         |

#### Categorias (`/api/categorias`)

| Método | Endpoint              | Descrição                                |
| ------ | --------------------- | ---------------------------------------- |
| GET    | `/api/categorias`     | Listar todas (com produtos relacionados) |
| GET    | `/api/categorias/:id` | Buscar por ID                            |
| POST   | `/api/categorias`     | Criar categoria                          |
| PUT    | `/api/categorias/:id` | Atualizar categoria                      |
| DELETE | `/api/categorias/:id` | Excluir categoria                        |

#### Upload (`/api/upload`)

| Método | Endpoint               | Descrição                                 |
| ------ | ---------------------- | ----------------------------------------- |
| POST   | `/api/upload`          | Upload de imagem única (campo: `imagem`)  |
| POST   | `/api/upload-multiple` | Upload múltiplo até 10 (campo: `imagens`) |
