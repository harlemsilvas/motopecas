// backend/admin/components/produtos.js

let modo = "cadastro";
let produtoAtual = null;
let imagensEmEdicao = [];
let novasImagensParaUpload = [];

const LIMITE_IMAGENS = 10;

/**
 * Função para formatar valor monetário (R$)
 */
function formatarMoeda(valor) {
  const numeros = valor.replace(/\D/g, "");
  const valorEmCentavos = (numeros / 100).toFixed(2);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorEmCentavos);
}

/**
 * Função para converter string formatada para número
 */
function parseMoeda(valor) {
  if (!valor || valor === "R$ 0,00") return 0;
  return parseFloat(
    valor
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  );
}

/**
 * Aplica máscara de moeda em um campo
 */
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

/**
 * Carrega e exibe todos os produtos
 */
async function carregarProdutos() {
  try {
    const res = await fetch("http://localhost:5000/api/produtos");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const produtos = await res.json();
    const tbody = document.getElementById("listaProdutos");
    tbody.innerHTML = "";

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
        <td class="py-3 text-sm">${produto.itemDoDia ? "✅ Sim" : "❌ Não"}</td>
        <td class="py-3 text-sm space-x-2">
          <button class="btn-editar text-blue-600 hover:text-blue-800 font-medium text-sm">Editar</button>
          <button class="btn-excluir text-red-600 hover:text-red-800 font-medium text-sm">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);

      tr.querySelector(".btn-editar").addEventListener("click", () =>
        editarProduto(produto._id)
      );
      tr.querySelector(".btn-excluir").addEventListener("click", () =>
        excluirProduto(produto._id, produto.nome)
      );
    });
  } catch (err) {
    mostrarMensagem(`❌ Falha ao carregar produtos: ${err.message}`, "red");
  }
}

/**
 * Exclui um produto
 */
async function excluirProduto(id, nome) {
  if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
  try {
    const res = await fetch(`http://localhost:5000/api/produtos/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      mostrarMensagem(`✅ "${nome}" excluído com sucesso!`, "green");
      carregarProdutos();
    } else {
      const result = await res.json();
      mostrarMensagem(`❌ Erro: ${result.error || "Algo deu errado"}`, "red");
    }
  } catch (err) {
    mostrarMensagem(`❌ Erro de conexão: ${err.message}`, "red");
  }
}

/**
 * Edita um produto
 */
async function editarProduto(id) {
  try {
    const res = await fetch(`http://localhost:5000/api/produtos/${id}`);
    if (!res.ok) throw new Error("Produto não encontrado");
    produtoAtual = await res.json();

    // Força recarregar o formulário
    window.renderProdutos();

    // Define que estamos em modo edição
    modo = "edicao";
  } catch (err) {
    mostrarMensagem(`❌ Erro ao carregar produto: ${err.message}`, "red");
  }
}

/**
 * Cancelar edição
 */
function setupCancelarEdicao() {
  const btn = document.getElementById("btnCancelarEdicao");
  if (btn) {
    btn.onclick = () => limparFormulario();
  }
}

/**
 * Adicionar mais imagens
 */
function setupAdicionarImagem() {
  const btn = document.getElementById("btnAdicionarImagem");
  if (btn) {
    btn.onclick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = true;
      input.onchange = (e) => {
        const files = Array.from(e.target.files).filter((file) => {
          if (file.size > 5 * 1024 * 1024) {
            mostrarMensagem(`❌ ${file.name} é muito grande (máx. 5MB)`, "red");
            return false;
          }
          const ext = file.name
            .toLowerCase()
            .substring(file.name.lastIndexOf("."));
          if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
            mostrarMensagem(
              `❌ ${file.name} tem formato inválido. Use .jpg, .png, .webp`,
              "red"
            );
            return false;
          }
          return true;
        });

        if (files.length === 0) return;

        const totalAtual =
          imagensEmEdicao.length + novasImagensParaUpload.length;
        if (totalAtual + files.length > LIMITE_IMAGENS) {
          mostrarMensagem(
            `❌ Máximo de ${LIMITE_IMAGENS} imagens. Você tem ${totalAtual}, tentando adicionar ${files.length}.`,
            "red"
          );
          return;
        }

        novasImagensParaUpload.push(...files);
        atualizarListaImagensEdicao();
        mostrarMensagem(`✅ ${files.length} imagem(ns) adicionada(s)`, "blue");
      };
      input.click();
    };
  }
}

/**
 * Configura o envio do formulário
 */
function setupFormSubmit() {
  const form = document.getElementById("formProduto");
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();

    const precoInput = document.querySelector("input[name='preco']");
    const precoPromoInput = document.querySelector(
      "input[name='precoPromocional']"
    );

    const preco = parseMoeda(precoInput.value);
    const precoPromocional = precoPromoInput.value
      ? parseMoeda(precoPromoInput.value)
      : undefined;

    if (isNaN(preco) || preco <= 0) {
      mostrarMensagem("❌ Preencha um preço válido.", "red");
      return;
    }

    if (
      precoPromocional &&
      (isNaN(precoPromocional) || precoPromocional >= preco)
    ) {
      mostrarMensagem(
        "❌ O preço promocional deve ser menor que o preço normal.",
        "red"
      );
      return;
    }

    const data = {
      nome: form.nome.value.trim(),
      descricao: form.descricao.value.trim(),
      preco,
      precoPromocional,
      imagens: [...imagensEmEdicao],
      itemDoDia: form.itemDoDia.checked,
      categorias: [],
    };

    const select = document.getElementById("selectCategorias");
    if (select) {
      data.categorias = Array.from(select.selectedOptions).map(
        (opt) => opt.value
      );
    }

    if (!data.nome) {
      mostrarMensagem("❌ Preencha o nome do produto.", "red");
      return;
    }

    if (novasImagensParaUpload.length > 0) {
      const formData = new FormData();
      novasImagensParaUpload.forEach((file) =>
        formData.append("imagens", file)
      );

      try {
        const res = await fetch("http://localhost:5000/api/upload-multiple", {
          method: "POST",
          body: formData,
        });

        if (!res.ok)
          throw new Error((await res.json()).error || "Falha no upload");

        const result = await res.json();
        data.imagens.push(...result.urls);
      } catch (err) {
        mostrarMensagem(`❌ Erro no upload: ${err.message}`, "red");
        return;
      }
    }

    // ✅ Usa o ID do campo oculto para decidir PUT ou POST
    const id = document.getElementById("produtoId")?.value || "";
    const method = id ? "PUT" : "POST";
    const url = `http://localhost:5000/api/produtos${id ? "/" + id : ""}`;

    console.log("🚀 Enviando", method, "para", url);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const acao = id ? "atualizado" : "cadastrado";
        mostrarMensagem(`✅ Produto ${acao} com sucesso!`, "green");
        limparFormulario();
        carregarProdutos();
      } else {
        const result = await res.json();
        mostrarMensagem(
          `❌ Erro: ${result.error || "Requisição inválida"}`,
          "red"
        );
      }
    } catch (err) {
      mostrarMensagem(`❌ Erro de conexão: ${err.message}`, "red");
    }
  };
}

/**
 * Atualiza a lista de imagens na edição
 */
function atualizarListaImagensEdicao() {
  const container = document.getElementById("listaImagensEdicao");
  const contador = document.getElementById("contadorImagens");
  if (!container) return;
  container.innerHTML = "";

  imagensEmEdicao.forEach((url, index) => {
    const div = document.createElement("div");
    div.className = "relative";
    div.draggable = true;
    div.dataset.index = index;
    div.innerHTML = `
      <img src="${url}" class="h-16 w-16 object-cover rounded border" />
      <button type="button" onclick="removerImagem(${index})" 
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-600">✕</button>
      <div class="absolute -bottom-1 -left-1 bg-blue-500 text-white text-xs w-5 h-5 rounded flex items-center justify-center cursor-move opacity-80 hover:opacity-100" title="Arraste para reordenar">≡</div>
    `;
    container.appendChild(div);
  });

  novasImagensParaUpload.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.className = "relative border-2 border-dashed border-blue-400";
      div.innerHTML = `
        <img src="${e.target.result}" class="h-16 w-16 object-cover rounded" title="${file.name}" />
        <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs font-bold rounded">NOVA</div>
        <button type="button" onclick="removerNovaImagem(${index})" 
                class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-blue-600">+</button>
        <div class="absolute -bottom-1 -left-1 bg-blue-500 text-white text-xs w-5 h-5 rounded flex items-center justify-center cursor-move opacity-80 hover:opacity-100" title="Arraste para reordenar">≡</div>
      `;
      container.appendChild(div);
    };
    reader.readAsDataURL(file);
  });

  const total = imagensEmEdicao.length + novasImagensParaUpload.length;
  if (contador) {
    contador.textContent = `${total}/${LIMITE_IMAGENS} imagens`;
    contador.className =
      total >= LIMITE_IMAGENS
        ? "text-red-600 text-xs mt-1"
        : "text-gray-500 text-xs mt-1";
  }

  ativarDragAndDrop();
  const containerEdicao = document.getElementById("containerImagensEdicao");
  if (containerEdicao) containerEdicao.classList.remove("hidden");
}

/**
 * Remove uma imagem existente
 */
function removerImagem(index) {
  imagensEmEdicao.splice(index, 1);
  atualizarListaImagensEdicao();
  atualizarCampoLinksImagens(imagensEmEdicao);
}

/**
 * Remove uma nova imagem (ainda não enviada)
 */
function removerNovaImagem(index) {
  novasImagensParaUpload.splice(index, 1);
  atualizarListaImagensEdicao();
}

/**
 * Ativar drag-and-drop
 */
function ativarDragAndDrop() {
  const container = document.getElementById("listaImagensEdicao");
  if (!container) return;
  let draggedItem = null;

  container.addEventListener("dragstart", (e) => {
    draggedItem = e.target.closest("[draggable]");
  });

  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    if (afterElement == null) {
      container.appendChild(draggedItem);
    } else {
      container.insertBefore(draggedItem, afterElement);
    }
  });

  container.addEventListener("drop", () => {
    const novasImagens = [];
    container.querySelectorAll("[data-index]").forEach((el) => {
      const index = parseInt(el.dataset.index);
      novasImagens.push(imagensEmEdicao[index]);
    });
    imagensEmEdicao = novasImagens;
  });
}

/**
 * Helper para drag-and-drop
 */
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".relative:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/**
 * Atualizar campo de links
 */
function atualizarCampoLinksImagens(urls) {
  const campo = document.getElementById("campoLinksImagens");
  const lista = document.getElementById("listaLinksImagens");
  if (!lista) return;
  lista.innerHTML = "";

  if (urls && urls.length > 0) {
    urls.forEach((url) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.className =
        "block text-blue-600 hover:underline text-xs mb-1 break-all";
      a.textContent = url;
      lista.appendChild(a);
    });
    if (campo) campo.classList.remove("hidden");
  } else {
    if (campo) campo.classList.add("hidden");
  }
}

/**
 * Atualizar botão principal conforme modo
 */
function atualizarBotaoPrincipal() {
  const btnIcon = document.getElementById("btnIcon");
  const btnText = document.getElementById("btnText");
  const btnSubmit = document.getElementById("btnSubmit");

  if (!btnIcon || !btnText || !btnSubmit) return;

  if (modo === "edicao") {
    btnText.textContent = "Salvar Alterações";
    btnIcon.setAttribute(
      "d",
      "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    );
    btnSubmit.classList.remove("bg-blue-600", "hover:bg-blue-500");
    btnSubmit.classList.add("bg-green-600", "hover:bg-green-500");
  } else {
    btnText.textContent = "Cadastrar Produto";
    btnIcon.setAttribute("d", "M5 13l4 4L19 7");
    btnSubmit.classList.remove("bg-green-600", "hover:bg-green-500");
    btnSubmit.classList.add("bg-blue-600", "hover:bg-blue-500");
  }
}

/**
 * Limpar formulário
 */
function limparFormulario() {
  const form = document.getElementById("formProduto");
  if (form) form.reset();

  const previewImagens = document.getElementById("previewImagens");
  if (previewImagens) previewImagens.innerHTML = "";

  const containerImagensEdicao = document.getElementById(
    "containerImagensEdicao"
  );
  if (containerImagensEdicao) containerImagensEdicao.classList.add("hidden");

  const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
  if (btnCancelarEdicao) btnCancelarEdicao.classList.add("hidden");

  modo = "cadastro";
  produtoAtual = null;
  imagensEmEdicao = [];
  novasImagensParaUpload = [];

  atualizarBotaoPrincipal();
}

/**
 * Carregar categorias no <select>
 */
async function carregarCategoriasSelect() {
  try {
    const res = await fetch("http://localhost:5000/api/categorias");
    const categorias = await res.json();
    const select = document.getElementById("selectCategorias");
    if (!select) return;
    select.innerHTML = "";

    categorias.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat._id;
      option.textContent = cat.nome;
      if (produtoAtual?.categorias?.map((c) => c._id || c).includes(cat._id)) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  } catch (err) {
    mostrarMensagem("❌ Erro ao carregar categorias", "red");
  }
}

/**
 * Renderiza a página de produtos
 */
function renderProdutos() {
  const content = document.getElementById("adminContent");
  content.innerHTML = `
    <h2 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Gerenciar Produtos
    </h2>
    <form id="formProduto" class="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 id="tituloForm" class="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Cadastrar Produto
      </h2>
      <input type="hidden" id="produtoId" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome do produto</label>
          <input required name="nome" placeholder="Ex: Kit Coroa e Pinhão" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Preço normal (R$)</label>
          <input type="text" name="preco" placeholder="299,90" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" autocomplete="off" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Preço promocional (R$)</label>
          <input type="text" name="precoPromocional" placeholder="249,90" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" autocomplete="off" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Imagem (upload local)</label>
          <input type="file" accept="image/*" id="uploadImagens" multiple class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" />
          <div id="previewImagens" class="flex flex-wrap gap-2 mt-2"></div>
        </div>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea name="descricao" placeholder="Detalhes do produto..." rows="3" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
      </div>
      <div class="flex items-center mb-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="itemDoDia" class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
          <span class="text-sm font-medium text-gray-700">Marcar como <strong>"Item do Dia"</strong></span>
        </label>
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Categorias</label>
        <select id="selectCategorias" multiple class="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></select>
      </div>
      <div id="containerImagensEdicao" class="hidden mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Imagens do Produto</label>
        <div id="listaImagensEdicao" class="flex flex-wrap gap-2"></div>
        <div id="contadorImagens" class="text-xs text-gray-500 mt-1"></div>
        <button type="button" id="btnAdicionarImagem" class="mt-2 text-sm text-blue-600 hover:underline">+ Adicionar mais imagens</button>
      </div>
      <div id="campoLinksImagens" class="hidden mt-4 p-3 bg-gray-100 rounded text-sm">
        <label class="block text-sm font-medium text-gray-700 mb-1">Links das Imagens Salvas</label>
        <div id="listaLinksImagens"></div>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 pt-4">
        <button type="submit" id="btnSubmit" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow transition transform hover:scale-105 flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path id="btnIcon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span id="btnText">Cadastrar Produto</span>
        </button>
        <button type="button" id="btnCancelarEdicao" class="hidden sm:flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar
        </button>
      </div>
    </form>
    <div class="bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Produtos Cadastrados
      </h2>
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="py-2 text-left text-sm font-medium text-gray-700">Produto</th>
            <th class="py-2 text-left text-sm font-medium text-gray-700">Preço</th>
            <th class="py-2 text-left text-sm font-medium text-gray-700">Item do Dia</th>
            <th class="py-2 text-left text-sm font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody id="listaProdutos" class="divide-y divide-gray-100"></tbody>
      </table>
    </div>
  `;

  // ✅ Aplicar máscaras
  const precoInput = document.querySelector("input[name='preco']");
  const precoPromoInput = document.querySelector(
    "input[name='precoPromocional']"
  );
  if (precoInput) aplicarMascara(precoInput);
  if (precoPromoInput) aplicarMascara(precoPromoInput);

  // ✅ Validação em tempo real do preço promocional
  if (precoPromoInput && precoInput) {
    precoPromoInput.addEventListener("input", () => {
      const preco = parseMoeda(precoInput.value);
      const precoPromo = parseMoeda(precoPromoInput.value);
      if (precoPromo && precoPromo >= preco) {
        precoPromoInput.classList.add("border-red-500", "bg-red-50");
        precoPromoInput.title =
          "O preço promocional deve ser menor que o preço normal";
      } else {
        precoPromoInput.classList.remove("border-red-500", "bg-red-50");
        precoPromoInput.title = "";
      }
    });
  }

  // ✅ Configurar eventos
  setupAdicionarImagem();
  setupCancelarEdicao();
  setupFormSubmit();
  atualizarBotaoPrincipal();
  carregarProdutos();

  // ✅ Carregar categorias
  setTimeout(carregarCategoriasSelect, 100);

  // ✅ Se estiver em modo edição, preencher formulário
  if (modo === "edicao" && produtoAtual) {
    setTimeout(() => {
      const idInput = document.getElementById("produtoId");
      if (idInput) idInput.value = produtoAtual._id;

      document.getElementById("tituloForm").textContent = "Editar Produto";
      document.getElementById("btnCancelarEdicao").classList.remove("hidden");

      // Preencher campos com formatação
      document.querySelector("input[name='nome']").value = produtoAtual.nome;
      if (precoInput)
        precoInput.value = formatarMoeda(produtoAtual.preco * 100);
      if (precoPromoInput && produtoAtual.precoPromocional) {
        precoPromoInput.value = formatarMoeda(
          produtoAtual.precoPromocional * 100
        );
      }
      document.querySelector("textarea[name='descricao']").value =
        produtoAtual.descricao || "";
      document.querySelector("input[name='itemDoDia']").checked =
        produtoAtual.itemDoDia;

      // Atualizar imagens
      imagensEmEdicao = [...produtoAtual.imagens];
      novasImagensParaUpload = [];
      atualizarListaImagensEdicao();
      atualizarCampoLinksImagens(imagensEmEdicao);

      // Atualizar botão
      atualizarBotaoPrincipal();
    }, 200);
  }
}

// ✅ Expor globalmente
window.renderProdutos = renderProdutos;
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.removerImagem = removerImagem;
window.removerNovaImagem = removerNovaImagem;
window.limparFormulario = limparFormulario;
