// Migrado de backend/admin/components/categorias.js
// Adapte para React conforme necessário.
(function () {
  let imagemAtual = "";
  let novaImagem = null;
  let imagemRemovida = "";
  async function carregarCategorias() {
    try {
      const res = await fetch(`${API_URL}/api/categorias`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const categorias = await res.json();
      const tbody = document.getElementById("listaCategorias");
      if (!tbody) return;
      tbody.innerHTML = "";
      if (categorias.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-400">Nenhuma categoria cadastrada.</td></tr>`;
        return;
      }
      categorias.forEach((cat) => {
        const tr = document.createElement("tr");
        tr.className =
          "hover:bg-gray-50 transition" +
          (cat.ativa === false ? " opacity-50" : "");
        tr.innerHTML = `...`;
        tbody.appendChild(tr);
      });
      tbody.addEventListener("click", async (e) => {
        const btnE = e.target.closest("[data-editar-cat]");
        const btnX = e.target.closest("[data-excluir-cat]");
        if (btnE) await editarCategoria(btnE.dataset.editarCat);
        if (btnX)
          await excluirCategoria(btnX.dataset.excluirCat, btnX.dataset.nome);
      });
    } catch (err) {
      mostrarMensagem("Falha ao carregar categorias: " + err.message, "error");
    }
  }
})();
