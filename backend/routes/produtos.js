// backend/routes/produtos.js
const express = require("express");
const router = express.Router();
const Produto = require("../models/Produto");

// Listar produtos (com categorias populadas)
router.get("/", async (req, res) => {
  try {
    const produtos = await Produto.find().populate("categorias", "nome imagem");
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar por ID
router.get("/:id", async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id).populate(
      "categorias",
      "nome imagem"
    );
    if (!produto)
      return res.status(404).json({ error: "Produto não encontrado" });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar produto
router.post("/", async (req, res) => {
  try {
    const produto = new Produto(req.body);
    await produto.save();
    res.status(201).json(produto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar produto
router.put("/:id", async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("categorias", "nome imagem");
    if (!produto)
      return res.status(404).json({ error: "Produto não encontrado" });
    res.json(produto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir produto
router.delete("/:id", async (req, res) => {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);
    if (!produto)
      return res.status(404).json({ error: "Produto não encontrado" });
    res.json({ message: "Produto excluído" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
