// backend/server.js
require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const fs = require("fs");

const app = express();

// Porta
const PORT = process.env.PORT || 5000;

// ================== CRIAR PASTA UPLOADS SE NÃO EXISTIR ==================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Pasta /uploads criada");
} else {
  console.log("✅ Pasta /uploads já existe");
}

// ================== SEGURANÇA E MIDDLEWARE ==================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ================== SERVIÇO DE ARQUIVOS ESTÁTICOS ==================
app.use("/uploads", express.static(uploadsDir));
console.log("✅ Arquivos estáticos: /uploads disponíveis");

app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

// ================== CONFIGURAÇÃO DO MULTER ==================
const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];

// Multer genérico (fallback)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error("Extensão inválida"), null);
    }
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens .jpg, .png e .webp são permitidas."));
    }
  },
});

// Multer com subpastas dinâmicas (/uploads/:tipo/:id)
const storageSub = multer.diskStorage({
  destination: (req, file, cb) => {
    const tipo = req.params.tipo;
    const id = req.params.id;
    if (!tipo || !id || !/^[a-f0-9]{24}$/i.test(id)) {
      return cb(new Error("Parâmetros inválidos"), null);
    }
    if (!["produtos", "categorias"].includes(tipo)) {
      return cb(new Error("Tipo inválido"), null);
    }
    const dest = path.join(uploadsDir, tipo, id);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error("Extensão inválida"), null);
    }
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadSub = multer({
  storage: storageSub,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens .jpg, .png e .webp são permitidas."));
    }
  },
});

// ================== ROTAS DE UPLOAD ==================

// Upload genérico (fallback)
app.post("/api/upload", upload.single("imagem"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Nenhuma imagem enviada" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.post("/api/upload-multiple", upload.array("imagens", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Nenhuma imagem enviada" });
  }
  const urls = req.files.map((file) => `/uploads/${file.filename}`);
  console.log("✅ Upload múltiplo bem-sucedido:", urls);
  res.json({ urls });
});

// Upload com subpasta: /api/upload/:tipo/:id (single)
app.post("/api/upload/:tipo/:id", uploadSub.single("imagem"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Nenhuma imagem enviada" });
  const url = `/uploads/${req.params.tipo}/${req.params.id}/${req.file.filename}`;
  console.log("✅ Upload em subpasta:", url);
  res.json({ url });
});

// Upload múltiplo com subpasta: /api/upload-multiple/:tipo/:id
app.post(
  "/api/upload-multiple/:tipo/:id",
  uploadSub.array("imagens", 10),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }
    const urls = req.files.map(
      (file) => `/uploads/${req.params.tipo}/${req.params.id}/${file.filename}`,
    );
    console.log("✅ Upload múltiplo em subpasta:", urls);
    res.json({ urls });
  },
);

// Exclusão de arquivo de upload
app.delete("/api/upload", (req, res) => {
  const { file: filePath } = req.body;
  if (!filePath || typeof filePath !== "string") {
    return res.status(400).json({ error: "Caminho do arquivo é obrigatório" });
  }
  // Resolve e valida que o arquivo está dentro de uploads
  const absolute = path.resolve(
    uploadsDir,
    filePath.replace(/^\/uploads\//, ""),
  );
  if (!absolute.startsWith(path.resolve(uploadsDir))) {
    return res.status(403).json({ error: "Acesso negado" });
  }
  if (!fs.existsSync(absolute)) {
    return res.status(404).json({ error: "Arquivo não encontrado" });
  }
  try {
    fs.unlinkSync(absolute);
    console.log("🗑️ Arquivo excluído:", absolute);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir arquivo:", err.message);
    res.status(500).json({ error: "Erro ao excluir arquivo" });
  }
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
  });
});

// ================== TRATAMENTO DE ERROS ==================
app.use((err, req, res, next) => {
  console.error("🚨 Erro no upload:", err.message);
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "Arquivo muito grande. Máximo: 5MB." });
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

// ================== ROTA 404 ==================
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

// ================== CONEXÃO COM O BANCO ==================
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Conectado ao MongoDB");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🚀 Backend rodando na porta ${PORT}`);
      console.log(`🔗 Painel admin: http://localhost:${PORT}/admin`);
      console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  });
