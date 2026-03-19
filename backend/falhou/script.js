// backend/admin/script.js

// Estado do formulário: 'cadastro' ou 'edicao'
let modo = "cadastro";

// Armazena o produto atual durante a edição
let produtoAtual = null;

// Armazena as imagens existentes durante a edição
let imagensEmEdicao = [];

// Armazena novos arquivos selecionados para upload (não enviados ainda)
let novasImagensParaUpload = [];

// Função para mostrar mensagens de feedback ao usuário
function mostrarMensagem(texto, cor = "blue") {
  const mensagem = document.getElementById("mensagem");
  if (!mensagem) return;

  // Define estilo com base na cor
  mensagem.className = `p-4 rounded bg-${cor}-100 text-${cor}-800 font-medium mb-6`;
  mensagem.textContent = texto;
  document.body.prepend(mensagem);

  // Remove a mensagem após 5 segundos
  setTimeout(() => {
    if (mensagem.parentElement) mensagem.remove();
  }, 5000);
}

// Carrega e exibe todos os produtos na tabela
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

// Exclui um produto com confirmação
async function excluirProduto(id, nome) {
  if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;

  try {
    const res = await fetch(`http://localhost:5000/api/produtos/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      mostrarMensagem(`✅ "${nome}" excluído com sucesso!`, "green");
      carregarProdutos(); // Atualiza a lista
    } else {
      const result = await res.json();
      mostrarMensagem(`❌ Erro: ${result.error || "Algo deu errado"}`, "red");
    }
  } catch (err) {
    mostrarMensagem(`❌ Erro de conexão: ${err.message}`, "red");
  }
}

// Carrega um produto para edição
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

    // Preenche os campos com os dados do produto
    document.querySelector("input[name='nome']").value = produtoAtual.nome;
    document.querySelector("input[name='preco']").value = produtoAtual.preco;
    document.querySelector("input[name='precoPromocional']").value =
      produtoAtual.precoPromocional || "";
    document.querySelector("textarea[name='descricao']").value =
      produtoAtual.descricao || "";
    document.querySelector("input[name='itemDoDia']").checked =
      produtoAtual.itemDoDia;

    // Inicializa as imagens
    imagensEmEdicao = [...produtoAtual.imagens];
    novasImagensParaUpload = [];
    atualizarListaImagensEdicao();
    atualizarCampoLinksImagens(imagensEmEdicao);
  } catch (err) {
    mostrarMensagem(`❌ Erro ao carregar produto: ${err.message}`, "red");
  }
}

// Cancela a edição e volta ao modo de cadastro
document.getElementById("btnCancelarEdicao").addEventListener("click", () => {
  limparFormulario();
});

// Atualiza a lista de imagens durante a edição
function atualizarListaImagensEdicao() {
  const container = document.getElementById("listaImagensEdicao");
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
    `;
    container.appendChild(div);
  });

  ativarDragAndDrop();
  document.getElementById("containerImagensEdicao").classList.remove("hidden");
}

// Remove uma imagem da lista de edição
function removerImagem(index) {
  imagensEmEdicao.splice(index, 1);
  atualizarListaImagensEdicao();
  atualizarCampoLinksImagens(imagensEmEdicao);
}

// Habilita reordenação por arrastar e soltar
function ativarDragAndDrop() {
  const container = document.getElementById("listaImagensEdicao");
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

// Função auxiliar para drag-and-drop
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

// Adiciona mais imagens durante a edição
document.getElementById("btnAdicionarImagem").addEventListener("click", () => {
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
      return true;
    });

    if (files.length > 0) {
      novasImagensParaUpload.push(...files);
      mostrarMensagem(
        `✅ ${files.length} imagem(ns) adicionada(s) para upload`,
        "blue"
      );
    }
  };
  input.click();
});

// Envia o formulário (cadastrar ou editar)
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
    imagens: [...imagensEmEdicao], // Começa com imagens existentes
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

  // Salva no localStorage como rascunho
  localStorage.setItem("ultimoRascunho", JSON.stringify(data));

  // Envia os dados ao backend
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

// Atualiza os links das imagens no formulário
function atualizarCampoLinksImagens(urls) {
  const campo = document.getElementById("campoLinksImagens");
  const lista = document.getElementById("listaLinksImagens");
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
    campo.classList.remove("hidden");
  } else {
    campo.classList.add("hidden");
  }
}

// Atualiza o botão principal conforme o modo
function atualizarBotaoPrincipal() {
  const btnIcon = document.getElementById("btnIcon");
  const btnText = document.getElementById("btnText");
  const btnSubmit = document.getElementById("btnSubmit");

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

// Limpa o formulário e volta ao modo de cadastro
function limparFormulario() {
  document.getElementById("formProduto").reset();
  document.getElementById("produtoId").value = "";
  document.getElementById("containerImagensEdicao").classList.add("hidden");
  document.getElementById("btnCancelarEdicao").classList.add("hidden");

  modo = "cadastro";
  produtoAtual = null;
  imagensEmEdicao = [];
  novasImagensParaUpload = [];

  atualizarBotaoPrincipal();
}

// Carrega os produtos ao iniciar
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();
});
