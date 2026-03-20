// backend/routes/produtos.js
const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");

router.get("/", produtoController.listarProdutos);
router.get("/:id", produtoController.obterProdutoPorId);
router.post("/", produtoController.criarProduto);
router.put("/:id", produtoController.atualizarProduto);
router.delete("/:id", produtoController.removerProduto);

module.exports = router;
