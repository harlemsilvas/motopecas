import React, { useState, useEffect } from "react";

export default function ProdutoForm({
  onSubmit,
  categorias,
  produto,
  onCancel,
}) {
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
  const [imagens, setImagens] = useState([]);
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
            className="w-full border p-2 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImagens([...e.target.files])}
          />
          <span className="text-xs text-gray-400">
            {imagens.length}/10 imagens
          </span>
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
