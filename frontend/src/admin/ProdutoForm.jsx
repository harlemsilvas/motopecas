import React, { useState, useEffect } from "react";

export default function ProdutoForm({
  onSubmit,
  categorias,
  produto,
  onCancel,
}) {
  // Para resetar o input file
  const [fileInputKey, setFileInputKey] = useState(0);
  const [nome, setNome] = useState(produto?.nome || "");
  const [preco, setPreco] = useState(produto?.preco || "");
  const [precoPromocional, setPrecoPromocional] = useState(
    produto?.precoPromocional || "",
  );
  const [descricao, setDescricao] = useState(produto?.descricao || "");
  const [cats, setCats] = useState(
    produto?.categorias?.map((c) => c._id) || [],
  );
  const [itemDoDia, setItemDoDia] = useState(produto?.itemDoDia || false);
  // imagens: pode ser File (novas) ou string (URL de já salvas)
  const [imagens, setImagens] = useState(produto?.imagens || []);
  const [ativo, setAtivo] = useState(
    produto?.ativo !== undefined ? produto.ativo : true,
  );

  useEffect(() => {
    if (produto) {
      setNome(produto.nome || "");
      setPreco(produto.preco || "");
      setPrecoPromocional(produto.precoPromocional || "");
      setDescricao(produto.descricao || "");
      setCats(produto.categorias?.map((c) => c._id) || []);
      setItemDoDia(produto.itemDoDia || false);
      setAtivo(produto?.ativo !== undefined ? produto.ativo : true);
      setImagens(produto.imagens || []);
    } else {
      // Limpa o formulário quando produto volta a ser null
      setNome("");
      setPreco("");
      setPrecoPromocional("");
      setDescricao("");
      setCats([]);
      setItemDoDia(false);
      setImagens([]);
      setAtivo(true);
    }
    // Sempre que trocar de produto, reseta o input file
    setFileInputKey((k) => k + 1);
  }, [produto]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      nome,
      preco,
      precoPromocional,
      descricao,
      categorias: cats,
      itemDoDia,
      imagens,
      ativo,
    });
  }

  // Funções para thumbs
  function handleThumbDelete(idx) {
    setImagens((imgs) => imgs.filter((_, i) => i !== idx));
  }

  function handleThumbMove(idx, dir) {
    setImagens((imgs) => {
      const novo = [...imgs];
      const alvo = idx + dir;
      if (alvo < 0 || alvo >= imgs.length) return imgs;
      [novo[idx], novo[alvo]] = [novo[alvo], novo[idx]];
      return novo;
    });
  }

  // Função para obter URL da imagem (File ou string)
  function getThumbUrl(img) {
    if (typeof img === "string") {
      // Caminho salvo no banco, já padronizado para /motopecas/uploads/...
      return import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/$/, "") + img
        : img;
    }
    // File novo
    return URL.createObjectURL(img);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200"
    >
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {produto ? "Editar Produto" : "Cadastrar Produto"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Nome do produto *
          </label>
          <input
            className="w-full border p-2 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Ex: Kit Coroa e Pinhão"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Preço (R$) *
          </label>
          <input
            className="w-full border p-2 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            placeholder="R$ 299,90"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Preço promocional (R$)
          </label>
          <input
            className="w-full border p-2 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={precoPromocional}
            onChange={(e) => setPrecoPromocional(e.target.value)}
            placeholder="R$ 249,90"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Imagens (até 10)
          </label>
          <input
            key={fileInputKey}
            className="w-full border p-2 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              // Adiciona novas imagens ao final
              const files = Array.from(e.target.files);
              setImagens((imgs) => [...imgs, ...files].slice(0, 10));
            }}
          />
          <span className="text-xs text-gray-400">
            {imagens.length}/10 imagens
          </span>

          {/* Bloco de thumbs */}
          {imagens.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {imagens.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group border rounded shadow-sm bg-gray-50 p-1 flex flex-col items-center"
                  style={{ width: 90 }}
                >
                  <img
                    src={getThumbUrl(img)}
                    alt={
                      typeof img === "string" ? `Imagem ${idx + 1}` : img.name
                    }
                    className="w-20 h-20 object-cover rounded"
                    style={{ background: "#eee" }}
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      className="text-xs px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
                      onClick={() => handleThumbMove(idx, -1)}
                      disabled={idx === 0}
                      title="Mover para esquerda"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="text-xs px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
                      onClick={() => handleThumbMove(idx, 1)}
                      disabled={idx === imagens.length - 1}
                      title="Mover para direita"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      className="text-xs px-2 py-0.5 bg-red-200 hover:bg-red-400 text-red-800 rounded"
                      onClick={() => handleThumbDelete(idx)}
                      title="Excluir imagem"
                    >
                      ×
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] px-1 rounded-br">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Descrição
        </label>
        <textarea
          className="w-full border p-2 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Detalhes do produto..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Categorias
          </label>
          <select
            className="w-full border p-2 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            multiple
            value={cats}
            onChange={(e) =>
              setCats(Array.from(e.target.selectedOptions, (o) => o.value))
            }
          >
            {categorias.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nome}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400">
            Segure Ctrl para selecionar várias.
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <input
            type="checkbox"
            id="itemDoDia"
            checked={itemDoDia}
            onChange={(e) => setItemDoDia(e.target.checked)}
          />
          <label htmlFor="itemDoDia" className="text-gray-700 font-medium">
            Marcar como "Item do Dia"
          </label>
        </div>
      </div>
      <div className="flex gap-2 mt-4 items-center">
        <input
          type="checkbox"
          id="ativo"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
        />
        <label htmlFor="ativo" className="text-gray-700 font-medium">
          {ativo ? "Produto Ativo" : "Produto Inativo"}
        </label>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition"
          type="submit"
        >
          {produto ? "Salvar Alterações" : "Cadastrar Produto"}
        </button>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-semibold transition"
          type="button"
          onClick={onCancel}
          style={{ display: produto ? undefined : "none" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
