// src/pages/Home.jsx
import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Destaques from "../components/Destaques";
import Footer from "../components/Footer";
import { getImageUrl } from "../utils/imageUtils";
import Categorias from "../components/Categorias";
import { useCarrinho } from "../context/CarrinhoContext";

// Shuffle determinístico com seed (Fisher-Yates com PRNG simples)
function seededShuffle(array, seed) {
  const arr = [...array];
  let s = seed;
  function next() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getSessionSeed() {
  let seed = sessionStorage.getItem("motopecas_seed");
  if (!seed) {
    seed = String(Math.floor(Math.random() * 2147483647));
    sessionStorage.setItem("motopecas_seed", seed);
  }
  return parseInt(seed, 10);
}

export default function Home() {
  const [destaques, setDestaques] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [config, setConfig] = useState(null);
  const { adicionarItem } = useCarrinho();
  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/produtos?ativo=true`).then((r) => r.json()),
      fetch(`${API_URL}/api/config`).then((r) => r.json()),
    ])
      .then(([data, cfg]) => {
        setConfig(cfg);
        // Garante que só produtos ativos serão exibidos
        const ativos = data.filter((p) => p.ativo !== false);
        const dest = ativos.filter((p) => p.itemDoDia);
        let prods = ativos.filter((p) => !p.itemDoDia);

        // Randomizar se habilitado na config
        if (cfg?.display?.randomizarProdutos) {
          const seed = getSessionSeed();
          dest.length > 1 && setDestaques(seededShuffle(dest, seed));
          prods = seededShuffle(prods, seed + 1);
        }

        if (!cfg?.display?.randomizarProdutos) {
          setDestaques(dest);
        }

        // Limitar por maxProdutosPorSecao
        const max = cfg?.display?.maxProdutosPorSecao || 12;
        setProdutos(prods.slice(0, max));
      })
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, []);

  return (
    <div className="bg-dark min-h-screen text-text-light">
      <Hero />
      <Destaques produtos={destaques} />
      <Categorias />

      {/* Seção: Outros Produtos */}
      {produtos.length > 0 && (
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 relative after:content-[''] after:block after:w-16 after:h-[3px] after:bg-primary after:mx-auto after:mt-3">
              Outros Produtos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {produtos.map((produto) => {
                // Garante imagem padrão se não houver
                const imgSrc =
                  getImageUrl(produto.imagens?.[0]) || getImageUrl(null);
                return (
                  <div
                    key={produto._id}
                    className="bg-card-bg rounded-lg overflow-hidden border border-gray-700 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,69,0,0.2)] hover:border-primary"
                  >
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
                      <h3 className="text-base sm:text-lg font-semibold text-text-light mb-2">
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
                      <button
                        onClick={() => adicionarItem(produto)}
                        className="block w-full py-2.5 sm:py-3 bg-transparent border-2 border-primary text-primary text-sm sm:text-base font-bold rounded text-center transition-all duration-300 hover:bg-primary hover:text-white"
                      >
                        ADICIONAR A LISTA
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
