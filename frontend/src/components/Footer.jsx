export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-text-gray border-t border-gray-700 mt-8 sm:mt-12">
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg text-text-light">
            Moto<span className="text-primary">Speed</span>
          </h3>
          <p className="mt-2">Rua das Motos, 123 - Centro</p>
          <p>São Paulo - SP</p>
        </div>
        <div>
          <h3 className="font-bold text-text-light">Contato</h3>
          <p className="mt-2">📞 (11) 96774-5351</p>
          <p>📞 (11) 3333-4444</p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://instagram.com/motopecas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300"
            >
              📸 Instagram
            </a>
            <a
              href="https://wa.me/5511967745351"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-text-light">Horário</h3>
          <p className="mt-2">Seg-Sex: 8h às 18h</p>
          <p>Sábado: 9h às 13h</p>
          <p>Domingo: Fechado</p>
        </div>
      </div>
      <div className="text-center py-6 text-sm text-gray-500 border-t border-gray-800">
        © {new Date().getFullYear()} MotoSpeed Peças. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
