export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg">MotoPeças Local</h3>
          <p className="mt-2">Rua das Motores, 123 - Centro</p>
          <p>São Paulo - SP</p>
        </div>
        <div>
          <h3 className="font-bold">Contato</h3>
          <p className="mt-2">📞 (11) 99999-9999</p>
          <p>📞 (11) 3333-4444</p>
          <div className="mt-4 space-x-4">
            <a href="https://instagram.com/motopecas" target="_blank" className="text-pink-400">📸 Instagram</a>
            <a href="https://wa.me/5511999999999" target="_blank" className="text-green-400">💬 WhatsApp</a>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Horário</h3>
          <p className="mt-2">Seg-Sex: 8h às 18h</p>
          <p>Sábado: 9h às 13h</p>
          <p>Domingo: Fechado</p>
        </div>
      </div>
      <div className="text-center mt-6 text-sm text-gray-400">
        © 2025 MotoPeças Local. Todos os direitos reservados.
      </div>
    </footer>
  );
}
