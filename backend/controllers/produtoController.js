const Produto = require("../models/Produto");

exports.listarProdutos = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.itemDoDia === "true") filtro.itemDoDia = true;

    const produtos = await Produto.find(filtro).populate(
      "categorias",
      "nome imagem",
    );
    res.json(produtos);
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao listar produtos", detalhes: err.message });
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
  try {
    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("categorias", "nome imagem");
    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(produto);
  } catch (err) {
    res
      .status(400)
      .json({ erro: "Erro ao atualizar produto", detalhes: err.message });
  }
};

exports.removerProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);
    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado" });
    res.json({ message: "Produto excluído" });
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao excluir produto", detalhes: err.message });
  }
};
