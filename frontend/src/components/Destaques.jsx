// frontend/src/components/Destaques.jsx
import { useCarrinho } from "../context/CarrinhoContext";
import { getImageUrl } from "../utils/imageUtils";

export default function Destaques({ produtos = [] }) {
  const { adicionarItem } = useCarrinho();
  const itensDoDia = produtos.filter((p) => p.itemDoDia);

  if (itensDoDia.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 text-text-light relative after:content-[''] after:block after:w-16 after:h-[3px] after:bg-primary after:mx-auto after:mt-3">
          Ofertas do Dia
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {itensDoDia.map((produto) => {
            const imgSrc = getImageUrl(produto.imagens?.[0]);
            return (
              <div
                key={produto._id}
                className="bg-card-bg rounded-lg overflow-hidden border border-gray-700 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,69,0,0.2)] hover:border-primary relative"
              >
                <span className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded z-10">
                  OFERTA
                </span>
                <div className="aspect-[4/3] bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={imgSrc}
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
                      COMPRAR AGORA
                    </button>
                    <a
                      href={`https://wa.me/5511967745351?text=Quero saber sobre ${encodeURIComponent(produto.nome)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-green-500 text-sm font-medium hover:text-green-400"
                    >
                      💬 Perguntar no WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
