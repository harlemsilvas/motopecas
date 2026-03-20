// backend/admin/components/menu.js

const API_URL = window.location.origin;

// ==================== Toast de Feedback ====================
function mostrarMensagem(texto, tipo = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  const cores = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-yellow-500 text-gray-900",
  };
  toast.className = `toast ${cores[tipo] || cores.info}`;
  toast.textContent = texto;
  toast.classList.remove("hidden");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.classList.add("hidden");
      toast.style.opacity = "1";
    }, 300);
  }, 4000);
}

// ==================== Utilitários de Moeda ====================
function formatarMoeda(valor) {
  const numeros = String(valor).replace(/\D/g, "");
  if (!numeros) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numeros / 100);
}

function parseMoeda(valor) {
  if (!valor || valor === "R$ 0,00") return 0;
  return parseFloat(
    valor
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, ""),
  );
}

function aplicarMascara(input) {
  if (!input) return;
  input.addEventListener("input", function () {
    const value = this.value.replace(/\D/g, "");
    this.value = value === "" ? "" : formatarMoeda(value);
  });
  input.addEventListener("blur", function () {
    if (this.value === "" || this.value === "R$ 0,00") this.value = "";
  });
}

// ==================== Navegação do Menu ====================
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-page]");
  if (!link) return;
  e.preventDefault();

  // Atualiza estilo ativo
  document
    .querySelectorAll("[data-page]")
    .forEach((el) => el.classList.remove("active"));
  link.classList.add("active");

  // Carrega a página correspondente
  const page = link.dataset.page;
  if (page === "produtos" && window.renderProdutos) window.renderProdutos();
  if (page === "categorias" && window.renderCategorias)
    window.renderCategorias();
  if (page === "itemDoDia" && window.renderItemDoDia) window.renderItemDoDia();
});

// Expor globalmente
window.mostrarMensagem = mostrarMensagem;
window.formatarMoeda = formatarMoeda;
window.parseMoeda = parseMoeda;
window.aplicarMascara = aplicarMascara;
window.API_URL = API_URL;
