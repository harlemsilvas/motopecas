// backend/admin/components/menu.js

// Funções globais para navegação
window.renderProdutos = () =>
  import("./produtos.js").then(() => window.renderProdutos());
window.renderCategorias = () =>
  import("./categorias.js").then(() => window.renderCategorias());
window.renderItemDoDia = () =>
  import("./itemDoDia.js").then(() => window.renderItemDoDia());

// Evento de clique no menu
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-page]");
  if (!target) return;

  e.preventDefault();

  // Atualiza estilo do menu
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.classList.remove("bg-blue-900");
    btn.classList.add("hover:bg-blue-700");
  });
  target.classList.remove("hover:bg-blue-700");
  target.classList.add("bg-blue-900");

  // Carrega a página
  const page = target.dataset.page;
  if (page === "produtos" && window.renderProdutos) window.renderProdutos();
  if (page === "categorias" && window.renderCategorias)
    window.renderCategorias();
  if (page === "itemDoDia" && window.renderItemDoDia) window.renderItemDoDia();
});
