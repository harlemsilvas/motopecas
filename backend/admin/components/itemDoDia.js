// backend/admin/components/itemDoDia.js

// ✅ Função global para editar (reutiliza a de produtos.js)
window.editarItemDoDia = function (id) {
  // Força carregar a página de produtos
  window.renderProdutos();

  // Espera o formulário ser inserido no DOM
  setTimeout(() => {
    if (typeof window.editarProduto === "function") {
      window.editarProduto(id); // Agora sim, chama a edição
    } else {
      mostrarMensagem("❌ Função de edição não disponível", "red");
    }
  }, 100);
};

// ✅ Função global para remover item do dia
window.removerItemDoDia = async function (id, nome) {
  if (!confirm(`Remover "${nome}" da lista de Itens do Dia?`)) return;
  try {
    const res = await fetch(`http://localhost:5000/api/produtos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemDoDia: false }),
    });

    if (res.ok) {
      mostrarMensagem(`✅ "${nome}" removido dos Itens do Dia!`, "green");
      renderItemDoDia();
    } else {
      const result = await res.json();
      mostrarMensagem(`❌ Erro: ${result.error}`, "red");
    }
  } catch (err) {
    mostrarMensagem(`❌ Erro: ${err.message}`, "red");
  }
};

// ✅ Função principal para renderizar a página
window.renderItemDoDia = async function () {
  const content = document.getElementById("adminContent");
  content.innerHTML = `
    <h2 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
      🔥 Itens do Dia
    </h2>
    <div class="bg-white shadow-lg rounded-lg p-6">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="py-2 text-left text-sm font-medium text-gray-700">Produto</th>
            <th class="py-2 text-left text-sm font-medium text-gray-700">Preço</th>
            <th class="py-2 text-left text-sm font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody id="listaItemDoDia" class="divide-y divide-gray-100"></tbody>
      </table>
    </div>
  `;

  try {
    const res = await fetch(
      "http://localhost:5000/api/produtos?itemDoDia=true"
    );
    const produtos = await res.json();
    const tbody = document.getElementById("listaItemDoDia");
    tbody.innerHTML = "";

    if (produtos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="py-4 text-center text-gray-500">Nenhum item do dia cadastrado.</td></tr>`;
      return;
    }

    produtos.forEach((produto) => {
      const tr = document.createElement("tr");
      const imgSrc = produto.imagens?.[0] || "/uploads/sem-imagem.png";

      tr.innerHTML = `
        <td class="py-3">
          <div class="flex items-center gap-3">
            <img src="${imgSrc}" alt="${
        produto.nome
      }" class="w-12 h-12 object-cover rounded">
            <span class="font-medium">${produto.nome}</span>
          </div>
        </td>
        <td class="py-3 text-sm">R$ ${produto.preco?.toFixed(2)}</td>
        <td class="py-3 text-sm space-x-2">
          <button onclick="editarItemDoDia('${produto._id}')" 
                  class="text-blue-600 hover:text-blue-800 font-medium text-sm">Editar</button>
          <button onclick="removerItemDoDia('${produto._id}', '${
        produto.nome
      }')" 
                  class="text-red-600 hover:text-red-800 font-medium text-sm">Remover</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    mostrarMensagem(`❌ Falha ao carregar itens do dia: ${err.message}`, "red");
  }
};
