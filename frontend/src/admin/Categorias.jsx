import React, { useEffect, useState } from "react";
import CategoriaForm from "./CategoriaForm";

// API_URL removido, use apenas '/api/...'

function apiImg(path) {
  if (
    !path ||
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  )
    return path || "";
  return path;
}

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    async function carregarCategorias() {
      setLoading(true);
      try {
        const res = await fetch(`/api/categorias`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCategorias(data);
        setErro("");
      } catch (err) {
        setErro("Falha ao carregar categorias: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    carregarCategorias();
  }, []);

  function handleSubmit(categoria) {
    if (editando) {
      setCategorias(
        categorias.map((c) =>
          c._id === editando._id ? { ...editando, ...categoria } : c,
        ),
      );
      setEditando(null);
    } else {
      setCategorias([
        ...categorias,
        {
          ...categoria,
          _id: Math.random().toString(36).slice(2),
          produtos: [],
        },
      ]);
    }
  }

  function handleEditar(categoria) {
    setEditando(categoria);
  }

  function handleExcluir(id) {
    if (window.confirm("Excluir esta categoria?")) {
      setCategorias(categorias.filter((c) => c._id !== id));
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <CategoriaForm
        onSubmit={handleSubmit}
        categoria={editando}
        onCancel={() => setEditando(null)}
      />
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Categorias Cadastradas
        </h2>
        {loading ? (
          <div>Carregando categorias...</div>
        ) : erro ? (
          <div className="text-red-600">{erro}</div>
        ) : categorias.length === 0 ? (
          <div className="text-gray-400 py-8 text-center">
            Nenhuma categoria cadastrada.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Ordem</th>
                <th>Status</th>
                <th>Produtos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr
                  key={cat._id}
                  className={`hover:bg-gray-50 transition${cat.ativa === false ? " opacity-50" : ""}`}
                >
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      {cat.imagem ? (
                        <img
                          src={cat.imagem}
                          alt={cat.nome}
                          className="w-10 h-10 object-cover rounded border"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-lg">
                          📁
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{cat.nome}</p>
                        <p className="text-xs text-gray-400">
                          {cat.descricao || "Sem descrição"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {cat.ordem ?? 0}
                  </td>
                  <td className="py-3 text-sm">
                    {cat.ativa !== false ? (
                      <span className="text-green-600 font-medium">Ativa</span>
                    ) : (
                      <span className="text-gray-400">Oculta</span>
                    )}
                  </td>
                  <td className="py-3 text-sm text-gray-400">
                    {(cat.produtos || []).length} produto(s)
                  </td>
                  <td className="py-3 text-sm">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium mr-3 text-sm"
                      onClick={() => handleEditar(cat)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                      onClick={() => handleExcluir(cat._id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
