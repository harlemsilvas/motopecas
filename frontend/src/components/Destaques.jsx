// frontend/src/components/Destaques.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useCarrinho } from "../context/CarrinhoContext";
import { getImageUrl } from "../utils/imageUtils";

export default function Destaques({ produtos = [] }) {
  const { adicionarItem } = useCarrinho();
  const API_URL = import.meta.env.VITE_API_URL || ""; // '' para relativo

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">🔥 Itens do Dia</h2>
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {produtos.filter((p) => p.itemDoDia).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum item do dia cadastrado.</p>
            </div>
          ) : (
            produtos
              .filter((produto) => produto.itemDoDia)
              .map((produto) => {
                // ✅ Garante que a imagem aponte para o backend
                const imgSrc = getImageUrl(produto.imagens?.[0]);

                return (
                  <SwiperSlide key={produto._id}>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <img
                        src={imgSrc}
                        alt={produto.nome}
                        className="w-full h-40 object-cover rounded"
                        onError={(e) => {
                          e.target.src = "/upload/sem-imagem.png";
                        }}
                      />
                      <h3 className="mt-4 font-semibold">{produto.nome}</h3>
                      <p className="text-lg text-red-600 font-bold">
                        R${" "}
                        {produto.precoPromocional?.toFixed(2) ||
                          produto.preco.toFixed(2)}
                      </p>
                      {produto.precoPromocional && (
                        <p className="text-sm text-gray-500 line-through">
                          R$ {produto.preco.toFixed(2)}
                        </p>
                      )}
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => adicionarItem(produto)}
                          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500"
                        >
                          ➕ Adicionar ao Carrinho
                        </button>
                        <a
                          href={`https://wa.me/5511999999999?text=Quero saber sobre ${encodeURIComponent(
                            produto.nome
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-green-600 font-medium"
                        >
                          💬 Perguntar no WhatsApp
                        </a>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })
          )}
        </Swiper>
      </div>
    </section>
  );
}
