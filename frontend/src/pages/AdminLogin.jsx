// frontend/src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importe o useNavigate

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "";
  console.log("🚀 ~ AdminLogin ~ env.VITE_API_URL:", API_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/admin");
      } else {
        setError(data.error || "Erro ao logar");
      }
    } catch {
      setError("Erro de conexão");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-600 text-center">
          Login Admin
        </h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário"
          className="border rounded px-3 py-2 text-gray-600"
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Entrar
        </button>
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
      </form>
    </div>
  );
}
