// criar-projeto-motopecas.js
const fs = require("fs");
const path = require("path");

// Função para garantir que a pasta existe
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Função para escrever arquivo
const writeFile = (filePath, content) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.trimStart(), "utf-8");
  console.log(`✅ Criado: ${filePath}`);
};

// Raiz do projeto
const root = path.join(process.cwd(), "motopecas-loja");
ensureDir(root);

console.log("🚀 Iniciando criação do projeto MotoPeças...\n");

// ============================================================================= //
//                            ARQUIVOS RAIZ
// ============================================================================= //

writeFile(
  path.join(root, ".gitignore"),
  `
node_modules/
.env
/uploads/*
!.gitkeep
frontend/node_modules
backend/node_modules
`.trim()
);

writeFile(
  path.join(root, "README.md"),
  `
# 🛵 MotoPeças - Loja de Peças para Motos

Landing page responsiva para venda de peças de motos com entrega local.

## 🚀 Tecnologias
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Comunicação**: API REST
- **Pedidos**: Via WhatsApp

## 🔧 Funcionalidades
- Itens do Dia (promoções)
- Categorias dinâmicas
- Carrinho sem login
- Finalizar pedido pelo WhatsApp

## 📦 Como rodar

1. **Backend**
   \`\`\`bash
   cd backend
   npm install
   npm start
   \`\`\`

2. **Frontend**
   \`\`\`bash
   cd frontend
   npm install
   npm start
   \`\`\`

> MongoDB deve estar rodando localmente ou use MongoDB Atlas.
`.trim()
);

// ============================================================================= //
//                            FRONTEND
// ============================================================================= //

const frontendDir = path.join(root, "frontend");

// package.json
writeFile(
  path.join(frontendDir, "package.json"),
  JSON.stringify(
    {
      name: "motopecas-frontend",
      version: "0.1.0",
      private: true,
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1",
        swiper: "^11.0.0",
      },
      scripts: {
        start: "react-scripts start",
        build: "react-scripts build",
      },
      eslintConfig: {
        extends: "react-app",
      },
      browserslist: {
        production: [">0.2%", "not dead", "not op_mini all"],
        development: [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version",
        ],
      },
    },
    null,
    2
  )
);

// tailwind.config.js
writeFile(
  path.join(frontendDir, "tailwind.config.js"),
  `
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
`.trim()
);

// postcss.config.js (necessário para Tailwind)
writeFile(
  path.join(frontendDir, "postcss.config.js"),
  `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`
);

// public/index.html
writeFile(
  path.join(frontendDir, "public", "index.html"),
  `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Loja de Peças para Motos</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <noscript>Você precisa habilitar JavaScript para rodar esta aplicação.</noscript>
    <div id="root"></div>
  </body>
</html>
`.trim()
);

// src/index.js
writeFile(
  path.join(frontendDir, "src", "index.js"),
  `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CarrinhoProvider } from './context/CarrinhoContext';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CarrinhoProvider>
      <App />
    </CarrinhoProvider>
  </React.StrictMode>
);
`
);

// src/App.js
writeFile(
  path.join(frontendDir, "src", "App.js"),
  `
import React from 'react';
import Home from './pages/Home';
import Carrinho from './components/Carrinho';

function App() {
  return (
    <div className="font-sans">
      <Home />
      <Carrinho />
    </div>
  );
}

export default App;
`
);

// context/CarrinhoContext.js
writeFile(
  path.join(frontendDir, "src", "context", "CarrinhoContext.js"),
  `
import React, { createContext, useState, useContext } from 'react';

const CarrinhoContext = createContext();

export const useCarrinho = () => useContext(CarrinhoContext);

export const CarrinhoProvider = ({ children }) => {
  const [itens, setItens] = useState([]);

  const adicionarItem = (produto) => {
    setItens(prev => {
      const existe = prev.find(item => item._id === produto._id);
      if (existe) return prev;
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const removerItem = (id) => {
    setItens(prev => prev.filter(item => item._id !== id));
  };

  const limparCarrinho = () => setItens([]);

  const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  return (
    <CarrinhoContext.Provider value={{ itens, adicionarItem, removerItem, limparCarrinho, total }}>
      {children}
    </CarrinhoContext.Provider>
  );
};
`
);

// components/
const compDir = path.join(frontendDir, "src", "components");

writeFile(
  path.join(compDir, "Hero.js"),
  `
export default function Hero() {
  return (
    <section className="bg-blue-900 text-white py-20 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold">Peças para Motos com Entrega Local</h1>
        <p className="mt-4 text-lg">Frete grátis para região! Promoções imperdíveis todos os dias.</p>
        <button className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded">
          Ver Produtos
        </button>
      </div>
    </section>
  );
}
`
);

writeFile(
  path.join(compDir, "Destaques.js"),
  `
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useCarrinho } from '../context/CarrinhoContext';

export default function Destaques({ produtos = [] }) {
  const { adicionarItem } = useCarrinho();

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">🔥 Itens do Dia</h2>
        <Swiper spaceBetween={20} slidesPerView={1} breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}>
          {produtos.map(produto => (
            <SwiperSlide key={produto._id}>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <img src={produto.imagem || '/placeholder.jpg'} alt={produto.nome} className="w-full h-40 object-cover rounded" />
                <h3 className="mt-4 font-semibold">{produto.nome}</h3>
                <p className="text-lg text-red-600 font-bold">R$ {produto.precoPromocional?.toFixed(2)}</p>
                {produto.precoOriginal && (
                  <p className="text-sm text-gray-500 line-through">R$ {produto.precoOriginal.toFixed(2)}</p>
                )}
                <div className="mt-4 space-y-2">
                  <button 
                    onClick={() => adicionarItem(produto)}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500"
                  >
                    ➕ Adicionar ao Carrinho
                  </button>
                  <a 
                    href={\`https://wa.me/5511999999999?text=Quero saber sobre \${encodeURIComponent(produto.nome)}\`}
                    target="_blank"
                    className="block text-green-600 font-medium"
                  >
                    💬 Perguntar no WhatsApp
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
`
);

writeFile(
  path.join(compDir, "Categorias.js"),
  `
import { useState, useEffect } from 'react';
import { useCarrinho } from '../context/CarrinhoContext';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error('Erro ao carregar categorias:', err));
  }, []);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {categorias.map(cat => (
          <div key={cat._id} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{cat.nome}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cat.produtos.map(produto => (
                <div key={produto._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <img src={produto.imagem || '/placeholder.jpg'} alt={produto.nome} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold">{produto.nome}</h3>
                    <p className="text-sm text-gray-600">{produto.descricao}</p>
                    <p className="text-lg font-bold mt-2">R$ {produto.preco.toFixed(2)}</p>
                    <div className="mt-3 space-y-2">
                      <button 
                        onClick={() => useCarrinho().adicionarItem(produto)}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 text-sm"
                      >
                        ➕ Adicionar
                      </button>
                      <a 
                        href={\`https://wa.me/5511999999999?text=Tenho interesse em \${encodeURIComponent(produto.nome)}\`}
                        target="_blank"
                        className="block text-center text-green-600 text-sm"
                      >
                        💬 Perguntar
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
`
);

writeFile(
  path.join(compDir, "Carrinho.js"),
  `
import { useCarrinho } from '../context/CarrinhoContext';

export default function Carrinho() {
  const { itens, removerItem, limparCarrinho, total } = useCarrinho();

  const gerarMensagemWhatsApp = () => {
    const mensagem = itens.map(item => 
      \`\${item.nome} - R\$\\\${item.preco.toFixed(2)} x \${item.quantidade}\`
    ).join('%0A');
    return \`https://wa.me/5511999999999?text=Olá! Gostaria de fazer um pedido:%0A%0A\${mensagem}%0A%0ATotal: R\$\\\${total.toFixed(2)}\`;
  };

  if (itens.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80 z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold">Seu Pedido ({itens.length} item(s))</h3>
      <ul className="mt-2 text-sm">
        {itens.map(item => (
          <li key={item._id} className="flex justify-between py-1 border-b">
            <span>{item.nome} x{item.quantidade}</span>
            <button onClick={() => removerItem(item._id)} className="text-red-500 ml-2">×</button>
          </li>
        ))}
      </ul>
      <p className="font-bold mt-2">Total: R$ {total.toFixed(2)}</p>
      <a 
        href={gerarMensagemWhatsApp()}
        target="_blank"
        className="block mt-3 bg-green-600 text-white text-center py-2 rounded text-sm"
      >
        Finalizar Pedido via WhatsApp
      </a>
      <button onClick={limparCarrinho} className="block mt-1 text-xs text-gray-500 w-full text-left">
        Limpar carrinho
      </button>
    </div>
  );
}
`
);

writeFile(
  path.join(compDir, "Footer.js"),
  `
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg">MotoPeças Local</h3>
          <p className="mt-2">Rua das Motores, 123 - Centro</p>
          <p>São Paulo - SP</p>
        </div>
        <div>
          <h3 className="font-bold">Contato</h3>
          <p className="mt-2">📞 (11) 99999-9999</p>
          <p>📞 (11) 3333-4444</p>
          <div className="mt-4 space-x-4">
            <a href="https://instagram.com/motopecas" target="_blank" className="text-pink-400">📸 Instagram</a>
            <a href="https://wa.me/5511999999999" target="_blank" className="text-green-400">💬 WhatsApp</a>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Horário</h3>
          <p className="mt-2">Seg-Sex: 8h às 18h</p>
          <p>Sábado: 9h às 13h</p>
          <p>Domingo: Fechado</p>
        </div>
      </div>
      <div className="text-center mt-6 text-sm text-gray-400">
        © 2025 MotoPeças Local. Todos os direitos reservados.
      </div>
    </footer>
  );
}
`
);

// pages/Home.js
ensureDir(path.join(frontendDir, "src", "pages"));
writeFile(
  path.join(frontendDir, "src", "pages", "Home.js"),
  `
import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Destaques from '../components/Destaques';
import Categorias from '../components/Categorias';
import Footer from '../components/Footer';

const Home = () => {
  const [destaques, setDestaques] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/produtos?destaque=true')
      .then(res => res.json())
      .then(data => setDestaques(data))
      .catch(err => console.error('Erro ao carregar destaques:', err));
  }, []);

  return (
    <div>
      <Hero />
      <Destaques produtos={destaques} />
      <Categorias />
      <Footer />
    </div>
  );
};

export default Home;
`
);

// ============================================================================= //
//                            BACKEND
// ============================================================================= //

const backendDir = path.join(root, "backend");

writeFile(
  path.join(backendDir, "package.json"),
  JSON.stringify(
    {
      name: "motopecas-backend",
      version: "0.1.0",
      main: "server.js",
      scripts: {
        start: "node server.js",
        dev: "nodemon server.js",
      },
      dependencies: {
        express: "^4.18.2",
        mongoose: "^7.0.0",
        cors: "^2.8.5",
      },
    },
    null,
    2
  )
);

writeFile(
  path.join(backendDir, "server.js"),
  `
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/produtos', require('./routes/produtos'));
app.use('/api/categorias', require('./routes/categorias'));

mongoose.connect('mongodb://localhost:27017/motopecas', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(5000, () => {
  console.log('Backend rodando na porta 5000');
});
`
);

// models/
ensureDir(path.join(backendDir, "models"));
writeFile(
  path.join(backendDir, "models", "Produto.js"),
  `
const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
  nome: String,
  descricao: String,
  preco: Number,
  precoPromocional: Number,
  imagens: [String],
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' },
  itemDoDia: { type: Boolean, default: false }
});

module.exports = mongoose.model('Produto', produtoSchema);
`
);

writeFile(
  path.join(backendDir, "models", "Categoria.js"),
  `
const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nome: String,
  ordem: Number
});

module.exports = mongoose.model('Categoria', categoriaSchema);
`
);

// routes/
ensureDir(path.join(backendDir, "routes"));
writeFile(
  path.join(backendDir, "routes", "produtos.js"),
  `
const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');

router.get('/', async (req, res) => {
  const { destaque } = req.query;
  let query = {};
  if (destaque) query.itemDoDia = true;
  try {
    const produtos = await Produto.find(query).populate('categoria');
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
`
);

writeFile(
  path.join(backendDir, "routes", "categorias.js"),
  `
const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');
const Produto = require('../models/Produto');

router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.find().sort('ordem');
    const categoriasComProdutos = await Promise.all(
      categorias.map(async (cat) => {
        const produtos = await Produto.find({ categoria: cat._id });
        return { ...cat._doc, produtos };
      })
    );
    res.json(categoriasComProdutos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
`
);

// uploads (pasta vazia)
ensureDir(path.join(backendDir, "uploads"));

console.log("\n🎉 Projeto criado com sucesso em:", root);
console.log("\n📦 Próximos passos:");
console.log("1. Acesse a pasta: cd motopecas-loja");
console.log("2. Inicie o backend: cd backend && npm install && npm start");
console.log("3. Em outro terminal: cd frontend && npm install && npm start");
console.log("4. Abra http://localhost:3000");
