export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-extrabold mb-4 animate-pulse">
          🛵 Peças para Motos
        </h1>
        <p className="text-xl opacity-90 mb-8">
          Com entrega local e promoções todos os dias!
        </p>
        <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-10 rounded-full shadow-lg transform transition hover:scale-105">
          Ver Produtos
        </button>
      </div>
    </section>
  );
}
