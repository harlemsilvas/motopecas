import React, { useEffect, useState, useRef } from "react";
import ProdutoForm from "./ProdutoForm";

const API_URL = import.meta.env.VITE_API_URL || "";
import { getImageUrl, PLACEHOLDER } from "../utils/imageUtils";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [showSituacao, setShowSituacao] = useState(false);
  const [situacao, setSituacao] = useState("ativos");
  const [ordem, setOrdem] = useState("asc");
  const formRef = useRef(null);

  useEffect(() => {
    async function carregarProdutos() {
      setLoading(true);
      try {
        const params = [];
        if (busca) params.push(`nome=${encodeURIComponent(busca)}`);
        // Situação
        if (situacao === "ativos") params.push("ativo=true");
        else if (situacao === "inativos") params.push("ativo=false");
        else if (situacao === "excluidos") params.push("excluido=true");
        // Ordem
        params.push(`ordem=${ordem}`);
        params.push(`page=${page}`);
        params.push(`limit=${limit}`);
        const query = params.length ? `?${params.join("&")}` : "";
        const res = await fetch(`${API_URL}/api/produtos${query}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProdutos(data.produtos || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setLimit(data.limit || 10);
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
    // eslint-disable-next-line
  }, [busca, situacao, ordem, page, limit]);

  async function handleSubmit(produto) {
    let imagensUrls = [];
    let produtoId = editando ? editando._id : null;
    let novoProduto = null;

    // 1. Se for novo produto, cria primeiro para obter o _id real
    if (!editando) {
      try {
        const res = await fetch(`${API_URL}/api/produtos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...produto,
            imagens: [], // não envia imagens ainda
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        novoProduto = await res.json();
        produtoId = novoProduto._id;
      } catch (err) {
        alert("Erro ao criar produto: " + err.message);
        return;
      }
    }

    // 2. Se houver imagens, separar novas (File) das antigas (string)
    let imagensAntigas = [];
    let imagensNovas = [];
    if (produto.imagens && produto.imagens.length > 0) {
      for (const img of produto.imagens) {
        if (img instanceof File) {
          imagensNovas.push(img);
        } else if (typeof img === "string") {
          imagensAntigas.push(img);
        }
      }
    }

    // Upload das novas imagens, se houver
    if (imagensNovas.length > 0 && (editando || produtoId)) {
      try {
        const fd = new FormData();
        for (const img of imagensNovas) {
          fd.append("imagens", img);
        }
        const upRes = await fetch(
          `${API_URL}/api/upload-multiple/produtos/${editando ? editando._id : produtoId}`,
          {
            method: "POST",
            body: fd,
          },
        );
        if (!upRes.ok) throw new Error("Falha no upload das imagens");
        const result = await upRes.json();
        imagensUrls = [...imagensAntigas, ...(result.urls || [])];
      } catch (err) {
        alert("Erro ao enviar imagens: " + err.message);
        return;
      }
    } else {
      imagensUrls = imagensAntigas;
    }

    // 3. Atualiza o produto com as URLs das imagens
    try {
      // Corrige campos de preço para Number e troca vírgula por ponto
      const parsePreco = (val) => {
        if (typeof val === "string") {
          const limpo = val.replace(/[^\d,.]/g, "").replace(",", ".");
          return limpo ? Number(limpo) : undefined;
        }
        return typeof val === "number" ? val : undefined;
      };
      const produtoCorrigido = {
        ...produto,
        preco: parsePreco(produto.preco),
        precoPromocional: parsePreco(produto.precoPromocional),
        imagens: imagensUrls,
      };
      const idParaAtualizar = editando ? editando._id : produtoId;
      const res = await fetch(`${API_URL}/api/produtos/${idParaAtualizar}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produtoCorrigido),
      });
      let atualizado;
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson && (errJson.erro || errJson.detalhes)) {
            msg += `\n${errJson.erro || ""}`;
            if (errJson.detalhes) msg += `\n${errJson.detalhes}`;
          }
        } catch {}
        alert("Erro ao salvar produto: " + msg);
        return;
      }
      atualizado = await res.json();
      if (editando) {
        setProdutos(
          produtos.map((p) => (p._id === editando._id ? atualizado : p)),
        );
        setEditando(null);
      } else {
        setProdutos([
          ...produtos,
          {
            ...atualizado,
            categorias: categorias.filter((c) =>
              (produto.categorias || []).includes(c._id),
            ),
          },
        ]);
      }
    } catch (err) {
      alert("Erro ao salvar produto: " + err.message);
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
      {/* Barra de busca e filtros, modelo visual novo */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            className="border p-2 rounded w-full md:w-96 text-gray-900"
            placeholder="Pesquise pelo produto"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPage(1);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") setPage(1);
            }}
          />
          <button
            className="p-2 bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => setPage(1)}
            title="Buscar"
          >
            <span role="img" aria-label="Buscar">
              🔍
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`px-3 py-1 rounded-full border ${showSituacao ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
            onClick={() => setShowSituacao((v) => !v)}
          >
            produtos ativos
          </button>
          <button
            className="px-3 py-1 rounded-full border bg-gray-100 text-gray-800"
            onClick={() => {
              setBusca("");
              setSituacao("ativos");
              setPage(1);
              setShowSituacao(false);
            }}
          >
            limpar filtros
          </button>
          {/* Botão de ordenação */}
          <button
            className="px-3 py-1 rounded-full border bg-gray-100 text-gray-800 flex items-center gap-1"
            onClick={() => setOrdem(ordem === "asc" ? "desc" : "asc")}
            title="Ordenar por nome"
          >
            <span style={{ fontSize: "1.1em" }}>
              {ordem === "asc" ? "↓" : "↑"}
            </span>{" "}
            nome
          </button>
        </div>
        {/* Frame/Div de Situação */}
        {showSituacao && (
          <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4 max-w-xl mx-auto">
            <div className="font-medium text-gray-700 mb-2">Situação</div>
            <div className="flex gap-2 flex-wrap">
              <button
                className={`px-3 py-1 rounded-full border ${situacao === "todos" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                onClick={() => {
                  setSituacao("todos");
                  setPage(1);
                  setShowSituacao(false);
                }}
              >
                sem filtro
              </button>
              <button
                className={`px-3 py-1 rounded-full border ${situacao === "ativos" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                onClick={() => {
                  setSituacao("ativos");
                  setPage(1);
                  setShowSituacao(false);
                }}
              >
                ativos
              </button>
              <button
                className={`px-3 py-1 rounded-full border ${situacao === "inativos" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                onClick={() => {
                  setSituacao("inativos");
                  setPage(1);
                  setShowSituacao(false);
                }}
              >
                inativos
              </button>
              <button
                className={`px-3 py-1 rounded-full border ${situacao === "excluidos" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                onClick={() => {
                  setSituacao("excluidos");
                  setPage(1);
                  setShowSituacao(false);
                }}
              >
                excluídos
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">{total}</span>
          <span className="text-gray-400 text-xs">quantidade</span>
        </div>
      </div>
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
          <>
            <table>
              <thead>
                <tr>
                  <th className="text-left text-md font-bold mb-4 text-gray-800">
                    Produto
                  </th>
                  <th className="text-left text-md font-bold mb-4 text-gray-800">
                    Preço
                  </th>
                  <th className="text-left text-md font-bold mb-4 text-gray-800">
                    Item do Dia
                  </th>
                  <th className="text-md font-bold mb-4 text-gray-800">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(p.imagens?.[0] || null)}
                          alt={p.nome}
                          className="w-12 h-12 object-cover rounded border"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER;
                          }}
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
            {/* Paginação */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded border bg-gray-100 text-gray-800"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`px-3 py-1 rounded ${n === page ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                  onClick={() => setPage(n)}
                >
                  {n.toString().padStart(2, "0")}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded border bg-gray-100 text-gray-800"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                →
              </button>
              <span className="ml-4 text-gray-500 text-sm">{total}</span>
              <span className="text-gray-400 text-xs">total</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
