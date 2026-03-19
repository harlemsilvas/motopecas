// server.js
require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const app = express();

// Porta
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ================== SERVIÇO DE ARQUIVOS ESTÁTICOS ==================
// Servir uploads (IMPERATIVO: antes das rotas)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("✅ Pasta /uploads disponível em /uploads");

// Servir arquivos estáticos (inclui favicon.ico)
app.use(express.static(path.join(__dirname, "public")));

// Servir painel admin
app.use("/admin", express.static(path.join(__dirname, "admin")));
console.log("✅ Painel admin disponível em /admin");

// ================== CONFIGURAÇÃO DO MULTER (UPLOAD) ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    if (!validExtensions.includes(ext)) {
      return cb(
        new Error("Extensão inválida. Use: .jpg, .jpeg, .png, .webp"),
        null,
      );
    }

    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens .jpg, .png e .webp são permitidas."));
    }
  },
});

// ================== ROTAS DE UPLOAD ==================
// Upload único
app.post("/api/upload", upload.single("imagem"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhuma imagem enviada" });
  }
  res.json({
    url: `/uploads/${req.file.filename}`,
  });
});

// Upload múltiplo
app.post("/api/upload-multiple", upload.array("imagens", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Nenhuma imagem enviada" });
  }
  const urls = req.files.map((file) => `/uploads/${file.filename}`);
  res.json({ urls });
});

// ================== ROTAS DA API ==================
app.use("/api/produtos", require("./routes/produtos"));
app.use("/api/categorias", require("./routes/categorias"));

// ================== ROTA RAIZ ==================
app.get("/", (req, res) => {
  res.json({
    message: "API MotoPeças está funcionando",
    admin: `http://localhost:${PORT}/admin`,
    uploads: `/uploads`,
    docs: "https://github.com/harlemsilvas/motopecas",
  });
});

// ================== TRATAMENTO DE ERROS DO MULTER ==================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "Arquivo muito grande. Máximo: 5MB." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "Campo de arquivo inválido." });
    }
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  }
  if (
    err.message.includes("Extensão") ||
    err.message.includes("Apenas imagens")
  ) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// ================== CONEXÃO COM O BANCO ==================
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch((err) => console.error("❌ Erro ao conectar ao MongoDB:", err));

// ================== SERVIDOR ==================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Backend rodando na porta ${PORT}`);
  console.log(`🔗 Painel admin: http://localhost:${PORT}/admin`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`📄 Documentação: http://localhost:${PORT}/`);
});
