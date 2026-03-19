// backend/routes/categorias.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose"); // ✅ Importe o mongoose
const Categoria = require("../models/Categoria");
const Produto = require("../models/Produto");

// Listar categorias com seus produtos
router.get("/", async (req, res) => {
  try {
    const categorias = await Categoria.find().sort("ordem");
    const categoriasComProdutos = await Promise.all(
      categorias.map(async (cat) => {
        const produtos = await Produto.find({ categorias: cat._id }).populate(
          "categorias",
          "nome"
        );
        return { ...cat._doc, produtos };
      })
    );
    res.json(categoriasComProdutos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === ROTA: Buscar categoria por ID ===
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Valida se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const categoria = await Categoria.findById(id);

    if (!categoria) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json(categoria);
  } catch (err) {
    console.error("Erro ao buscar categoria por ID:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Criar categoria
router.post("/", async (req, res) => {
  try {
    const categoria = new Categoria(req.body);
    await categoria.save();
    res.status(201).json(categoria);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar categoria
router.put("/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!categoria)
      return res.status(404).json({ error: "Categoria não encontrada" });
    res.json(categoria);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Excluir categoria
router.delete("/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria)
      return res.status(404).json({ error: "Categoria não encontrada" });
    res.json({ message: "Categoria excluída" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
