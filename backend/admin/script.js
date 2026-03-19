// backend/admin/script.js

/**
 * Função global para mostrar mensagens de feedback
 * @param {string} texto - Mensagem a exibir
 * @param {string} cor - "blue", "green", "red"
 */
function mostrarMensagem(texto, cor = "blue") {
  const mensagem = document.createElement("div");
  mensagem.className = `fixed top-4 right-4 z-50 p-4 rounded bg-${cor}-100 text-${cor}-800 font-medium shadow-lg transition-opacity duration-300 max-w-sm`;
  mensagem.textContent = texto;
  document.body.appendChild(mensagem);

  setTimeout(() => {
    mensagem.style.opacity = "0";
    setTimeout(() => mensagem.remove(), 300);
  }, 5000);
}

// Carregar menu e página inicial ao iniciar
document.addEventListener("DOMContentLoaded", () => {
  // Carrega o menu
  import("./components/menu.js");

  // Carrega a página inicial (Produtos)
  import("./components/produtos.js")
    .then((module) => {
      if (typeof module.renderProdutos === "function") {
        module.renderProdutos();
      }
    })
    .catch((err) => {
      console.error("Erro ao carregar produtos:", err);
      mostrarMensagem("❌ Erro ao carregar a página de produtos", "red");
    });
});
