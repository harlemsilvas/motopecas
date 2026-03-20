// backend/admin/components/categorias.js

(function () {
  let imagemAtual = ""; // URL da imagem existente (edição)
  let novaImagem = null; // File (novo upload)
  let imagemRemovida = ""; // URL da imagem que foi removida pelo usuário

  // ==================== Carregar categorias ====================
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
        tr.innerHTML = `
          <td class="py-3 pr-3">
            <div class="flex items-center gap-3">
              ${cat.imagem ? `<img src="${cat.imagem}" alt="${cat.nome}" class="w-10 h-10 object-cover rounded border" onerror="this.style.display='none'" />` : `<div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-lg">📁</div>`}
              <div>
                <p class="font-medium text-gray-800">${cat.nome}</p>
                <p class="text-xs text-gray-400">${cat.descricao || "Sem descrição"}</p>
              </div>
            </div>
          </td>
          <td class="py-3 text-sm text-gray-600">${cat.ordem ?? 0}</td>
          <td class="py-3 text-sm">${cat.ativa !== false ? '<span class="text-green-600 font-medium">Ativa</span>' : '<span class="text-gray-400">Oculta</span>'}</td>
          <td class="py-3 text-sm text-gray-400">${(cat.produtos || []).length} produto(s)</td>
          <td class="py-3 text-sm">
            <button data-editar-cat="${cat._id}" class="text-blue-600 hover:text-blue-800 font-medium mr-3 text-sm">Editar</button>
            <button data-excluir-cat="${cat._id}" data-nome="${cat.nome}" class="text-red-600 hover:text-red-800 font-medium text-sm">Excluir</button>
          </td>`;
        tbody.appendChild(tr);
      });

      // Delegação de eventos
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

  // ==================== Editar categoria ====================
  async function editarCategoria(id) {
    try {
      const res = await fetch(`${API_URL}/api/categorias/${id}`);
      if (!res.ok) throw new Error("Categoria não encontrada");
      const cat = await res.json();

      document.getElementById("categoriaId").value = cat._id;
      document.querySelector("#formCategoria input[name='nome']").value =
        cat.nome;
      document.querySelector(
        "#formCategoria textarea[name='descricao']",
      ).value = cat.descricao || "";
      document.querySelector("#formCategoria input[name='ordem']").value =
        cat.ordem ?? 0;
      document.getElementById("categoriaAtiva").checked = cat.ativa !== false;

      imagemAtual = cat.imagem || "";
      novaImagem = null;
      renderPreviewImagem();

      document.getElementById("tituloFormCategoria").textContent =
        "Editar Categoria";
      document.getElementById("btnSubmitCategoria").textContent =
        "Salvar Alterações";
      document
        .getElementById("btnSubmitCategoria")
        .classList.replace("bg-blue-600", "bg-green-600");
      document
        .getElementById("btnSubmitCategoria")
        .classList.replace("hover:bg-blue-700", "hover:bg-green-700");
      document
        .getElementById("btnCancelarCategoria")
        .classList.remove("hidden");

      document
        .getElementById("formCategoria")
        .scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      mostrarMensagem("Erro ao carregar categoria: " + err.message, "error");
    }
  }

  // ==================== Excluir categoria ====================
  async function excluirCategoria(id, nome) {
    if (
      !confirm(`Excluir categoria "${nome}"? Esta ação não pode ser desfeita.`)
    )
      return;
    try {
      const res = await fetch(`${API_URL}/api/categorias/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mostrarMensagem(`"${nome}" excluída com sucesso!`, "success");
        carregarCategorias();
      } else {
        const r = await res.json();
        mostrarMensagem("Erro: " + (r.error || "Falha ao excluir"), "error");
      }
    } catch (err) {
      mostrarMensagem("Erro de conexão: " + err.message, "error");
    }
  }

  // ==================== Preview de imagem ====================
  function renderPreviewImagem() {
    const container = document.getElementById("previewImagemCategoria");
    if (!container) return;
    container.innerHTML = "";

    function criarBtnRemover() {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "absolute -top-1 -right-1 bg-red-500 hover:bg-red-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow";
      btn.textContent = "✕";
      btn.addEventListener("click", () => {
        if (imagemAtual) imagemRemovida = imagemAtual;
        imagemAtual = "";
        novaImagem = null;
        const input = document.getElementById("uploadImagemCategoria");
        if (input) input.value = "";
        renderPreviewImagem();
      });
      return btn;
    }

    if (novaImagem) {
      const div = document.createElement("div");
      div.className = "relative inline-block";
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "w-20 h-20 object-cover rounded border";
        div.prepend(img);
        const span = document.createElement("span");
        span.className =
          "absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center rounded-b";
        span.textContent = "NOVA";
        div.appendChild(span);
      };
      reader.readAsDataURL(novaImagem);
      div.appendChild(criarBtnRemover());
      container.appendChild(div);
    } else if (imagemAtual) {
      const div = document.createElement("div");
      div.className = "relative inline-block";
      div.innerHTML = `<img src="${apiImg(imagemAtual)}" class="w-20 h-20 object-cover rounded border" onerror="this.src=apiImg('/sem-imagem.png')" />`;
      div.appendChild(criarBtnRemover());
      container.appendChild(div);
    } else {
      container.innerHTML = `<p class="text-xs text-gray-400">Nenhuma imagem selecionada</p>`;
    }
  }

  // (exclusão de imagem via addEventListener inline em renderPreviewImagem)

  // ==================== Setup upload ====================
  function setupUploadCategoria() {
    const input = document.getElementById("uploadImagemCategoria");
    if (!input) return;
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        mostrarMensagem("Arquivo excede 5MB", "error");
        input.value = "";
        return;
      }
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        mostrarMensagem("Formato inválido. Use .jpg, .png ou .webp", "error");
        input.value = "";
        return;
      }
      novaImagem = file;
      renderPreviewImagem();
    });
  }

  // ==================== Submit do formulário ====================
  function setupFormSubmit() {
    const form = document.getElementById("formCategoria");
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      if (!nome) {
        mostrarMensagem("Preencha o nome da categoria.", "error");
        return;
      }

      let imagemUrl = imagemAtual;
      const data = {
        nome,
        descricao: form.descricao.value.trim(),
        ordem: parseInt(form.ordem.value) || 0,
        ativa: document.getElementById("categoriaAtiva").checked,
      };

      let categoriaId = document.getElementById("categoriaId").value;

      try {
        // Se for nova categoria, cria primeiro para obter o ID
        if (!categoriaId) {
          const criarRes = await fetch(`${API_URL}/api/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, imagem: "" }),
          });
          if (!criarRes.ok) {
            const r = await criarRes.json();
            throw new Error(r.error || "Falha ao criar categoria");
          }
          const novaCat = await criarRes.json();
          categoriaId = novaCat._id;
        }

        // Upload de nova imagem na subpasta da categoria
        if (novaImagem) {
          const fd = new FormData();
          fd.append("imagem", novaImagem);
          const upRes = await fetch(
            `${API_URL}/api/upload/categorias/${categoriaId}`,
            { method: "POST", body: fd },
          );
          if (!upRes.ok)
            throw new Error((await upRes.json()).error || "Falha no upload");
          const result = await upRes.json();
          imagemUrl = result.url;
        }

        // Excluir imagem removida do servidor
        if (imagemRemovida) {
          try {
            await fetch(`${API_URL}/api/upload`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ file: imagemRemovida }),
            });
          } catch (_) {
            /* ignora erros de exclusão de arquivo */
          }
        }

        // Atualiza a categoria com a imagem final
        data.imagem = imagemUrl;
        const putRes = await fetch(`${API_URL}/api/categorias/${categoriaId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!putRes.ok) {
          const r = await putRes.json();
          throw new Error(r.error || "Falha ao salvar categoria");
        }

        mostrarMensagem(
          `Categoria ${document.getElementById("categoriaId").value ? "atualizada" : "cadastrada"} com sucesso!`,
          "success",
        );
        limparFormulario();
        carregarCategorias();
      } catch (err) {
        mostrarMensagem("Erro: " + err.message, "error");
      }
    };
  }

  // ==================== Limpar formulário ====================
  function limparFormulario() {
    const form = document.getElementById("formCategoria");
    if (form) form.reset();
    document.getElementById("categoriaId").value = "";
    imagemAtual = "";
    novaImagem = null;
    imagemRemovida = "";
    renderPreviewImagem();

    document.getElementById("tituloFormCategoria").textContent =
      "Cadastrar Categoria";
    const btn = document.getElementById("btnSubmitCategoria");
    if (btn) {
      btn.textContent = "Cadastrar Categoria";
      btn.classList.replace("bg-green-600", "bg-blue-600");
      btn.classList.replace("hover:bg-green-700", "hover:bg-blue-700");
    }
    document.getElementById("btnCancelarCategoria")?.classList.add("hidden");
  }

  // ==================== Render principal ====================
  window.renderCategorias = function () {
    const content = document.getElementById("adminContent");
    if (!content) return;

    content.innerHTML = `
      <!-- Formulário -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 id="tituloFormCategoria" class="text-xl font-semibold text-gray-800 mb-5">Cadastrar Categoria</h2>
        <form id="formCategoria">
          <input type="hidden" id="categoriaId" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome da categoria *</label>
              <input required name="nome" placeholder="Ex: Freios"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ordem de exibição</label>
              <input type="number" name="ordem" value="0" min="0"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea name="descricao" placeholder="Descrição da categoria..." rows="2"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
          </div>

          <div class="mb-5 flex items-center gap-3">
            <input type="checkbox" name="ativa" id="categoriaAtiva" checked class="w-5 h-5 text-blue-600 rounded" />
            <label for="categoriaAtiva" class="text-sm font-medium text-gray-700">Exibir na página inicial</label>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1">Imagem / Ícone</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp" id="uploadImagemCategoria"
              class="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <div id="previewImagemCategoria" class="mt-3">
              <p class="text-xs text-gray-400">Nenhuma imagem selecionada</p>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="submit" id="btnSubmitCategoria"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow transition">
              Cadastrar Categoria
            </button>
            <button type="button" id="btnCancelarCategoria"
              class="hidden bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition"
              onclick="window._cancelarCategoria()">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Tabela de categorias -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Categorias Cadastradas</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 text-left text-sm font-medium text-gray-600">Categoria</th>
                <th class="py-3 text-left text-sm font-medium text-gray-600">Ordem</th>
                <th class="py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th class="py-3 text-left text-sm font-medium text-gray-600">Produtos</th>
                <th class="py-3 text-left text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody id="listaCategorias" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>
      </div>`;

    setupUploadCategoria();
    setupFormSubmit();
    carregarCategorias();
  };

  window._cancelarCategoria = function () {
    limparFormulario();
  };
})();
