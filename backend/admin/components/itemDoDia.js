// backend/admin/components/itemDoDia.js

(function () {
  // ==================== Carregar itens do dia ====================
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
        const img = p.imagens?.[0] || "/uploads/sem-imagem.png";
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50 transition";
        tr.innerHTML = `
          <td class="py-3 pr-3">
            <div class="flex items-center gap-3">
              <img src="${img}" alt="${p.nome}" class="w-12 h-12 object-cover rounded border" onerror="this.src='/uploads/sem-imagem.png'" />
              <div>
                <p class="font-medium text-gray-800">${p.nome}</p>
                <p class="text-xs text-gray-400">${p.descricao ? p.descricao.substring(0, 60) + (p.descricao.length > 60 ? "..." : "") : ""}</p>
              </div>
            </div>
          </td>
          <td class="py-3 text-sm text-gray-700">
            ${p.precoPromocional ? `<span class="line-through text-gray-400 mr-1">R$ ${p.preco.toFixed(2)}</span><span class="text-green-600 font-semibold">R$ ${p.precoPromocional.toFixed(2)}</span>` : `R$ ${p.preco.toFixed(2)}`}
          </td>
          <td class="py-3 text-sm">
            <button data-editar-item="${p._id}" class="text-blue-600 hover:text-blue-800 font-medium mr-3 text-sm">Editar Produto</button>
            <button data-remover-item="${p._id}" data-nome="${p.nome}" class="text-red-600 hover:text-red-800 font-medium text-sm">Remover do Dia</button>
          </td>`;
        tbody.appendChild(tr);
      });

      // Delegação de eventos
      tbody.addEventListener("click", async (e) => {
        const btnEditar = e.target.closest("[data-editar-item]");
        const btnRemover = e.target.closest("[data-remover-item]");
        if (btnEditar) {
          // Navega para produtos e abre edição
          document
            .querySelectorAll("[data-page]")
            .forEach((el) => el.classList.remove("active"));
          document
            .querySelector("[data-page='produtos']")
            ?.classList.add("active");
          if (window.renderProdutos) window.renderProdutos();
          setTimeout(() => {
            if (window._editarProdutoPorId)
              window._editarProdutoPorId(btnEditar.dataset.editarItem);
          }, 200);
        }
        if (btnRemover)
          await removerItemDoDia(
            btnRemover.dataset.removerItem,
            btnRemover.dataset.nome,
          );
      });
    } catch (err) {
      mostrarMensagem(
        "Falha ao carregar itens do dia: " + err.message,
        "error",
      );
    }
  }

  // ==================== Remover do item do dia ====================
  async function removerItemDoDia(id, nome) {
    if (!confirm(`Remover "${nome}" da lista de Itens do Dia?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/produtos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemDoDia: false }),
      });
      if (res.ok) {
        mostrarMensagem(`"${nome}" removido dos Itens do Dia!`, "success");
        carregarItensDoDia();
      } else {
        const r = await res.json();
        mostrarMensagem("Erro: " + (r.error || "Falha"), "error");
      }
    } catch (err) {
      mostrarMensagem("Erro de conexão: " + err.message, "error");
    }
  }

  // ==================== Render principal ====================
  window.renderItemDoDia = function () {
    const content = document.getElementById("adminContent");
    if (!content) return;

    content.innerHTML = `
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span class="text-2xl">🔥</span> Itens do Dia
          </h2>
          <p class="text-sm text-gray-400">Produtos marcados como destaque</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 text-left text-sm font-medium text-gray-600">Produto</th>
                <th class="py-3 text-left text-sm font-medium text-gray-600">Preço</th>
                <th class="py-3 text-left text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody id="listaItemDoDia" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>
        <p class="text-xs text-gray-400 mt-4 border-t pt-3">
          Para adicionar um item do dia, edite o produto na seção Produtos e marque a opção "Item do Dia".
        </p>
      </div>`;

    carregarItensDoDia();
  };

  // Expor edição por ID para uso do itemDoDia
  window._editarProdutoPorId = async function (id) {
    try {
      const res = await fetch(`${API_URL}/api/produtos/${id}`);
      if (!res.ok) throw new Error("Produto não encontrado");
      const produto = await res.json();

      document.getElementById("produtoId").value = produto._id;
      document.getElementById("tituloFormProduto").textContent =
        "Editar Produto";
      document.querySelector("#formProduto input[name='nome']").value =
        produto.nome;
      document.querySelector("#formProduto textarea[name='descricao']").value =
        produto.descricao || "";
      document.querySelector("#formProduto input[name='itemDoDia']").checked =
        produto.itemDoDia;

      const precoInput = document.querySelector(
        "#formProduto input[name='preco']",
      );
      const precoPromoInput = document.querySelector(
        "#formProduto input[name='precoPromocional']",
      );
      if (precoInput)
        precoInput.value = formatarMoeda(
          String(Math.round(produto.preco * 100)),
        );
      if (precoPromoInput && produto.precoPromocional) {
        precoPromoInput.value = formatarMoeda(
          String(Math.round(produto.precoPromocional * 100)),
        );
      }

      document.getElementById("btnCancelarProduto")?.classList.remove("hidden");
      const btnSubmit = document.getElementById("btnSubmitProduto");
      if (btnSubmit) {
        btnSubmit.textContent = "Salvar Alterações";
        btnSubmit.classList.replace("bg-blue-600", "bg-green-600");
        btnSubmit.classList.replace("hover:bg-blue-700", "hover:bg-green-700");
      }

      document
        .getElementById("formProduto")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      mostrarMensagem("Erro ao carregar produto: " + err.message, "error");
    }
  };
})();
