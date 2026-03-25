require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const app = express();
const produtosRoutes = require("./routes/produtos");

const PORT = process.env.PORT || 5000;

// ================== CRIAR PASTA UPLOADS ==================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ================== SEGURANÇA ==================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
  }),
);

// 🔒 RATE LIMIT
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: "Limite de cadastros atingido." },
});

// 🔥 APLICAÇÃO DO RATE LIMIT
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", registerLimiter);

// 🔒 CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://hrmmotos.com.br"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ================== STATIC ==================
app.use("/uploads", express.static(uploadsDir));
app.use(express.static(path.join(__dirname, "public")));

// ================== AUTH ==================
const authMiddleware = require("./auth/authMiddleware");

app.use(
  "/admin",
  authMiddleware,
  express.static(path.join(__dirname, "admin")),
);

// ================== MULTER ==================
const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];

function isValidImage(file) {
  return file.mimetype.startsWith("image/");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext) || !isValidImage(file)) {
      return cb(new Error("Arquivo inválido"), null);
    }
    cb(null, `${Date.now()}-${Math.random()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 🔥 reduzido
});

// ================== UPLOAD ==================
app.post("/api/upload", upload.single("imagem"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "Nenhuma imagem enviada" });

  res.json({ url: `/uploads/${req.file.filename}` });
});

// ================== ROTAS ==================
app.use("/api/auth", require("./auth/authRoutes"));
app.use("/api/produtos", produtosRoutes);
app.use("/api/categorias", require("./routes/categorias"));
app.use("/api/config", require("./routes/config"));

// ================== ROOT ==================
app.get("/", (req, res) => {
  res.json({ message: "API rodando" });
});

// ================== ERROS ==================
app.use((err, req, res, next) => {
  console.error("Erro:", err.message);
  res.status(500).json({ error: "Erro interno" });
});

// ================== 404 ==================
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

// ================== DB ==================
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
