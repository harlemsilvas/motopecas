// Importação em lote de produtos via CSV
const Categoria = require("../models/Categoria");

const path = require("path");
const fs = require("fs");
const axios = require("axios");

// Função auxiliar para baixar/copiar imagem
async function salvarImagemParaProduto(origem, produtoId, idx = 0) {
  const uploadsDir = path.join(
    __dirname,
    "../uploads/produtos",
    String(produtoId),
  );
  fs.mkdirSync(uploadsDir, { recursive: true });
  let nomeArquivo = `${Date.now()}_${idx}`;
  let ext = path.extname(origem).toLowerCase();
  if (!ext || ext.length > 5) ext = ".jpg";
  nomeArquivo += ext;
  const destino = path.join(uploadsDir, nomeArquivo);

  // Se for URL externa
  if (/^https?:\/\//i.test(origem)) {
    try {
      const resp = await axios.get(origem, {
        responseType: "stream",
        timeout: 10000,
      });
      await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(destino);
        resp.data.pipe(ws);
        ws.on("finish", resolve);
        ws.on("error", reject);
      });
      return `/uploads/produtos/${produtoId}/${nomeArquivo}`;
    } catch (err) {
      return null;
    }
  }
  // Se for caminho local absoluto ou relativo
  try {
    const origemAbs = path.isAbsolute(origem)
      ? origem
      : path.join(__dirname, "../", origem.replace(/^\/+/, ""));
    if (!fs.existsSync(origemAbs)) return null;
    fs.copyFileSync(origemAbs, destino);
    return `/uploads/produtos/${produtoId}/${nomeArquivo}`;
  } catch (err) {
    return null;
  }
}

exports.importarProdutos = async (req, res) => {
  try {
    const produtos = req.body;
    if (!Array.isArray(produtos)) {
      return res.status(400).json({ erro: "Formato inválido" });
    }
    const erros = [];
    const inseridos = [];
    for (let i = 0; i < produtos.length; i++) {
      const p = produtos[i];
      if (!p.nome || !p.preco || !p.imagens) {
        erros.push({ linha: i + 2, erro: "Campos obrigatórios ausentes" });
        continue;
      }
      // Mapeia categorias por nome (ou ID se já for válido)
      let categoriaIds = [];
      if (p.categorias) {
        const nomes = p.categorias
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);
        for (const nome of nomes) {
          let cat = null;
          if (/^[0-9a-fA-F]{24}$/.test(nome)) {
            cat = await Categoria.findById(nome);
          } else {
            cat = await Categoria.findOne({ nome });
          }
          if (cat) categoriaIds.push(cat._id);
        }
      }
      // Cria produto sem imagens
      let novo;
      try {
        novo = new Produto({
          nome: p.nome,
          preco: Number(p.preco),
          precoPromocional: p.precoPromocional
            ? Number(p.precoPromocional)
            : undefined,
          descricao: p.descricao,
          imagens: [],
          categorias: categoriaIds,
          itemDoDia: p.itemDoDia === "true" || p.itemDoDia === true,
          ativo: p.ativo === "true" || p.ativo === true,
        });
        await novo.save();
      } catch (err) {
        erros.push({ linha: i + 2, erro: err.message });
        continue;
      }
      // Baixar/copiar imagens e atualizar produto
      const imagensOrigem = p.imagens
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      const imagensSalvas = [];
      for (let j = 0; j < imagensOrigem.length; j++) {
        const url = await salvarImagemParaProduto(
          imagensOrigem[j],
          novo._id,
          j,
        );
        if (url) imagensSalvas.push(url);
        else
          erros.push({
            linha: i + 2,
            erro: `Imagem não encontrada ou inválida: ${imagensOrigem[j]}`,
          });
      }
      novo.imagens = imagensSalvas;
      await novo.save();
      inseridos.push(novo._id);
    }
    res.json({ inseridos, erros });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
const Produto = require("../models/Produto");

exports.listarProdutos = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.itemDoDia === "true") filtro.itemDoDia = true;
    if (req.query.ativo === "true") filtro.ativo = true;
    else if (req.query.ativo === "false") filtro.ativo = false;
    // Filtro para excluídos: ativo false e deactivatedAt preenchido
    if (req.query.excluido === "true") {
      filtro.ativo = false;
      filtro.deactivatedAt = { $ne: null };
    }

    // Ordenação
    let sort = { nome: 1 };
    if (req.query.ordem === "desc") sort = { nome: -1 };

    // Paginação
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const total = await Produto.countDocuments(filtro);
    const produtos = await Produto.find(filtro)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("categorias", "nome imagem");

    res.json({
      produtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao listar produtos", detalhes: err.message });
  }
};

// Ativar produto
exports.ativarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      { ativo: true, deactivatedAt: null },
      { new: true },
    );
    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(produto);
  } catch (err) {
    res
      .status(400)
      .json({ erro: "Erro ao ativar produto", detalhes: err.message });
  }
};

// Desativar produto
exports.desativarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      { ativo: false, deactivatedAt: new Date() },
      { new: true },
    );
    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(produto);
  } catch (err) {
    res
      .status(400)
      .json({ erro: "Erro ao desativar produto", detalhes: err.message });
  }
};

exports.obterProdutoPorId = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id).populate(
      "categorias",
      "nome imagem",
    );
    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(produto);
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao buscar produto", detalhes: err.message });
  }
};

exports.criarProduto = async (req, res) => {
  try {
    const produto = new Produto(req.body);
    const salvo = await produto.save();
    res.status(201).json(salvo);
  } catch (err) {
    res
      .status(400)
      .json({ erro: "Erro ao criar produto", detalhes: err.message });
  }
};

exports.atualizarProduto = async (req, res) => {
  // Loga o corpo recebido para debug
  console.log("PUT /api/produtos/:id req.body:", JSON.stringify(req.body));
  try {
    // Buscar produto atual para comparar valor de ativo
    const produtoAtual = await Produto.findById(req.params.id);
    if (!produtoAtual)
      return res.status(404).json({ erro: "Produto não encontrado" });

    const atualizandoAtivo =
      typeof req.body.ativo !== "undefined" &&
      req.body.ativo !== produtoAtual.ativo;

    // Se está mudando ativo para false, seta deactivatedAt
    if (atualizandoAtivo && req.body.ativo === false) {
      req.body.deactivatedAt = new Date();
    }
    // Se está mudando ativo para true, limpa deactivatedAt
    if (atualizandoAtivo && req.body.ativo === true) {
      req.body.deactivatedAt = null;
    }

    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("categorias", "nome imagem");
    res.json(produto);
  } catch (err) {
    res
      .status(400)
      .json({ erro: "Erro ao atualizar produto", detalhes: err.message });
  }
};

exports.removerProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      { ativo: false, deactivatedAt: new Date() },
      { new: true },
    );
    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado" });
    res.json({ message: "Produto desativado", produto });
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao desativar produto", detalhes: err.message });
  }
};
