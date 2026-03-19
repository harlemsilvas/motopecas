import { useState, useEffect } from "react";
import { useCarrinho } from "../context/CarrinhoContext";
import { getImageUrl } from "../utils/imageUtils";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    fetch("http://localhost:5000/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Erro ao carregar categorias:", err));
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {categorias.map((cat) => (
          <div key={cat._id} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
              {cat.nome}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cat.produtos.map((produto) => (
                <div
                  key={produto._id}
                  className="bg-gray-50 rounded-lg overflow-hidden shadow"
                >
                  <img
                    src={getImageUrl(produto.imagens?.[0])}
                    alt={produto.nome}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=Sem+Imagem";
                    }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{produto.nome}</h3>
                    <p className="text-sm text-gray-600">{produto.descricao}</p>
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
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => adicionarItem(produto)}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 text-sm"
                      >
                        ➕ Adicionar ao Carrinho
                      </button>
                      <a
                        href={`https://wa.me/5511967745351?text=Tenho interesse em ${encodeURIComponent(
                          produto.nome
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-green-600 text-sm"
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
