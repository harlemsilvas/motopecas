import { useState, useEffect } from "react";

export default function Hero() {
  const [config, setConfig] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetch(`${API_URL}/api/config`)
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, []);

  const h = config?.header || {};
  const titulo = h.titulo || "Moto";
  const destaque = h.tituloDestaque || "Speed";
  const slogan = h.slogan || "As melhores peças com os melhores preços.";
  const bgImage = h.imagemFundo
    ? `${API_URL}${h.imagemFundo}`
    : "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

  return (
    <header
      className="relative h-48 sm:h-60 md:h-72 flex flex-col justify-center items-center text-center border-b-4 border-primary"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wider mb-2">
        {titulo}
        <span className="text-primary font-bold">{destaque}</span>
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-text-gray px-4">
        {slogan}
      </p>
    </header>
  );
}
