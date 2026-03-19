// backend/models/Categoria.js
const mongoose = require("mongoose");

const categoriaSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  descricao: String,
  imagem: String, // URL da imagem da categoria
  ordem: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Categoria", categoriaSchema);
