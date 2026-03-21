// Migrado de backend/admin/script.js
// Adapte para React conforme necessário.
let modo = "cadastro";
let produtoAtual = null;
let imagensEmEdicao = [];
let novasImagensParaUpload = [];

const LIMITE_IMAGENS = 10;

function formatarMoeda(valor) {
  const numeros = valor.replace(/\D/g, "");
  const valorEmCentavos = (numeros / 100).toFixed(2);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorEmCentavos);
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
  input.addEventListener("input", function (e) {
    let value = this.value.replace(/\D/g, "");
    if (value === "") {
      this.value = "";
      return;
    }
    this.value = formatarMoeda(value);
  });
  input.addEventListener("blur", function () {
    if (this.value === "" || this.value === "R$ 0,00") {
      this.value = "";
    }
  });
}

function mostrarMensagem(texto, cor = "blue") {
  const mensagem = document.getElementById("mensagem");
  if (!mensagem) return;
  mensagem.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded bg-${cor}-600 text-white font-medium shadow-lg max-w-xs`;
  mensagem.textContent = texto;
  mensagem.classList.remove("hidden");
  clearTimeout(mensagem._timer);
  mensagem._timer = setTimeout(() => {
    mensagem.style.opacity = "0";
    setTimeout(() => {
      mensagem.classList.add("hidden");
      mensagem.style.opacity = "1";
    }, 300);
  }, 4000);
}
