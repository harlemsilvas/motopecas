// backend/admin/components/categorias.js

// ✅ Expor funções globalmente para uso no HTML
window.editarCategoria = async function (id) {
  try {
    const res = await fetch(`http://localhost:5000/api/categorias/${id}`);
    if (!res.ok) throw new Error("Categoria não encontrada");
    const cat = await res.json();

    document.getElementById("categoriaId").value = cat._id;
    document.querySelector("input[name='nome']").value = cat.nome;
    document.querySelector("input[name='imagem']").value = cat.imagem || "";
    document.querySelector("textarea[name='descricao']").value =
      cat.descricao || "";

    // Atualiza o formulário para edição
    document.getElementById("tituloFormCategoria").textContent =
      "Editar Categoria";
    document.getElementById("btnSalvarCategoria").textContent =
      "Atualizar Categoria";
    document
      .getElementById("btnCancelarEdicaoCategoria")
      .classList.remove("hidden");
  } catch (err) {
    mostrarMensagem(`❌ Erro ao carregar categoria: ${err.message}`, "red");
  }
};

window.excluirCategoria = async function (id, nome) {
  if (!confirm(`Excluir categoria "${nome}"?`)) return;
  try {
    await fetch(`http://localhost:5000/api/categorias/${id}`, {
      method: "DELETE",
    });
    mostrarMensagem(`✅ "${nome}" excluída!`, "green");
    carregarCategorias();
  } catch (err) {
    mostrarMensagem(`❌ Erro ao excluir: ${err.message}`, "red");
  }
};

// Função para salvar (cadastrar ou editar)
window.salvarCategoria = async function (e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    nome: form.nome.value.trim(),
    descricao: form.descricao.value.trim(),
    imagem: form.imagem.value.trim(),
  };

  const id = document.getElementById("categoriaId").value;
  const method = id ? "PUT" : "POST";
  const url = id
    ? `http://localhost:5000/api/categorias/${id}`
    : "http://localhost:5000/api/categorias";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const acao = id ? "atualizada" : "criada";
      mostrarMensagem(`✅ Categoria ${acao} com sucesso!`, "green");
      form.reset();
      document.getElementById("categoriaId").value = "";
      // Resetar UI para cadastro
      document.getElementById("tituloFormCategoria").textContent =
        "Cadastrar Categoria";
      document.getElementById("btnSalvarCategoria").textContent =
        "Cadastrar Categoria";
      document
        .getElementById("btnCancelarEdicaoCategoria")
        .classList.add("hidden");
      carregarCategorias();
    } else {
      const result = await res.json();
      mostrarMensagem(`❌ Erro: ${result.error}`, "red");
    }
  } catch (err) {
    mostrarMensagem(`❌ Erro: ${err.message}`, "red");
  }
};

// Carregar categorias
async function carregarCategorias() {
  try {
    const res = await fetch("http://localhost:5000/api/categorias");
    const categorias = await res.json();
    const tbody = document.getElementById("listaCategorias");
    tbody.innerHTML = "";

    categorias.forEach((cat) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="py-3">${cat.nome}</td>
        <td class="py-3 text-sm space-x-2">
          <button onclick="editarCategoria('${cat._id}')" class="text-blue-600">Editar</button>
          <button onclick="excluirCategoria('${cat._id}', '${cat.nome}')" class="text-red-600">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    mostrarMensagem("❌ Erro ao carregar categorias", "red");
  }
}

// Função principal para renderizar a página
window.renderCategorias = function () {
  const content = document.getElementById("adminContent");
  content.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">Gerenciar Categorias</h2>
    <form id="formCategoria" class="bg-white p-6 rounded-lg shadow mb-8">
      <input type="hidden" id="categoriaId" />
      <h3 id="tituloFormCategoria" class="text-xl font-semibold mb-4">Cadastrar Categoria</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label>
          <input required name="nome" class="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Imagem (URL)</label>
          <input name="imagem" placeholder="https://..." class="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea name="descricao" rows="3" class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
      </div>
      <button type="submit" id="btnSalvarCategoria" class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500">
        Cadastrar Categoria
      </button>
      <button type="button" id="btnCancelarEdicaoCategoria" class="ml-3 bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 hidden">
        Cancelar
      </button>
    </form>

    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-xl font-semibold mb-4">Categorias Cadastradas</h3>
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="py-2 text-left">Nome</th>
            <th class="py-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody id="listaCategorias" class="divide-y divide-gray-100"></tbody>
      </table>
    </div>
  `;

  // ✅ Adiciona o evento de submit
  document.getElementById("formCategoria").onsubmit = salvarCategoria;

  // ✅ Botão cancelar
  document.getElementById("btnCancelarEdicaoCategoria").onclick = () => {
    document.getElementById("formCategoria").reset();
    document.getElementById("categoriaId").value = "";
    document.getElementById("tituloFormCategoria").textContent =
      "Cadastrar Categoria";
    document.getElementById("btnSalvarCategoria").textContent =
      "Cadastrar Categoria";
    document
      .getElementById("btnCancelarEdicaoCategoria")
      .classList.add("hidden");
  };

  // Carrega as categorias
  carregarCategorias();
};
