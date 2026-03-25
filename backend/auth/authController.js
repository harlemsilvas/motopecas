// auth/AuthController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// 🔒 ME (faltava)
exports.me = (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao validar usuário." });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username createdAt");
    res.json(users);
  } catch {
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({
      username: req.params.username,
    });

    if (!deleted)
      return res.status(404).json({ error: "Usuário não encontrado." });

    res.json({ message: "Usuário excluído" });
  } catch {
    res.status(500).json({ error: "Erro ao excluir usuário." });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Dados obrigatórios" });

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: "Usuário já existe" });

    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ message: "Usuário criado" });
  } catch {
    res.status(500).json({ error: "Erro no cadastro" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true em produção HTTPS
      sameSite: "lax", // 🔥 IMPORTANTE
      path: "/", // 🔥 ADICIONE ISSO
    });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro no login" });
  }
};
