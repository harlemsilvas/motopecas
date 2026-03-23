import React, { useEffect, useState } from "react";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    async function fetchUsuarios() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/motopecas/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUsuarios(data);
        else setError(data.error || "Erro ao buscar usuários");
      } catch (err) {
        setError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    }
    fetchUsuarios();
  }, [token]);

  async function handleCadastrar(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/motopecas/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: novoUsuario, password: novaSenha }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Usuário cadastrado!");
        setUsuarios([...usuarios, { username: novoUsuario }]);
        setNovoUsuario("");
        setNovaSenha("");
      } else {
        setError(data.error || "Erro ao cadastrar");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  }

  async function handleExcluir(username) {
    if (!window.confirm(`Excluir usuário ${username}?`)) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/motopecas/api/auth/users/${username}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Usuário excluído!");
        setUsuarios(usuarios.filter((u) => u.username !== username));
      } else {
        setError(data.error || "Erro ao excluir");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Usuários Admin</h2>
      <form
        onSubmit={handleCadastrar}
        className="flex flex-col sm:flex-row gap-2 mb-6"
      >
        <input
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 bg-gray-50"
          type="text"
          placeholder="Novo usuário"
          value={novoUsuario}
          onChange={(e) => setNovoUsuario(e.target.value)}
          required
        />
        <input
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 bg-gray-50"
          type="password"
          placeholder="Senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition"
          type="submit"
        >
          Cadastrar
        </button>
      </form>
      {error && (
        <div className="text-red-600 mb-2 text-sm font-medium">{error}</div>
      )}
      {success && (
        <div className="text-green-600 mb-2 text-sm font-medium">{success}</div>
      )}
      <ul className="divide-y divide-gray-200 bg-gray-50 rounded">
        {loading ? (
          <li className="py-3 text-center text-gray-500">Carregando...</li>
        ) : usuarios.length === 0 ? (
          <li className="py-3 text-center text-gray-400">
            Nenhum usuário cadastrado.
          </li>
        ) : (
          usuarios.map((u) => (
            <li
              key={u.username}
              className="flex justify-between items-center py-3 px-2 hover:bg-gray-100 transition"
            >
              <span className="text-gray-800 font-medium">{u.username}</span>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-semibold text-sm transition"
                onClick={() => handleExcluir(u.username)}
              >
                Excluir
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
