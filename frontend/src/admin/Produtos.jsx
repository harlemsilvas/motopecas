import React, { useEffect, useState } from "react";
import ProdutoForm from "./ProdutoForm";

const _path = window.location.pathname;
const _adminIdx = _path.indexOf("/admin");
const API_URL = _adminIdx > 0 ? _path.substring(0, _adminIdx) : "";

function apiImg(path) {
  if (
    !path ||
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  )
    return path || "";
  return API_URL + path;
}

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    async function carregarProdutos() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/produtos`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProdutos(data);
        setErro("");
      } catch (err) {
        setErro("Falha ao carregar produtos: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    async function carregarCategorias() {
      try {
        const res = await fetch(`${API_URL}/api/categorias`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCategorias(data);
      } catch {}
    }
    carregarProdutos();
    carregarCategorias();
  }, []);

  function handleSubmit(produto) {
    // Aqui você pode implementar POST/PUT para cadastrar/editar
    // Por enquanto, só simula e reseta edição
    if (editando) {
      setProdutos(
        produtos.map((p) =>
          p._id === editando._id ? { ...editando, ...produto } : p,
        ),
      );
      setEditando(null);
    } else {
      setProdutos([
        ...produtos,
        {
          ...produto,
          _id: Math.random().toString(36).slice(2),
          categorias: categorias.filter((c) =>
            produto.categorias.includes(c._id),
          ),
        },
      ]);
    }
  }

  function handleEditar(produto) {
    setEditando(produto);
  }

  function handleExcluir(id) {
    if (window.confirm("Excluir este produto?")) {
      setProdutos(produtos.filter((p) => p._id !== id));
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <ProdutoForm
        onSubmit={handleSubmit}
        categorias={categorias}
        produto={editando}
        onCancel={() => setEditando(null)}
      />
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Produtos Cadastrados
        </h2>
        {loading ? (
          <div>Carregando produtos...</div>
        ) : erro ? (
          <div className="text-red-600">{erro}</div>
        ) : produtos.length === 0 ? (
          <div className="text-gray-400 py-8 text-center">
            Nenhum produto cadastrado.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Produto</th>
                <th className="text-left">Preço</th>
                <th className="text-left">Item do Dia</th>
                <th className="text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={apiImg(p.imagens?.[0] || "/sem-imagem.png")}
                        alt={p.nome}
                        className="w-12 h-12 object-cover rounded border"
                        onError={(e) =>
                          (e.target.src = apiImg("/sem-imagem.png"))
                        }
                      />
                      <div>
                        <p className="font-medium text-gray-800">{p.nome}</p>
                        <p className="text-xs text-gray-400">
                          {(p.categorias || [])
                            .map((c) => c.nome || "—")
                            .join(", ") || "Sem categoria"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-700">
                    {p.precoPromocional ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">
                          R$ {Number(p.preco).toFixed(2)}
                        </span>
                        <span className="text-green-600 font-semibold">
                          R$ {Number(p.precoPromocional).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      `R$ ${Number(p.preco).toFixed(2)}`
                    )}
                  </td>
                  <td className="py-3 text-sm">
                    {p.itemDoDia ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        ★ Sim
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Não</span>
                    )}
                  </td>
                  <td className="py-3 text-sm">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium mr-3 text-sm"
                      onClick={() => handleEditar(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                      onClick={() => handleExcluir(p._id)}
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
