// backend/routes/config.js
const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

router.get("/", configController.obterConfig);
router.put("/", configController.atualizarConfig);

module.exports = router;
