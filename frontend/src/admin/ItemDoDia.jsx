import React, { useEffect, useState } from "react";
import ProdutoForm from "./ProdutoForm";

const API_URL = import.meta.env.VITE_API_URL || "";

import { getImageUrl, PLACEHOLDER } from "../utils/imageUtils";

export default function ItemDoDia() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("ativos");
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    async function carregarItensDoDia() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/produtos?itemDoDia=true`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProdutos(data.produtos || []);
        setErro("");
      } catch (err) {
        setErro("Falha ao carregar itens do dia: " + err.message);
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
    carregarItensDoDia();
    carregarCategorias();
  }, []);

  function handleEditar(produto) {
    setEditando(produto);
  }

  function handleSalvarEdicao(produtoEditado) {
    setProdutos(
      produtos.map((p) =>
        p._id === produtoEditado._id ? { ...p, ...produtoEditado } : p,
      ),
    );
    setEditando(null);
  }

  function handleRemover(id) {
    if (window.confirm("Remover este produto do Item do Dia?")) {
      setProdutos(produtos.filter((p) => p._id !== id));
    }
  }

  // Filtro de produtos
  const produtosFiltrados = produtos.filter((p) => {
    if (filtroAtivo === "ativos") return p.ativo !== false;
    if (filtroAtivo === "inativos") return p.ativo === false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="mb-4 flex items-center gap-2">
          {/* <label className="font-medium bg- text-gray-600">Filtrar:</label>
          <select
            value={filtroAtivo}
            onChange={(e) => setFiltroAtivo(e.target.value)}
            className="border p-1 rounded text-gray-600"
          >
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
            <option value="todos">Todos</option>
          </select> */}
        </div>
        <h2 className="text-lg font-bold mb-4 text-gray-950">Itens do Dia</h2>
        {loading ? (
          <div>Carregando itens do dia...</div>
        ) : erro ? (
          <div className="text-red-600">{erro}</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-gray-400 py-8 text-center">
            Nenhum item do dia definido.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-lg font-bold mb-4 text-gray-950">
                  Produto
                </th>
                <th className="text-lg font-bold mb-4 text-gray-950">Preço</th>
                <th className="text-lg font-bold mb-4 text-gray-950">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(p.imagens?.[0] || null)}
                        alt={p.nome}
                        className="w-12 h-12 object-cover rounded border"
                        onError={(e) => {
                          // Usa o PLACEHOLDER SVG inline
                          e.target.src = PLACEHOLDER;
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-800">{p.nome}</p>
                        <p className="text-xs text-gray-400">
                          {p.descricao
                            ? p.descricao.substring(0, 60) +
                              (p.descricao.length > 60 ? "..." : "")
                            : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-700">
                    {p.precoPromocional ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">
                          R$ {p.preco.toFixed(2)}
                        </span>
                        <span className="text-green-600 font-semibold">
                          R$ {p.precoPromocional.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      `R$ ${p.preco.toFixed(2)}`
                    )}
                  </td>
                  <td className="py-3 text-sm">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium mr-3 text-sm"
                      onClick={() => handleEditar(p)}
                    >
                      Editar Produto
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                      onClick={() => handleRemover(p._id)}
                    >
                      Remover do Dia
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {editando && (
        <div className="mt-8">
          <ProdutoForm
            produto={editando}
            categorias={categorias}
            onSubmit={handleSalvarEdicao}
            onCancel={() => setEditando(null)}
          />
        </div>
      )}
    </div>
  );
}
