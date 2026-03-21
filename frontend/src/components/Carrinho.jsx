import { useCarrinho } from "../context/CarrinhoContext";

export default function Carrinho() {
  const { itens, removerItem, limparCarrinho, total } = useCarrinho();

  const gerarMensagemWhatsApp = () => {
    const mensagem = itens
      .map(
        (item) =>
          `${item.nome} - R$${item.preco.toFixed(2)} x ${item.quantidade}`,
      )
      .join("%0A");
    return `https://wa.me/5511967745351?text=Olá! Gostaria de fazer um pedido:%0A%0A${mensagem}%0A%0ATotal: R$${total.toFixed(2)}`;
  };

  if (itens.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-card-bg border border-gray-700 shadow-lg rounded-lg p-4 sm:w-80 z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold text-text-light">
        Sua Lista ({itens.length} item(s))
      </h3>
      <ul className="mt-2 text-sm text-text-gray">
        {itens.map((item) => (
          <li
            key={item._id}
            className="flex justify-between py-1 border-b border-gray-700"
          >
            <span>
              {item.nome} x{item.quantidade}
            </span>
            <button
              onClick={() => removerItem(item._id)}
              className="text-red-500 ml-2"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <p className="font-bold mt-2 text-primary">
        Total: R$ {total.toFixed(2).replace(".", ",")}
      </p>
      <a
        href={gerarMensagemWhatsApp()}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-3 bg-green-600 text-white text-center py-2 rounded text-sm hover:bg-green-500 transition"
      >
        Enviar Lista via WhatsApp/Loja
      </a>
      <button
        onClick={limparCarrinho}
        className="block mt-1 text-xs text-text-gray w-full text-left hover:text-text-light"
      >
        Limpar Lista
      </button>
    </div>
  );
}
