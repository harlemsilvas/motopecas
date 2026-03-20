// backend/admin/components/produtos.js

(function () {
  let modo = "cadastro";
  let produtoAtual = null;
  let imagensExistentes = [];
  let novasImagens = [];
  let imagensRemovidas = [];
  const LIMITE = 10;

  // ==================== Carregar lista de produtos ====================
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
        const img = p.imagens?.[0] || "/uploads/sem-imagem.png";
        const cats = (p.categorias || []).map((c) => c.nome || "—").join(", ");
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50 transition";
        tr.innerHTML = `
          <td class="py-3 pr-3">
            <div class="flex items-center gap-3">
              <img src="${img}" alt="${p.nome}" class="w-12 h-12 object-cover rounded border" onerror="this.src='/uploads/sem-imagem.png'" />
              <div>
                <p class="font-medium text-gray-800">${p.nome}</p>
                <p class="text-xs text-gray-400">${cats || "Sem categoria"}</p>
              </div>
            </div>
          </td>
          <td class="py-3 text-sm text-gray-700">
            ${p.precoPromocional ? `<span class="line-through text-gray-400 mr-1">R$ ${p.preco.toFixed(2)}</span><span class="text-green-600 font-semibold">R$ ${p.precoPromocional.toFixed(2)}</span>` : `R$ ${p.preco.toFixed(2)}`}
          </td>
          <td class="py-3 text-sm">${p.itemDoDia ? '<span class="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">★ Sim</span>' : '<span class="text-gray-400 text-xs">Não</span>'}</td>
          <td class="py-3 text-sm">
            <button data-editar="${p._id}" class="text-blue-600 hover:text-blue-800 font-medium mr-3 text-sm">Editar</button>
            <button data-excluir="${p._id}" data-nome="${p.nome}" class="text-red-600 hover:text-red-800 font-medium text-sm">Excluir</button>
          </td>`;
        tbody.appendChild(tr);
      });

      // Bind dos botões via delegação
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

  // ==================== Editar produto ====================
  async function editarProduto(id) {
    try {
      const res = await fetch(`${API_URL}/api/produtos/${id}`);
      if (!res.ok) throw new Error("Produto não encontrado");
      produtoAtual = await res.json();
      modo = "edicao";

      document.getElementById("produtoId").value = produtoAtual._id;
      document.getElementById("tituloFormProduto").textContent =
        "Editar Produto";
      document.querySelector("#formProduto input[name='nome']").value =
        produtoAtual.nome;
      document.querySelector("#formProduto textarea[name='descricao']").value =
        produtoAtual.descricao || "";
      document.querySelector("#formProduto input[name='itemDoDia']").checked =
        produtoAtual.itemDoDia;

      const precoInput = document.querySelector(
        "#formProduto input[name='preco']",
      );
      const precoPromoInput = document.querySelector(
        "#formProduto input[name='precoPromocional']",
      );
      if (precoInput)
        precoInput.value = formatarMoeda(
          String(Math.round(produtoAtual.preco * 100)),
        );
      if (precoPromoInput && produtoAtual.precoPromocional) {
        precoPromoInput.value = formatarMoeda(
          String(Math.round(produtoAtual.precoPromocional * 100)),
        );
      }

      // Selecionar categorias
      const select = document.getElementById("selectCategorias");
      if (select) {
        const ids = (produtoAtual.categorias || []).map((c) => c._id || c);
        Array.from(select.options).forEach((opt) => {
          opt.selected = ids.includes(opt.value);
        });
      }

      imagensExistentes = [...(produtoAtual.imagens || [])];
      novasImagens = [];
      renderImagens();

      document.getElementById("btnCancelarProduto").classList.remove("hidden");
      document.getElementById("btnSubmitProduto").textContent =
        "Salvar Alterações";
      document
        .getElementById("btnSubmitProduto")
        .classList.replace("bg-blue-600", "bg-green-600");
      document
        .getElementById("btnSubmitProduto")
        .classList.replace("hover:bg-blue-700", "hover:bg-green-700");

      document
        .getElementById("formProduto")
        .scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      mostrarMensagem("Erro ao carregar produto: " + err.message, "error");
    }
  }

  // ==================== Excluir produto ====================
  async function excluirProduto(id, nome) {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/produtos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mostrarMensagem(`"${nome}" excluído com sucesso!`, "success");
        carregarProdutos();
      } else {
        const r = await res.json();
        mostrarMensagem("Erro: " + (r.error || "Falha ao excluir"), "error");
      }
    } catch (err) {
      mostrarMensagem("Erro de conexão: " + err.message, "error");
    }
  }

  // ==================== Upload de imagens e preview ====================
  function setupUpload() {
    const input = document.getElementById("uploadImagens");
    if (!input) return;
    input.addEventListener("change", (e) => {
      const files = Array.from(e.target.files).filter((f) => {
        if (f.size > 5 * 1024 * 1024) {
          mostrarMensagem(`${f.name} excede 5MB`, "error");
          return false;
        }
        if (
          ![".jpg", ".jpeg", ".png", ".webp"].includes(
            f.name.toLowerCase().substring(f.name.lastIndexOf(".")),
          )
        ) {
          mostrarMensagem(`${f.name}: formato inválido`, "error");
          return false;
        }
        return true;
      });
      if (!files.length) return;
      const total = imagensExistentes.length + novasImagens.length;
      if (total + files.length > LIMITE) {
        mostrarMensagem(`Máximo de ${LIMITE} imagens atingido.`, "warning");
        return;
      }
      novasImagens.push(...files);
      renderImagens();
      input.value = "";
    });
  }

  function renderImagens() {
    const container = document.getElementById("previewImagens");
    const contador = document.getElementById("contadorImagens");
    if (!container) return;
    container.innerHTML = "";

    imagensExistentes.forEach((url, i) => {
      const div = document.createElement("div");
      div.className = "relative";
      div.innerHTML = `
        <img src="${url}" class="w-16 h-16 object-cover rounded border" onerror="this.src='/uploads/sem-imagem.png'" />`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "absolute -top-1 -right-1 bg-red-500 hover:bg-red-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow";
      btn.textContent = "✕";
      btn.addEventListener("click", () => {
        imagensRemovidas.push(imagensExistentes.splice(i, 1)[0]);
        renderImagens();
      });
      div.appendChild(btn);
      container.appendChild(div);
    });

    novasImagens.forEach((file, i) => {
      const div = document.createElement("div");
      div.className = "relative border-2 border-dashed border-blue-400 rounded";
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "w-16 h-16 object-cover rounded";
        img.title = file.name;
        div.prepend(img);
        const span = document.createElement("span");
        span.className =
          "absolute inset-0 flex items-center justify-center bg-black/50 text-white text-[10px] font-bold rounded pointer-events-none";
        span.textContent = "NOVA";
        div.appendChild(span);
      };
      reader.readAsDataURL(file);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "absolute -top-1 -right-1 bg-orange-500 hover:bg-orange-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow";
      btn.textContent = "✕";
      btn.addEventListener("click", () => {
        novasImagens.splice(i, 1);
        renderImagens();
      });
      div.appendChild(btn);
      container.appendChild(div);
    });

    const total = imagensExistentes.length + novasImagens.length;
    if (contador) {
      contador.textContent = `${total}/${LIMITE} imagens`;
      contador.className =
        total >= LIMITE
          ? "text-red-500 text-xs mt-1"
          : "text-gray-400 text-xs mt-1";
    }

    const secao = document.getElementById("secaoImagens");
    if (secao)
      secao.classList.toggle("hidden", total === 0 && modo === "cadastro");
  }

  // (exclusão de imagens via addEventListener inline em renderImagens)

  // ==================== Carregar categorias no select ====================
  async function carregarCategoriasSelect() {
    try {
      const res = await fetch(`${API_URL}/api/categorias`);
      const categorias = await res.json();
      const select = document.getElementById("selectCategorias");
      if (!select) return;
      select.innerHTML = "";
      categorias.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat._id;
        opt.textContent = cat.nome;
        if (produtoAtual?.categorias?.map((c) => c._id || c).includes(cat._id))
          opt.selected = true;
        select.appendChild(opt);
      });
    } catch (err) {
      mostrarMensagem("Erro ao carregar categorias", "error");
    }
  }

  // ==================== Submit do formulário ====================
  function setupFormSubmit() {
    const form = document.getElementById("formProduto");
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const precoInput = form.querySelector("input[name='preco']");
      const precoPromoInput = form.querySelector(
        "input[name='precoPromocional']",
      );
      const preco = parseMoeda(precoInput.value);
      const precoPromocional = precoPromoInput.value
        ? parseMoeda(precoPromoInput.value)
        : undefined;

      if (isNaN(preco) || preco <= 0) {
        mostrarMensagem("Preencha um preço válido.", "error");
        return;
      }
      if (precoPromocional && precoPromocional >= preco) {
        mostrarMensagem(
          "O preço promocional deve ser menor que o preço normal.",
          "error",
        );
        return;
      }
      if (!form.nome.value.trim()) {
        mostrarMensagem("Preencha o nome do produto.", "error");
        return;
      }

      const data = {
        nome: form.nome.value.trim(),
        descricao: form.descricao.value.trim(),
        preco,
        precoPromocional,
        imagens: [...imagensExistentes],
        itemDoDia: form.itemDoDia.checked,
        categorias: Array.from(
          document.getElementById("selectCategorias")?.selectedOptions || [],
        ).map((o) => o.value),
      };

      let produtoId = document.getElementById("produtoId")?.value;

      try {
        // Se for novo produto, cria primeiro para obter o ID
        if (!produtoId) {
          const criarRes = await fetch(`${API_URL}/api/produtos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, imagens: [] }),
          });
          if (!criarRes.ok) {
            const r = await criarRes.json();
            throw new Error(r.error || "Falha ao criar produto");
          }
          const novoProduto = await criarRes.json();
          produtoId = novoProduto._id;
        }

        // Upload de novas imagens na subpasta do produto
        if (novasImagens.length > 0) {
          const fd = new FormData();
          novasImagens.forEach((f) => fd.append("imagens", f));
          const upRes = await fetch(
            `${API_URL}/api/upload-multiple/produtos/${produtoId}`,
            { method: "POST", body: fd },
          );
          if (!upRes.ok)
            throw new Error((await upRes.json()).error || "Falha no upload");
          const result = await upRes.json();
          data.imagens.push(...result.urls);
        }

        // Excluir imagens removidas do servidor
        for (const url of imagensRemovidas) {
          try {
            await fetch(`${API_URL}/api/upload`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ file: url }),
            });
          } catch (_) {
            /* ignora erros de exclusão de arquivo */
          }
        }

        // Atualiza o produto com as imagens finais
        const putRes = await fetch(`${API_URL}/api/produtos/${produtoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!putRes.ok) {
          const r = await putRes.json();
          throw new Error(r.error || "Falha ao salvar produto");
        }

        mostrarMensagem(
          `Produto ${modo === "edicao" ? "atualizado" : "cadastrado"} com sucesso!`,
          "success",
        );
        limparFormulario();
        carregarProdutos();
      } catch (err) {
        mostrarMensagem("Erro: " + err.message, "error");
      }
    };
  }

  // ==================== Limpar formulário ====================
  function limparFormulario() {
    const form = document.getElementById("formProduto");
    if (form) form.reset();
    modo = "cadastro";
    produtoAtual = null;
    imagensExistentes = [];
    novasImagens = [];
    imagensRemovidas = [];

    const id = document.getElementById("produtoId");
    if (id) id.value = "";

    const titulo = document.getElementById("tituloFormProduto");
    if (titulo) titulo.textContent = "Cadastrar Produto";

    const btnCancelar = document.getElementById("btnCancelarProduto");
    if (btnCancelar) btnCancelar.classList.add("hidden");

    const btnSubmit = document.getElementById("btnSubmitProduto");
    if (btnSubmit) {
      btnSubmit.textContent = "Cadastrar Produto";
      btnSubmit.classList.replace("bg-green-600", "bg-blue-600");
      btnSubmit.classList.replace("hover:bg-green-700", "hover:bg-blue-700");
    }

    renderImagens();
  }

  // ==================== Render principal ====================
  window.renderProdutos = function () {
    const content = document.getElementById("adminContent");
    if (!content) return;

    content.innerHTML = `
      <!-- Formulário -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 id="tituloFormProduto" class="text-xl font-semibold text-gray-800 mb-5">Cadastrar Produto</h2>
        <form id="formProduto">
          <input type="hidden" id="produtoId" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do produto *</label>
              <input required name="nome" placeholder="Ex: Kit Coroa e Pinhão"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
              <input type="text" name="preco" placeholder="R$ 299,90" autocomplete="off"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Preço promocional (R$)</label>
              <input type="text" name="precoPromocional" placeholder="R$ 249,90" autocomplete="off"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Imagens (até ${LIMITE})</label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" id="uploadImagens" multiple
                class="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
              <div id="contadorImagens" class="text-xs text-gray-400 mt-1">0/${LIMITE} imagens</div>
            </div>
          </div>

          <!-- Preview de imagens -->
          <div id="secaoImagens" class="hidden mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-2">Imagens selecionadas</label>
            <div id="previewImagens" class="flex flex-wrap gap-3"></div>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea name="descricao" placeholder="Detalhes do produto..." rows="3"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categorias</label>
              <select id="selectCategorias" multiple
                class="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </select>
              <p class="text-xs text-gray-400 mt-1">Segure Ctrl para selecionar várias.</p>
            </div>
            <div class="flex items-center">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="itemDoDia" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                <span class="text-sm font-medium text-gray-700">Marcar como <strong>"Item do Dia"</strong></span>
              </label>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="submit" id="btnSubmitProduto"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow transition">
              Cadastrar Produto
            </button>
            <button type="button" id="btnCancelarProduto"
              class="hidden bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition"
              onclick="window._cancelarProduto()">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Tabela de produtos -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Produtos Cadastrados</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 text-left text-sm font-medium text-gray-600">Produto</th>
                <th class="py-3 text-left text-sm font-medium text-gray-600">Preço</th>
                <th class="py-3 text-left text-sm font-medium text-gray-600">Item do Dia</th>
                <th class="py-3 text-left text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody id="listaProdutos" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>
      </div>`;

    // Setup eventos
    aplicarMascara(document.querySelector("#formProduto input[name='preco']"));
    aplicarMascara(
      document.querySelector("#formProduto input[name='precoPromocional']"),
    );
    setupUpload();
    setupFormSubmit();
    carregarProdutos();
    carregarCategoriasSelect();
  };

  window._cancelarProduto = limparFormulario;
})();
