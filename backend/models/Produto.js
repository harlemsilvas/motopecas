// backend/models/Produto.js
const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  precoPromocional: { type: Number },
  descricao: String,
  imagens: [{ type: String, required: true }], // URLs das imagens
  itemDoDia: { type: Boolean, default: false },
  // ✅ Relacionamento: produto pode pertencer a várias categorias
  categorias: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      default: [],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Produto", produtoSchema);
