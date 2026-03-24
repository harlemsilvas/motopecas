import React, { useEffect, useState, useRef } from "react";
import ProdutoForm from "./ProdutoForm";

const API_URL = import.meta.env.VITE_API_URL || "";

import { getImageUrl } from "../utils/imageUtils";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [mostrarAtivos, setMostrarAtivos] = useState(true);
  const [ordem, setOrdem] = useState("asc"); // ascendente por padrão
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    async function carregarProdutos() {
      setLoading(true);
      try {
        let url = `${API_URL}/api/produtos`;
        const params = [];
        if (mostrarAtivos) params.push("ativo=true");
        if (ordem) params.push(`ordem=${ordem}`);
        params.push(`page=${page}`);
        params.push(`limit=${limit}`);
        if (params.length > 0) url += "?" + params.join("&");
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProdutos(data.produtos || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
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

  useEffect(() => {
    async function carregarProdutos() {
      setLoading(true);
      try {
        let url = `${API_URL}/api/produtos`;
        const params = [];
        if (mostrarAtivos) params.push("ativo=true");
        if (ordem) params.push(`ordem=${ordem}`);
        params.push(`page=${page}`);
        params.push(`limit=${limit}`);
        if (params.length > 0) url += "?" + params.join("&");
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProdutos(data.produtos || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setErro("");
      } catch (err) {
        setErro("Falha ao carregar produtos: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    carregarProdutos();
    // eslint-disable-next-line
  }, [mostrarAtivos, ordem, page]);
  function handlePageChange(novaPagina) {
    if (novaPagina >= 1 && novaPagina <= totalPages) setPage(novaPagina);
  }
  function handleOrdemChange(e) {
    setOrdem(e.target.value);
  }
  // Filtro de ativos
  function handleFiltroAtivos(e) {
    setMostrarAtivos(e.target.checked);
  }

  async function handleSubmit(produto) {
    let imagensUrls = [];
    // Se houver imagens (FileList), faz upload
    if (
      produto.imagens &&
      produto.imagens.length > 0 &&
      produto.imagens[0] instanceof File
    ) {
      try {
        // Para novo produto, precisamos de um id temporário (pois não existe no banco ainda)
        const produtoId = editando
          ? editando._id
          : Math.random().toString(36).slice(2);
        const fd = new FormData();
        for (const img of produto.imagens) {
          fd.append("imagens", img);
        }
        const upRes = await fetch(
          `${API_URL}/api/upload-multiple/produtos/${produtoId}`,
          {
            method: "POST",
            body: fd,
          },
        );
        if (!upRes.ok) throw new Error("Falha no upload das imagens");
        const result = await upRes.json();
        imagensUrls = result.urls || [];
        produto.imagens = imagensUrls;
        // Se for novo, salva o id temporário para o produto
        if (!editando) produto._id = produtoId;
      } catch (err) {
        alert("Erro ao enviar imagens: " + err.message);
        return;
      }
    }
    // Remove arquivos File do produto antes de enviar para API
    if (produto.imagens && produto.imagens[0] instanceof File) {
      produto.imagens = imagensUrls;
    }
    if (editando) {
      try {
        const res = await fetch(`${API_URL}/api/produtos/${editando._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(produto),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const atualizado = await res.json();
        setProdutos(
          produtos.map((p) => (p._id === editando._id ? atualizado : p)),
        );
        setEditando(null); // Limpa o formulário após salvar
      } catch (err) {
        alert("Erro ao atualizar produto: " + err.message);
      }
    } else {
      // POST real para criar produto
      try {
        const res = await fetch(`${API_URL}/api/produtos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(produto),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const novo = await res.json();
        setProdutos([
          ...produtos,
          {
            ...novo,
            categorias: categorias.filter((c) =>
              produto.categorias.includes(c._id),
            ),
          },
        ]);
      } catch (err) {
        alert("Erro ao criar produto: " + err.message);
      }
    }
  }

  function handleEditar(produto) {
    setEditando(produto);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
  }

  function handleExcluir(id) {
    if (window.confirm("Excluir este produto?")) {
      setProdutos(produtos.filter((p) => p._id !== id));
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div ref={formRef} />
      <ProdutoForm
        onSubmit={handleSubmit}
        categorias={categorias}
        produto={editando}
        onCancel={() => setEditando(null)}
      />
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            checked={mostrarAtivos}
            onChange={handleFiltroAtivos}
          />
          Exibir apenas produtos ativos
        </label>
        <label className="flex items-center gap-2 text-gray-600">
          <span>Ordem:</span>
          <select
            value={ordem}
            onChange={handleOrdemChange}
            className="border rounded px-2 py-1 text-sm"
            style={{ width: 36 }}
            title="Ordenar por nome"
          >
            <option value="asc">▲</option>
            <option value="desc">▼</option>
          </select>
        </label>
      </div>
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-500">
            Exibindo página {page} de {totalPages} ({total} produtos)
          </div>
          <div className="flex gap-1">
            <button
              className="px-2 py-1 text-sm border rounded disabled:opacity-50 text-gray-600"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              ◀
            </button>
            <span className="px-2 py-1 text-sm text-gray-800">{page}</span>
            <button
              className="px-2 py-1 text-sm border rounded disabled:opacity-50 text-gray-600"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              ▶
            </button>
          </div>
        </div>
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
                <th className="text-center text-gray-600 font-medium">
                  <span>Produto</span>
                  <button
                    type="button"
                    className="ml-1 text-xs px-1 py-0.5 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 transition"
                    title={ordem === "asc" ? "Ordenar Z-A" : "Ordenar A-Z"}
                    onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
                  >
                    {ordem === "asc" ? "▲" : "▼"}
                  </button>
                </th>
                <th className="text-left text-gray-600 font-medium">Preço</th>
                <th className="text-left text-gray-600 font-medium">
                  Item do Dia
                </th>
                <th className="text-left text-gray-600 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(
                          p.imagens?.[0] || "/motopecas/sem-imagem.png",
                        )}
                        alt={p.nome}
                        className="w-12 h-12 object-cover rounded border"
                        onError={(e) =>
                          (e.target.src = getImageUrl(
                            "/motopecas/sem-imagem.png",
                          ))
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
