import { useState, useEffect } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { getImageUrl } from "../utils/imageUtils";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [whatsapp, setWhatsapp] = useState("5511967745351");
  const { adicionarItem } = useCarrinho();
  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetch(`${API_URL}/api/categorias?ativas=true`)
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Erro ao carregar categorias:", err));

    fetch(`${API_URL}/api/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.footer?.whatsapp) setWhatsapp(data.footer.whatsapp);
      })
      .catch(() => {});
  }, []);

  if (categorias.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-5">
        {categorias.map((cat) => (
          <div key={cat._id} className="mb-14">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-text-light relative after:content-[''] after:block after:w-16 after:h-[3px] after:bg-primary after:mt-3">
              {cat.nome}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {cat.produtos.map((produto) => (
                <div
                  key={produto._id}
                  className="bg-card-bg rounded-lg overflow-hidden border border-gray-700 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,69,0,0.2)] hover:border-primary relative"
                >
                  <div className="aspect-[4/3] bg-gray-800 flex items-center justify-center overflow-hidden">
                    <img
                      src={getImageUrl(produto.imagens?.[0])}
                      alt={produto.nome}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.src = getImageUrl(null);
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base sm:text-lg font-semibold text-text-light mb-3">
                      {produto.nome}
                    </h3>
                    {produto.descricao && (
                      <p className="text-sm text-text-gray mb-3">
                        {produto.descricao}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      {produto.precoPromocional ? (
                        <>
                          <span className="line-through text-text-gray text-sm">
                            R$ {produto.preco.toFixed(2).replace(".", ",")}
                          </span>
                          <span className="text-primary text-xl sm:text-2xl font-bold">
                            R${" "}
                            {produto.precoPromocional
                              .toFixed(2)
                              .replace(".", ",")}
                          </span>
                        </>
                      ) : (
                        <span className="text-primary text-xl sm:text-2xl font-bold">
                          R$ {produto.preco.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => adicionarItem(produto)}
                        className="block w-full py-2.5 sm:py-3 bg-transparent border-2 border-primary text-primary text-sm sm:text-base font-bold rounded text-center transition-all duration-300 hover:bg-primary hover:text-white"
                      >
                        ADICIONAR A LISTA
                      </button>
                      <a
                        href={`https://wa.me/${whatsapp}?text=Tenho interesse em ${encodeURIComponent(produto.nome)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-green-500 text-sm font-medium hover:text-green-400"
                      >
                        💬 Perguntar no WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
