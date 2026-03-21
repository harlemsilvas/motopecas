// Migrado de backend/admin/components/itemDoDia.js
// Adapte para React conforme necessário.
(function () {
  async function carregarItensDoDia() {
    const tbody = document.getElementById("listaItemDoDia");
    if (!tbody) return;
    try {
      const res = await fetch(`${API_URL}/api/produtos?itemDoDia=true`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const produtos = await res.json();
      tbody.innerHTML = "";
      if (produtos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-8 text-gray-400">Nenhum item do dia definido.</td></tr>`;
        return;
      }
      produtos.forEach((p) => {
        // ...
      });
      tbody.addEventListener("click", async (e) => {
        const btnEditar = e.target.closest("[data-editar-item]");
        const btnRemover = e.target.closest("[data-remover-item]");
        if (btnEditar) {
          // ...
        }
      });
    } catch (err) {
      mostrarMensagem(
        "Falha ao carregar itens do dia: " + err.message,
        "error",
      );
    }
  }
})();
