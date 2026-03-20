// backend/admin/components/configuracoes.js

(function () {
  let configAtual = {};
  let novaImagemFundo = null;

  // ==================== Carregar config ====================
  async function carregarConfig() {
    try {
      const res = await fetch(`${API_URL}/api/config`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      configAtual = await res.json();
      preencherFormulario();
    } catch (err) {
      mostrarMensagem(
        "Falha ao carregar configurações: " + err.message,
        "error",
      );
    }
  }

  // ==================== Preencher formulário ====================
  function preencherFormulario() {
    const h = configAtual.header || {};
    const f = configAtual.footer || {};
    const d = configAtual.display || {};
    const hor = f.horarios || {};

    setVal("cfgTitulo", h.titulo);
    setVal("cfgTituloDestaque", h.tituloDestaque);
    setVal("cfgSlogan", h.slogan);
    setVal("cfgEndereco", f.endereco);
    setVal("cfgCidade", f.cidade);
    setVal("cfgTelefone1", f.telefone1);
    setVal("cfgTelefone2", f.telefone2);
    setVal("cfgWhatsapp", f.whatsapp);
    setVal("cfgInstagram", f.instagram);
    setVal("cfgHoraSemana", hor.semana);
    setVal("cfgHoraSabado", hor.sabado);
    setVal("cfgHoraDomingo", hor.domingo);
    setVal("cfgCopyright", f.copyright);
    setVal("cfgMaxProdutos", d.maxProdutosPorSecao);

    const chk = document.getElementById("cfgRandomizar");
    if (chk) chk.checked = !!d.randomizarProdutos;

    renderPreviewBg();
  }

  function setVal(id, valor) {
    const el = document.getElementById(id);
    if (el && valor !== undefined && valor !== null) el.value = valor;
  }

  // ==================== Preview imagem de fundo ====================
  function renderPreviewBg() {
    const container = document.getElementById("previewBgHero");
    if (!container) return;

    const imgUrl = novaImagemFundo
      ? URL.createObjectURL(novaImagemFundo)
      : configAtual.header?.imagemFundo;

    if (imgUrl) {
      container.innerHTML = `
        <div class="relative inline-block">
          <img src="${imgUrl}" class="h-20 rounded border object-cover" />
          <button type="button" id="btnRemoverBg"
            class="absolute -top-1 -right-1 bg-red-500 hover:bg-red-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow">✕</button>
          ${novaImagemFundo ? '<span class="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center rounded-b">NOVA</span>' : ""}
        </div>`;
      container.querySelector("#btnRemoverBg").addEventListener("click", () => {
        novaImagemFundo = null;
        configAtual.header = configAtual.header || {};
        configAtual.header.imagemFundo = "";
        const input = document.getElementById("uploadBgHero");
        if (input) input.value = "";
        renderPreviewBg();
      });
    } else {
      container.innerHTML = `<p class="text-xs text-gray-400">Nenhuma imagem de fundo (usa gradiente padrão)</p>`;
    }
  }

  // ==================== Submit ====================
  async function salvarConfig(e) {
    e.preventDefault();

    try {
      let imagemFundoUrl = configAtual.header?.imagemFundo || "";

      // Upload de nova imagem de fundo
      if (novaImagemFundo) {
        const fd = new FormData();
        fd.append("imagem", novaImagemFundo);
        const upRes = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: fd,
        });
        if (!upRes.ok)
          throw new Error((await upRes.json()).error || "Falha no upload");
        const result = await upRes.json();
        imagemFundoUrl = result.url;
      }

      const payload = {
        header: {
          titulo: getVal("cfgTitulo"),
          tituloDestaque: getVal("cfgTituloDestaque"),
          slogan: getVal("cfgSlogan"),
          imagemFundo: imagemFundoUrl,
        },
        footer: {
          endereco: getVal("cfgEndereco"),
          cidade: getVal("cfgCidade"),
          telefone1: getVal("cfgTelefone1"),
          telefone2: getVal("cfgTelefone2"),
          whatsapp: getVal("cfgWhatsapp"),
          instagram: getVal("cfgInstagram"),
          copyright: getVal("cfgCopyright"),
          horarios: {
            semana: getVal("cfgHoraSemana"),
            sabado: getVal("cfgHoraSabado"),
            domingo: getVal("cfgHoraDomingo"),
          },
        },
        display: {
          maxProdutosPorSecao: parseInt(getVal("cfgMaxProdutos")) || 12,
          randomizarProdutos:
            document.getElementById("cfgRandomizar")?.checked || false,
        },
      };

      const res = await fetch(`${API_URL}/api/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok)
        throw new Error((await res.json()).erro || "Falha ao salvar");

      configAtual = await res.json();
      novaImagemFundo = null;
      mostrarMensagem("Configurações salvas com sucesso!", "success");
      renderPreviewBg();
    } catch (err) {
      mostrarMensagem("Erro: " + err.message, "error");
    }
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  // ==================== Render principal ====================
  window.renderConfiguracoes = function () {
    const content = document.getElementById("adminContent");
    if (!content) return;

    content.innerHTML = `
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
          <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configurações do Site
        </h2>

        <form id="formConfig">
          <!-- HEADER / HERO -->
          <fieldset class="border border-gray-200 rounded-lg p-5 mb-6">
            <legend class="text-sm font-semibold text-gray-600 px-2">🏍️ Cabeçalho (Hero)</legend>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Título principal</label>
                <input id="cfgTitulo" placeholder="Moto"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                <p class="text-xs text-gray-400 mt-1">Parte antes do destaque (ex: "Moto")</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Título destaque</label>
                <input id="cfgTituloDestaque" placeholder="Speed"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                <p class="text-xs text-gray-400 mt-1">Parte em destaque (cor primária, ex: "Speed")</p>
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
              <input id="cfgSlogan" placeholder="As melhores peças com os melhores preços."
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Imagem de fundo</label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" id="uploadBgHero"
                class="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
              <div id="previewBgHero" class="mt-3">
                <p class="text-xs text-gray-400">Nenhuma imagem de fundo</p>
              </div>
            </div>
          </fieldset>

          <!-- FOOTER -->
          <fieldset class="border border-gray-200 rounded-lg p-5 mb-6">
            <legend class="text-sm font-semibold text-gray-600 px-2">📋 Rodapé</legend>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input id="cfgEndereco" placeholder="Rua das Motos, 123 - Centro"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cidade / Estado</label>
                <input id="cfgCidade" placeholder="São Paulo - SP"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefone 1</label>
                <input id="cfgTelefone1" placeholder="(11) 96774-5351"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefone 2</label>
                <input id="cfgTelefone2" placeholder="(11) 3333-4444"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp (código país + DDD + número)</label>
                <input id="cfgWhatsapp" placeholder="5511967745351"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Instagram (URL completa)</label>
                <input id="cfgInstagram" placeholder="https://instagram.com/motopecas"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Horário Semana</label>
                <input id="cfgHoraSemana" placeholder="Seg-Sex: 8h às 18h"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Horário Sábado</label>
                <input id="cfgHoraSabado" placeholder="Sábado: 9h às 13h"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Horário Domingo</label>
                <input id="cfgHoraDomingo" placeholder="Domingo: Fechado"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Texto de copyright</label>
              <input id="cfgCopyright" placeholder="MotoSpeed Peças"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </fieldset>

          <!-- EXIBIÇÃO -->
          <fieldset class="border border-gray-200 rounded-lg p-5 mb-6">
            <legend class="text-sm font-semibold text-gray-600 px-2">🎯 Exibição</legend>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Máx. produtos por seção</label>
                <input type="number" id="cfgMaxProdutos" value="12" min="1" max="100"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div class="flex items-center gap-3 pt-6">
                <input type="checkbox" id="cfgRandomizar" class="w-5 h-5 text-blue-600 rounded" />
                <label for="cfgRandomizar" class="text-sm font-medium text-gray-700">
                  Randomizar ordem dos produtos por sessão
                </label>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">Quando ativo, cada visitante vê os produtos em ordem diferente. A ordem se mantém durante a sessão.</p>
          </fieldset>

          <div class="flex justify-end pt-2">
            <button type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg shadow transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    `;

    // Setup upload e submit
    const uploadInput = document.getElementById("uploadBgHero");
    if (uploadInput) {
      uploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          mostrarMensagem("Arquivo excede 5MB", "error");
          uploadInput.value = "";
          return;
        }
        novaImagemFundo = file;
        renderPreviewBg();
      });
    }

    const form = document.getElementById("formConfig");
    if (form) form.addEventListener("submit", salvarConfig);

    carregarConfig();
  };
})();
