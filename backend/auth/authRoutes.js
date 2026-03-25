//  auth/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("./authController");
const authMiddleware = require("./authMiddleware");

// Permite o primeiro cadastro sem autenticação, exige token para os próximos
const User = require("../models/User");
router.post("/register", async (req, res, next) => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    // Permite cadastro sem token
    return authController.register(req, res, next);
  } else {
    // Exige token para os próximos cadastros
    return authMiddleware(req, res, () =>
      authController.register(req, res, next),
    );
  }
});
router.post("/login", authController.login);

// Rotas protegidas para gerenciamento de usuários
router.get("/users", authMiddleware, authController.listUsers);
router.delete("/users/:username", authMiddleware, authController.deleteUser);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
