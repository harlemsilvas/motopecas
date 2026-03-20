import { useState, useEffect } from "react";

export default function Footer() {
  const [config, setConfig] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetch(`${API_URL}/api/config`)
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, []);

  const h = config?.header || {};
  const f = config?.footer || {};
  const hor = f.horarios || {};

  const titulo = h.titulo || "Moto";
  const destaque = h.tituloDestaque || "Speed";
  const endereco = f.endereco || "Rua das Motos, 123 - Centro";
  const cidade = f.cidade || "São Paulo - SP";
  const tel1 = f.telefone1 || "(11) 96774-5351";
  const tel2 = f.telefone2 || "(11) 3333-4444";
  const whatsapp = f.whatsapp || "5511967745351";
  const instagram = f.instagram || "https://instagram.com/motopecas";
  const semana = hor.semana || "Seg-Sex: 8h às 18h";
  const sabado = hor.sabado || "Sábado: 9h às 13h";
  const domingo = hor.domingo || "Domingo: Fechado";
  const copyright = f.copyright || "MotoSpeed Peças";

  return (
    <footer className="bg-[#0a0a0a] text-text-gray border-t border-gray-700 mt-8 sm:mt-12">
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg text-text-light">
            {titulo}
            <span className="text-primary">{destaque}</span>
          </h3>
          <p className="mt-2">{endereco}</p>
          <p>{cidade}</p>
        </div>
        <div>
          <h3 className="font-bold text-text-light">Contato</h3>
          <p className="mt-2">📞 {tel1}</p>
          {tel2 && <p>📞 {tel2}</p>}
          <div className="mt-4 flex gap-4">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300"
              >
                📸 Instagram
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300"
              >
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-text-light">Horário</h3>
          <p className="mt-2">{semana}</p>
          <p>{sabado}</p>
          <p>{domingo}</p>
        </div>
      </div>
      <div className="text-center py-6 text-sm text-gray-500 border-t border-gray-800">
        © {new Date().getFullYear()} {copyright}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
