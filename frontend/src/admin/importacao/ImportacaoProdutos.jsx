import React, { useState } from "react";
import { parseCSV, validarProdutoCSV } from "./utilsImportacao";

export default function ImportacaoProdutos() {
  const [csvText, setCsvText] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [erros, setErros] = useState([]);
  const [fileName, setFileName] = useState("");
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target.result);
      const dados = parseCSV(evt.target.result);
      setProdutos(dados);
      // Validação simples
      setErros(
        dados
          .map((p, i) =>
            validarProdutoCSV(p)
              ? null
              : `Linha ${i + 2}: campos obrigatórios faltando`,
          )
          .filter(Boolean),
      );
    };
    reader.readAsText(file);
  }

  async function handleImportar() {
    setImportando(true);
    setResultado(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(
        `${API_URL.replace(/\/$/, "")}/api/produtos/importar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(produtos),
        },
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.erro || "Erro desconhecido");
      setResultado({ sucesso: true, ...data });
    } catch (err) {
      setResultado({ sucesso: false, erro: err.message });
    } finally {
      setImportando(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Importar Produtos via CSV
      </h1>
      <a
        href="/src/admin/importacao/modelo-produtos.csv"
        download
        className="text-blue-600 underline mb-2 inline-block"
      >
        Baixar modelo CSV
      </a>
      <input
        type="file"
        accept=".csv"
        className="block mb-4"
        onChange={handleFile}
      />
      {fileName && (
        <div className="text-sm text-gray-500 mb-2">Arquivo: {fileName}</div>
      )}
      {produtos.length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2 text-gray-800">
            Prévia dos produtos:
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs">
              <thead>
                <tr>
                  {Object.keys(produtos[0]).map((h) => (
                    <th
                      key={h}
                      className="border px-2 py-1 bg-gray-100 text-gray-800 font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produtos.map((p, i) => (
                  <tr key={i} className={erros[i] ? "bg-red-50" : ""}>
                    {Object.values(p).map((v, j) => (
                      <td key={j} className="border px-2 py-1 text-gray-800">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {erros.length > 0 && (
        <div className="text-red-600 mb-2">
          <ul>
            {erros.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={produtos.length === 0 || erros.length > 0 || importando}
        onClick={handleImportar}
      >
        {importando ? "Importando..." : "Importar para o sistema"}
      </button>

      {resultado && resultado.sucesso && (
        <div className="mt-4 text-green-700">
          <b>Importação concluída!</b>
          <div>{resultado.inseridos?.length} produtos importados.</div>
          {resultado.erros?.length > 0 && (
            <div className="text-orange-700 mt-2">
              <b>Erros:</b>
              <ul className="list-disc ml-5">
                {resultado.erros.map((e, i) => (
                  <li key={i}>{`Linha ${e.linha}: ${e.erro}`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {resultado && !resultado.sucesso && (
        <div className="mt-4 text-red-700">
          <b>Erro na importação:</b> {resultado.erro}
        </div>
      )}
    </div>
  );
}
