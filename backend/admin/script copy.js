// backend/admin/script.js

// Estado do formulário
let modo = "cadastro"; // 'cadastro' ou 'edicao'
let produtoAtual = null;
let imagensEmEdicao = []; // Imagens já salvas
let novasImagensParaUpload = []; // Novos arquivos selecionados (ainda não enviados)

// Extensões permitidas
const extensoesPermitidas = [".jpg", ".jpeg", ".png", ".webp"];

// Função auxiliar para mensagens
function mostrarMensagem(texto, cor = "blue") {
  const mensagem = document.getElementById("mensagem");
  if (!mensagem) return;

  mensagem.className = `p-4 rounded bg-${cor}-100 text-${cor}-800 font-medium mb-6`;
  mensagem.textContent = texto;
  document.body.prepend(mensagem);

  setTimeout(() => {
    if (mensagem.parentElement) mensagem.remove();
  }, 5000);
}

// Verifica extensão do arquivo
function validarExtensao(nomeArquivo) {
  const ext = nomeArquivo.toLowerCase().substring(nomeArquivo.lastIndexOf("."));
  return extensoesPermitidas.includes(ext);
}

// Carregar e listar produtos
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
          <button onclick="editarProduto('${produto._id}')" 
                  class="text-blue-600 hover:text-blue-800 font-medium text-sm">Editar</button>
          <button onclick="excluirProduto('${produto._id}', '${produto.nome}')" 
                  class="text-red-600 hover:text-red-800 font-medium text-sm">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    mostrarMensagem(`❌ Falha ao carregar produtos: ${err.message}`, "red");
  }
}

// Excluir produto
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

// Editar produto
async function editarProduto(id) {
  try {
    const res = await fetch(`http://localhost:5000/api/produtos/${id}`);
    if (!res.ok) throw new Error("Produto não encontrado");
    produtoAtual = await res.json();

    modo = "edicao";
    document.getElementById("produtoId").value = produtoAtual._id;
    document.getElementById("tituloForm").textContent = "Editar Produto";
    document.getElementById("btnCancelarEdicao").classList.remove("hidden");
    atualizarBotaoPrincipal();

    // Preencher campos
    document.querySelector("input[name='nome']").value = produtoAtual.nome;
    document.querySelector("input[name='preco']").value = produtoAtual.preco;
    document.querySelector("input[name='precoPromocional']").value =
      produtoAtual.precoPromocional || "";
    document.querySelector("textarea[name='descricao']").value =
      produtoAtual.descricao || "";
    document.querySelector("input[name='itemDoDia']").checked =
      produtoAtual.itemDoDia;

    // Inicializar imagens
    imagensEmEdicao = [...produtoAtual.imagens];
    novasImagensParaUpload = [];
    atualizarListaImagensEdicao();
    atualizarCampoLinksImagens(imagensEmEdicao);
  } catch (err) {
    mostrarMensagem(`❌ Erro ao carregar produto: ${err.message}`, "red");
  }
}

// Cancelar edição
document.getElementById("btnCancelarEdicao").addEventListener("click", () => {
  limparFormulario();
});

// Carregar tudo após o DOM estar pronto
document.addEventListener("DOMContentLoaded", () => {
  // Validação em tempo real do preço promocional
  const precoPromoInput = document.getElementById("precoPromocional");
  const precoNormalInput = document.querySelector("input[name='preco']");

  if (precoPromoInput && precoNormalInput) {
    precoPromoInput.addEventListener("input", () => {
      const precoNormal = parseFloat(precoNormalInput.value);
      const precoPromo = parseFloat(precoPromoInput.value);

      if (precoPromo && precoPromo >= precoNormal) {
        precoPromoInput.classList.remove(
          "border-gray-300",
          "focus:ring-blue-500",
          "focus:border-blue-500"
        );
        precoPromoInput.classList.add("border-red-500", "bg-red-50");
        precoPromoInput.title =
          "Erro: o preço promocional deve ser menor que o preço normal";
      } else {
        precoPromoInput.classList.remove("border-red-500", "bg-red-50");
        precoPromoInput.classList.add("border-gray-300");
        precoPromoInput.title =
          "O preço promocional deve ser menor que o preço normal";
      }
    });
  }

  // Preview de múltiplas imagens
  const uploadImagensInput = document.getElementById("uploadImagens");
  if (uploadImagensInput) {
    uploadImagensInput.addEventListener("change", (e) => {
      const preview = document.getElementById("previewImagens");
      if (!preview) return;
      const files = Array.from(e.target.files);

      files.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          mostrarMensagem(`❌ ${file.name} é muito grande (máx. 5MB)`, "red");
          return;
        }
        if (!validarExtensao(file.name)) {
          mostrarMensagem(
            `❌ ${
              file.name
            } tem formato inválido. Use: ${extensoesPermitidas.join(", ")}`,
            "red"
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const container = document.createElement("div");
          container.className =
            "relative border-2 border-dashed border-blue-400";
          container.innerHTML = `
            <img src="${e.target.result}" class="h-16 w-16 object-cover rounded" title="${file.name}" />
            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs font-bold rounded">NOVA</div>
          `;
          preview.appendChild(container);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  // Adicionar mais imagens durante a edição
  const btnAdicionarImagem = document.getElementById("btnAdicionarImagem");
  if (btnAdicionarImagem) {
    btnAdicionarImagem.addEventListener("click", () => {
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
          if (!validarExtensao(file.name)) {
            mostrarMensagem(
              `❌ ${
                file.name
              } tem formato inválido. Use: ${extensoesPermitidas.join(", ")}`,
              "red"
            );
            return false;
          }
          return true;
        });

        if (files.length > 0) {
          novasImagensParaUpload.push(...files);
          atualizarListaImagensEdicao();
          mostrarMensagem(
            `✅ ${files.length} imagem(ns) adicionada(s) para upload`,
            "blue"
          );
        }
      };
      input.click();
    });
  }

  // Iniciar carregamento de produtos
  carregarProdutos();
});

// Enviar formulário
document.getElementById("formProduto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const data = {
    nome: form.nome.value.trim(),
    descricao: form.descricao.value.trim(),
    preco: parseFloat(form.preco.value),
    precoPromocional: form.precoPromocional.value
      ? parseFloat(form.precoPromocional.value)
      : undefined,
    imagens: [...imagensEmEdicao], // Começa com as imagens existentes
    itemDoDia: form.itemDoDia.checked,
  };

  // Validação básica
  if (!data.nome || !data.preco || isNaN(data.preco)) {
    mostrarMensagem("❌ Preencha nome e preço corretamente.", "red");
    return;
  }

  // Validação de preço promocional
  if (data.precoPromocional && data.precoPromocional >= data.preco) {
    mostrarMensagem(
      "❌ O preço promocional deve ser menor que o preço normal",
      "red"
    );
    return;
  }

  // Upload de novas imagens
  if (novasImagensParaUpload.length > 0) {
    const formData = new FormData();
    novasImagensParaUpload.forEach((file) => formData.append("imagens", file));

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

  // Salvar no localStorage
  localStorage.setItem("ultimoRascunho", JSON.stringify(data));

  // Enviar dados
  const id = document.getElementById("produtoId").value;
  const method = modo === "edicao" ? "PUT" : "POST";
  const url = `http://localhost:5000/api/produtos${id ? "/" + id : ""}`;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const acao = modo === "edicao" ? "atualizado" : "cadastrado";
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
});

// Atualizar lista de imagens na edição
function atualizarListaImagensEdicao() {
  const container = document.getElementById("listaImagensEdicao");
  if (!container) return;
  container.innerHTML = "";

  // Imagens existentes
  imagensEmEdicao.forEach((url, index) => {
    const div = document.createElement("div");
    div.className = "relative";
    div.draggable = true;
    div.dataset.index = index;
    div.innerHTML = `
      <img src="${url}" class="h-16 w-16 object-cover rounded border" />
      <button type="button" onclick="removerImagem(${index})" 
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-600">✕</button>
    `;
    container.appendChild(div);
  });

  // Novas imagens (com ícone "NOVA")
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
      `;
      container.appendChild(div);
    };
    reader.readAsDataURL(file);
  });

  ativarDragAndDrop();
  const containerEdicao = document.getElementById("containerImagensEdicao");
  if (containerEdicao) containerEdicao.classList.remove("hidden");
}

// Remover imagem existente
function removerImagem(index) {
  imagensEmEdicao.splice(index, 1);
  atualizarListaImagensEdicao();
  atualizarCampoLinksImagens(imagensEmEdicao);
}

// Remover nova imagem (antes do upload)
function removerNovaImagem(index) {
  novasImagensParaUpload.splice(index, 1);
  atualizarListaImagensEdicao();
}

// Ativar drag-and-drop
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

// Helper para drag-and-drop
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

// Atualizar campo de links
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

// Atualizar botão principal conforme modo
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

// Limpar formulário
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

  // ✅ Limpar o campo de links das imagens
  const campoLinksImagens = document.getElementById("campoLinksImagens");
  const listaLinksImagens = document.getElementById("listaLinksImagens");
  if (campoLinksImagens) campoLinksImagens.classList.add("hidden");
  if (listaLinksImagens) listaLinksImagens.innerHTML = "";

  // Resetar estado
  modo = "cadastro";
  produtoAtual = null;
  imagensEmEdicao = [];
  novasImagensParaUpload = [];

  atualizarBotaoPrincipal();
}
