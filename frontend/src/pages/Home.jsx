// src/pages/Home.jsx
import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Destaques from "../components/Destaques";
import Footer from "../components/Footer";
import { getImageUrl } from "../utils/imageUtils";
import Categorias from "../components/Categorias";

export default function Home() {
  const [destaques, setDestaques] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // ✅ Use a URL completa do backend
    fetch(`${API_URL}/api/produtos`)
      .then((res) => res.json())
      .then((data) => {
        // Filtra os destaques (item do dia)
        const itensDoDia = data.filter((p) => p.itemDoDia);
        const outros = data.filter((p) => !p.itemDoDia);

        setDestaques(itensDoDia);
        setProdutos(outros);
      })
      .catch((err) => console.error("Erro ao carregar produtos:", err));
  }, []);

  return (
    <div>
      <Hero />
      <Destaques produtos={destaques} />
      <Categorias />
      {/* Seção: Outros Produtos */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Outros Produtos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtos.length > 0 ? (
              produtos.map((produto) => {
                // ✅ Monta a URL da imagem com o backend
                const imgSrc = getImageUrl(produto.imagens?.[0]);

                return (
                  <div
                    key={produto._id}
                    className="bg-gray-50 rounded-lg overflow-hidden shadow"
                  >
                    <img
                      src={imgSrc}
                      alt={produto.nome}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.src = `${API_URL}/uploads/placeholder.jpg`;
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold">{produto.nome}</h3>
                      <p className="text-sm text-gray-600">
                        {produto.descricao}
                      </p>
                      {produto.precoPromocional ? (
                        <>
                          <p className="text-lg font-bold text-red-600">
                            R$ {produto.precoPromocional.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 line-through">
                            R$ {produto.preco.toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold">
                          R$ {produto.preco.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="col-span-full text-center text-gray-500">
                Nenhum outro produto cadastrado.
              </p>
            )}
          </div>
          <div className="text-center mt-8">
            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de ver mais peças para motos."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded"
            >
              Ver Mais no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
