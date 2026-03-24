// Migrado de backend/admin/components/menu.js
// Adapte para React conforme necessário.
const _path = window.location.pathname;
const _adminIdx = _path.indexOf("/admin");
const API_URL = _adminIdx > 0 ? _path.substring(0, _adminIdx) : "";
import { getImageUrl } from "../../utils/imageUtils";
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
