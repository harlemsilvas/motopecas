const mongoose = require("mongoose");
const Categoria = require("../models/Categoria");
const Produto = require("../models/Produto");

exports.listarCategorias = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.ativas === "true") filtro.ativa = true;

    const categorias = await Categoria.find(filtro).sort("ordem");
    const categoriasComProdutos = await Promise.all(
      categorias.map(async (cat) => {
        const produtos = await Produto.find({ categorias: cat._id }).populate(
          "categorias",
          "nome",
        );
        return { ...cat._doc, produtos };
      }),
    );
    res.json(categoriasComProdutos);
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao listar categorias", detalhes: err.message });
  }
};

exports.obterCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: "ID inválido" });
    }

    const categoria = await Categoria.findById(id);
    if (!categoria)
      return res.status(404).json({ erro: "Categoria não encontrada" });
    res.json(categoria);
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao buscar categoria", detalhes: err.message });
  }
};

exports.criarCategoria = async (req, res) => {
  try {
    const categoria = new Categoria(req.body);
    const salva = await categoria.save();
    res.status(201).json(salva);
  } catch (err) {
    res
      .status(400)
      .json({ erro: "Erro ao criar categoria", detalhes: err.message });
  }
};

exports.atualizarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!categoria)
      return res.status(404).json({ erro: "Categoria não encontrada" });
    res.json(categoria);
  } catch (err) {
    res
      .status(400)
      .json({ erro: "Erro ao atualizar categoria", detalhes: err.message });
  }
};

exports.removerCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria)
      return res.status(404).json({ erro: "Categoria não encontrada" });
    res.json({ message: "Categoria excluída" });
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao excluir categoria", detalhes: err.message });
  }
};
