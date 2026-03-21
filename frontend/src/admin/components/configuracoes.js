// Migrado de backend/admin/components/configuracoes.js
// Adapte para React conforme necessário.
(function () {
  let configAtual = {};
  let novaImagemFundo = null;
  async function carregarConfig() {
    try {
      const res = await fetch(`${API_URL}/api/config`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      configAtual = await res.json();
      preencherFormulario();
    } catch (err) {
      mostrarMensagem(
        "Falha ao carregar configurações: " + err.message,
        "error",
      );
    }
  }
  function preencherFormulario() {
    // ...
  }
  function setVal(id, valor) {
    const el = document.getElementById(id);
    if (el && valor !== undefined && valor !== null) el.value = valor;
  }
  function renderPreviewBg() {
    // ...
  }
})();
