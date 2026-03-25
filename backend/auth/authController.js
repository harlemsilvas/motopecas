// auth/AuthController.js
// Listar todos os usuários (exceto senha)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

// Excluir usuário por username
exports.deleteUser = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username)
      return res.status(400).json({ error: "Usuário não informado." });
    const deleted = await User.findOneAndDelete({ username });
    if (!deleted)
      return res.status(404).json({ error: "Usuário não encontrado." });
    res.json({ message: "Usuário excluído com sucesso." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir usuário." });
  }
};
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Usuário e senha obrigatórios." });
    const userExists = await User.findOne({ username });
    if (userExists)
      return res.status(409).json({ error: "Usuário já existe." });
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "Usuário criado com sucesso." });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" },
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Erro ao fazer login." });
  }
};
