// backend/routes/categorias.js
const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoriaController");

router.get("/", categoriaController.listarCategorias);
router.get("/:id", categoriaController.obterCategoriaPorId);
router.post("/", categoriaController.criarCategoria);
router.put("/:id", categoriaController.atualizarCategoria);
router.delete("/:id", categoriaController.removerCategoria);

module.exports = router;
