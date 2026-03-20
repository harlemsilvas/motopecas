// backend/models/SiteConfig.js
const mongoose = require("mongoose");

const siteConfigSchema = new mongoose.Schema({
  // Header / Hero
  header: {
    titulo: { type: String, default: "MotoSpeed" },
    tituloDestaque: { type: String, default: "Speed" },
    slogan: {
      type: String,
      default: "As melhores peças com os melhores preços.",
    },
    imagemFundo: { type: String, default: "" },
  },

  // Footer
  footer: {
    endereco: { type: String, default: "Rua das Motos, 123 - Centro" },
    cidade: { type: String, default: "São Paulo - SP" },
    telefone1: { type: String, default: "(11) 11111-1111" },
    telefone2: { type: String, default: "(11) 3333-4444" },
    whatsapp: { type: String, default: "551111111111" },
    instagram: { type: String, default: "https://instagram.com/motopecas" },
    horarios: {
      semana: { type: String, default: "Seg-Sex: 8h às 18h" },
      sabado: { type: String, default: "Sábado: 9h às 13h" },
      domingo: { type: String, default: "Domingo: Fechado" },
    },
    copyright: { type: String, default: "MotoSpeed Peças" },
  },

  // Exibição
  display: {
    maxProdutosPorSecao: { type: Number, default: 12 },
    randomizarProdutos: { type: Boolean, default: false },
  },

  updatedAt: { type: Date, default: Date.now },
});

// Garantir apenas 1 documento de config
siteConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model("SiteConfig", siteConfigSchema);
