// Migrado de backend/admin/components/produtos.js
// Adapte para React conforme necessário.
(function () {
  let modo = "cadastro";
  let produtoAtual = null;
  let imagensExistentes = [];
  let novasImagens = [];
  let imagensRemovidas = [];
  const LIMITE = 10;
  async function carregarProdutos() {
    try {
      const res = await fetch(`${API_URL}/api/produtos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const produtos = await res.json();
      const tbody = document.getElementById("listaProdutos");
      if (!tbody) return;
      tbody.innerHTML = "";
      if (produtos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-400">Nenhum produto cadastrado.</td></tr>`;
        return;
      }
      produtos.forEach((p) => {
        // ...
      });
      tbody.addEventListener("click", async (e) => {
        const btnEditar = e.target.closest("[data-editar]");
        const btnExcluir = e.target.closest("[data-excluir]");
        if (btnEditar) await editarProduto(btnEditar.dataset.editar);
        if (btnExcluir)
          await excluirProduto(
            btnExcluir.dataset.excluir,
            btnExcluir.dataset.nome,
          );
      });
    } catch (err) {
      mostrarMensagem("Falha ao carregar produtos: " + err.message, "error");
    }
  }
})();
