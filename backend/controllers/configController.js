// backend/controllers/configController.js
const SiteConfig = require("../models/SiteConfig");

exports.obterConfig = async (req, res) => {
  try {
    const config = await SiteConfig.getConfig();
    res.json(config);
  } catch (err) {
    res
      .status(500)
      .json({ erro: "Erro ao obter configurações", detalhes: err.message });
  }
};

exports.atualizarConfig = async (req, res) => {
  try {
    const config = await SiteConfig.getConfig();

    // Atualiza campos aninhados sem sobrescrever todo o subdocumento
    const campos = ["header", "footer", "display"];
    for (const campo of campos) {
      if (req.body[campo]) {
        if (campo === "footer" && req.body.footer.horarios) {
          Object.assign(config.footer.horarios, req.body.footer.horarios);
          delete req.body.footer.horarios;
        }
        Object.assign(config[campo], req.body[campo]);
      }
    }

    config.updatedAt = new Date();
    await config.save();
    res.json(config);
  } catch (err) {
    res.status(400).json({
      erro: "Erro ao atualizar configurações",
      detalhes: err.message,
    });
  }
};
