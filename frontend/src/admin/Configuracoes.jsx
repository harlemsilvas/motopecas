import React, { useState, useEffect, useRef } from "react";
import { getImageUrl } from "../utils/imageUtils";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Configuracoes() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [novaImagemFundo, setNovaImagemFundo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const uploadInputRef = useRef();

  useEffect(() => {
    async function carregarConfig() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/config`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setConfig(data);
        setErro("");
      } catch (err) {
        setErro("Falha ao carregar configurações: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    carregarConfig();
  }, []);

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => {
      const novo = { ...prev };
      if (name.startsWith("header.")) {
        novo.header = { ...novo.header, [name.split(".")[1]]: value };
      } else if (name.startsWith("footer.")) {
        if (name.includes("horarios.")) {
          novo.footer = {
            ...novo.footer,
            horarios: { ...novo.footer.horarios, [name.split(".")[2]]: value },
          };
        } else {
          novo.footer = { ...novo.footer, [name.split(".")[1]]: value };
        }
      } else if (name.startsWith("display.")) {
        if (type === "checkbox") {
          novo.display = { ...novo.display, [name.split(".")[1]]: checked };
        } else {
          novo.display = { ...novo.display, [name.split(".")[1]]: value };
        }
      }
      return novo;
    });
  }

  function handleImagemChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo excede 5MB");
      uploadInputRef.current.value = "";
      return;
    }
    setNovaImagemFundo(file);
  }

  function handleRemoverImagem() {
    setNovaImagemFundo(null);
    setConfig((prev) => ({
      ...prev,
      header: { ...prev.header, imagemFundo: "" },
    }));
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      let imagemFundoUrl = config.header?.imagemFundo || "";
      if (novaImagemFundo) {
        const fd = new FormData();
        fd.append("imagem", novaImagemFundo);
        const upRes = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: fd,
        });
        if (!upRes.ok)
          throw new Error((await upRes.json()).error || "Falha no upload");
        const result = await upRes.json();
        imagemFundoUrl = result.url;
      }
      const payload = {
        header: {
          ...config.header,
          imagemFundo: imagemFundoUrl,
        },
        footer: {
          ...config.footer,
        },
        display: {
          ...config.display,
          maxProdutosPorSecao:
            parseInt(config.display?.maxProdutosPorSecao) || 12,
        },
      };
      const res = await fetch(`${API_URL}/api/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok)
        throw new Error((await res.json()).erro || "Falha ao salvar");
      const data = await res.json();
      setConfig(data);
      setNovaImagemFundo(null);
      alert("Configurações salvas com sucesso!");
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  function renderPreviewBg() {
    const imgUrl = novaImagemFundo
      ? URL.createObjectURL(novaImagemFundo)
      : config?.header?.imagemFundo;
    if (imgUrl) {
      return (
        <div className="relative inline-block mt-2">
          <img
            src={apiImg(imgUrl)}
            alt="Fundo"
            className="h-20 rounded border object-cover"
          />
          <button
            type="button"
            onClick={handleRemoverImagem}
            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow"
          >
            ✕
          </button>
          {novaImagemFundo && (
            <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center rounded-b">
              NOVA
            </span>
          )}
        </div>
      );
    }
    return (
      <p className="text-xs text-gray-400 mt-2">
        Nenhuma imagem de fundo (usa gradiente padrão)
      </p>
    );
  }

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Carregando configurações...
      </div>
    );
  if (erro) return <div className="p-8 text-center text-red-600">{erro}</div>;
  if (!config) return null;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Configurações do Site
        </h2>
        <form onSubmit={handleSubmit}>
          {/* HEADER / HERO */}
          <fieldset className="border border-gray-200 rounded-lg p-5 mb-6">
            <legend className="text-sm font-semibold text-gray-950 px-2">
              🏍️ Cabeçalho (Hero)
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título principal
                </label>
                <input
                  name="header.titulo"
                  value={config.header?.titulo || ""}
                  onChange={handleInputChange}
                  placeholder="Moto"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Parte antes do destaque (ex: "Moto")
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título destaque
                </label>
                <input
                  name="header.tituloDestaque"
                  value={config.header?.tituloDestaque || ""}
                  onChange={handleInputChange}
                  placeholder="Speed"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Parte em destaque (cor primária, ex: "Speed")
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slogan
              </label>
              <input
                name="header.slogan"
                value={config.header?.slogan || ""}
                onChange={handleInputChange}
                placeholder="As melhores peças com os melhores preços."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem de fundo
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                ref={uploadInputRef}
                onChange={handleImagemChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder-gray-500"
              />
              <div>{renderPreviewBg()}</div>
            </div>
          </fieldset>

          {/* FOOTER */}
          <fieldset className="border border-gray-200 rounded-lg p-5 mb-6">
            <legend className="text-sm font-semibold text-gray-600 px-2">
              📋 Rodapé
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  name="footer.endereco"
                  value={config.footer?.endereco || ""}
                  onChange={handleInputChange}
                  placeholder="Rua das Motos, 123 - Centro"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade / Estado
                </label>
                <input
                  name="footer.cidade"
                  value={config.footer?.cidade || ""}
                  onChange={handleInputChange}
                  placeholder="São Paulo - SP"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone 1
                </label>
                <input
                  name="footer.telefone1"
                  value={config.footer?.telefone1 || ""}
                  onChange={handleInputChange}
                  placeholder="(11) 96774-5351"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone 2
                </label>
                <input
                  name="footer.telefone2"
                  value={config.footer?.telefone2 || ""}
                  onChange={handleInputChange}
                  placeholder="(11) 3333-4444"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp (código país + DDD + número)
                </label>
                <input
                  name="footer.whatsapp"
                  value={config.footer?.whatsapp || ""}
                  onChange={handleInputChange}
                  placeholder="5511967745351"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram (URL completa)
                </label>
                <input
                  name="footer.instagram"
                  value={config.footer?.instagram || ""}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/motopecas"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário Semana
                </label>
                <input
                  name="footer.horarios.semana"
                  value={config.footer?.horarios?.semana || ""}
                  onChange={handleInputChange}
                  placeholder="Seg-Sex: 8h às 18h"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário Sábado
                </label>
                <input
                  name="footer.horarios.sabado"
                  value={config.footer?.horarios?.sabado || ""}
                  onChange={handleInputChange}
                  placeholder="Sábado: 9h às 13h"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário Domingo
                </label>
                <input
                  name="footer.horarios.domingo"
                  value={config.footer?.horarios?.domingo || ""}
                  onChange={handleInputChange}
                  placeholder="Domingo: Fechado"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto de copyright
              </label>
              <input
                name="footer.copyright"
                value={config.footer?.copyright || ""}
                onChange={handleInputChange}
                placeholder="MotoSpeed Peças"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
              />
            </div>
          </fieldset>

          {/* EXIBIÇÃO */}
          <fieldset className="border border-gray-200 rounded-lg p-5 mb-6">
            <legend className="text-sm font-semibold text-gray-600 px-2">
              🎯 Exibição
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máx. produtos por seção
                </label>
                <input
                  type="number"
                  name="display.maxProdutosPorSecao"
                  value={config.display?.maxProdutosPorSecao || 12}
                  min="1"
                  max="100"
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-500 placeholder-gray-500"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  name="display.randomizarProdutos"
                  checked={!!config.display?.randomizarProdutos}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Randomizar ordem dos produtos por sessão
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Quando ativo, cada visitante vê os produtos em ordem diferente. A
              ordem se mantém durante a sessão.
            </p>
          </fieldset>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg shadow transition flex items-center gap-2"
              disabled={salvando}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {salvando ? "Salvando..." : "Salvar Configurações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
