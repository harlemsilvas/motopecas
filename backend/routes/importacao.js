// Endpoint para importação em lote de produtos via CSV
const express = require("express");
const router = express.Router();
const Produto = require("../models/Produto");
const Categoria = require("../models/Categoria");

// POST /api/produtos/importar
router.post("/importar", async (req, res) => {
  try {
    const produtos = req.body;
    if (!Array.isArray(produtos)) {
      return res.status(400).json({ erro: "Formato inválido" });
    }
    const erros = [];
    const inseridos = [];
    for (let i = 0; i < produtos.length; i++) {
      const p = produtos[i];
      // Validação básica
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
      // Imagens
      const imagens = p.imagens
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      // Cria produto
      try {
        const novo = new Produto({
          nome: p.nome,
          preco: Number(p.preco),
          precoPromocional: p.precoPromocional
            ? Number(p.precoPromocional)
            : undefined,
          descricao: p.descricao,
          imagens,
          categorias: categoriaIds,
          itemDoDia: p.itemDoDia === "true" || p.itemDoDia === true,
          ativo: p.ativo === "true" || p.ativo === true,
        });
        await novo.save();
        inseridos.push(novo._id);
      } catch (err) {
        erros.push({ linha: i + 2, erro: err.message });
      }
    }
    res.json({ inseridos, erros });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
