import React, { useState, useEffect } from "react";

export default function CategoriaForm({ onSubmit, categoria, onCancel }) {
  const [nome, setNome] = useState(categoria?.nome || "");
  const [descricao, setDescricao] = useState(categoria?.descricao || "");
  const [ordem, setOrdem] = useState(categoria?.ordem || 0);
  const [ativa, setAtiva] = useState(categoria?.ativa !== false);
  const [imagem, setImagem] = useState(null);

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome || "");
      setDescricao(categoria.descricao || "");
      setOrdem(categoria.ordem || 0);
      setAtiva(categoria.ativa !== false);
    }
  }, [categoria]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ nome, descricao, ordem, ativa, imagem });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-200"
    >
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {categoria ? "Editar Categoria" : "Cadastrar Categoria"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-900 font-semibold mb-1">
            Nome *
          </label>
          <input
            className="w-full border p-2 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Nome da categoria"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-gray-900 font-semibold mb-1">
            Ordem
          </label>
          <input
            className="w-full border p-2 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="number"
            value={ordem}
            onChange={(e) => setOrdem(Number(e.target.value))}
            autoComplete="off"
          />
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
          placeholder="Descrição da categoria..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Imagem</label>
          <input
            className="w-full border p-2 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="file"
            accept="image/*"
            onChange={(e) => setImagem(e.target.files[0])}
          />
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <input
            type="checkbox"
            id="ativa"
            checked={ativa}
            onChange={(e) => setAtiva(e.target.checked)}
          />
          <label htmlFor="ativa" className="text-gray-700 font-medium">
            Ativa
          </label>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition"
          type="submit"
        >
          {categoria ? "Salvar Alterações" : "Cadastrar Categoria"}
        </button>
        {categoria && (
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-semibold transition"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
