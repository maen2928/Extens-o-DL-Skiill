// sidebar.js — Lógica completa do painel lateral SDR Concessionária
// Inicializado pelo content.js após injeção no Shadow DOM

(function () {
  'use strict';

  // ─── Função principal de inicialização ──────────────────────────────────
  window.__sdrInitPanel = function (shadowRoot, container, leadData) {
    // Cria o HTML do painel
    container.innerHTML = buildPanelHTML();

    // Referências internas ao shadowRoot
    const $ = (sel) => shadowRoot.querySelector(sel);
    const $$ = (sel) => shadowRoot.querySelectorAll(sel);

    // Chave de armazenamento baseada na URL atual
    const storageKey = 'sdr_lead_' + window.location.href;

    // Estado global do painel
    let estadoAtual = {
      status: '',
      historico: [],
      checkboxes: {},
      leadForm: {},
      variaveis: {}
    };

    // ─── Carrega dados do storage e preenche o painel ─────────────────────
    chrome.storage.local.get([storageKey, 'sdr_global'], (result) => {
      const salvo = result[storageKey] || {};
      const global = result['sdr_global'] || {};

      estadoAtual = Object.assign({
        status: salvo.status || leadData.status_atual || '',
        historico: salvo.historico || [],
        checkboxes: salvo.checkboxes || {},
        leadForm: salvo.leadForm || {},
        variaveis: salvo.variaveis || {}
      }, {});

      // Preenche campos do formulário de lead
      const formData = Object.assign({}, leadData, salvo.leadForm || {});
      if (global.seu_nome) formData.seu_nome = global.seu_nome;

      preencherFormularioLead(shadowRoot, formData);
      renderizarStatusGrid(shadowRoot, estadoAtual);
      renderizarCadencia(shadowRoot, estadoAtual, storageKey);
      renderizarTemplates(shadowRoot, estadoAtual);
      iniciarTimerSLA(shadowRoot, estadoAtual);
    });

    // ─── Navegação entre abas ─────────────────────────────────────────────
    $$('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.tab-btn').forEach((b) => b.classList.remove('active'));
        $$('.tab-content').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = 'tab-' + btn.dataset.tab;
        const tabEl = shadowRoot.getElementById(tabId);
        if (tabEl) tabEl.classList.add('active');
      });
    });

    // ─── Botão Fechar ─────────────────────────────────────────────────────
    const btnFechar = $('.btn-fechar');
    if (btnFechar) {
      btnFechar.addEventListener('click', () => {
        const host = document.getElementById('sdr-sidebar-host');
        if (host) host.style.display = 'none';
      });
    }

    // ─── Botão Minimizar (toggle collapse) ──────────────────────────────
    const btnMin = $('.btn-minimizar');
    if (btnMin) {
      btnMin.addEventListener('click', () => {
        const panel = shadowRoot.getElementById('sdr-panel');
        if (panel) panel.classList.toggle('minimizado');
      });
    }

    // ─── Salvar formulário de lead ────────────────────────────────────────
    const btnSalvar = $('#btn-salvar-lead');
    if (btnSalvar) {
      btnSalvar.addEventListener('click', () => salvarDadosLead(shadowRoot, storageKey, estadoAtual));
    }

    // ─── Toggle de troca (mostrar/ocultar campos de veículo) ──────────────
    const toggleTroca = shadowRoot.getElementById('tem_troca');
    const camposTroca = shadowRoot.getElementById('campos-troca');
    if (toggleTroca && camposTroca) {
      toggleTroca.addEventListener('change', () => {
        camposTroca.style.display = toggleTroca.checked ? 'block' : 'none';
      });
    }

    // Expõe função para atualizar dados ao reabrir o painel
    window.__sdrUpdateLeadData = (novosDados) => {
      preencherFormularioLead(shadowRoot, novosDados);
    };
  };

  // ─── HTML do Painel ───────────────────────────────────────────────────────
  function buildPanelHTML() {
    return `
<div class="sdr-header">
  <div class="sdr-logo">🚗 SDR Concessionária</div>
  <div class="sdr-header-actions">
    <button class="btn-minimizar" title="Minimizar">−</button>
    <button class="btn-fechar" title="Fechar">×</button>
  </div>
</div>

<div class="sdr-tabs">
  <button class="tab-btn active" data-tab="lead">👤 Lead</button>
  <button class="tab-btn" data-tab="status">🔄 Status</button>
  <button class="tab-btn" data-tab="cadencia">📞 Cadência</button>
  <button class="tab-btn" data-tab="templates">💬 Templates</button>
</div>

<div class="sdr-content">

  <!-- ABA LEAD -->
  <div class="tab-content active" id="tab-lead">
    <div class="form-group">
      <label>Nome do Cliente</label>
      <input type="text" id="f_nome" data-field="nome" placeholder="Nome do cliente">
    </div>
    <div class="form-group">
      <label>Seu Nome (SDR)</label>
      <input type="text" id="f_seu_nome" data-field="seu_nome" placeholder="Seu nome">
    </div>
    <div class="form-group">
      <label>Telefone</label>
      <input type="tel" id="f_telefone" data-field="telefone" placeholder="(11) 99999-9999">
    </div>
    <div class="form-group">
      <label>E-mail</label>
      <input type="email" id="f_email" data-field="email" placeholder="email@exemplo.com">
    </div>
    <div class="form-group">
      <label>Loja</label>
      <select id="f_loja" data-field="loja">
        <option value="">Selecione a loja</option>
        <option value="Toyota">Toyota</option>
        <option value="Fiat">Fiat</option>
        <option value="Volkswagen">Volkswagen</option>
        <option value="Triumph">Triumph</option>
        <option value="Harley-Davidson">Harley-Davidson</option>
        <option value="Seminovos">Seminovos</option>
      </select>
    </div>
    <div class="form-group">
      <label>Modelo / Versão</label>
      <input type="text" id="f_modelo_versao" data-field="modelo_versao" placeholder="Ex: Corolla XEI 2.0">
    </div>
    <div class="form-group">
      <label>Cor Preferida</label>
      <input type="text" id="f_cor_preferida" data-field="cor_preferida" placeholder="Ex: Prata">
    </div>
    <div class="form-group">
      <label>Canal de Origem</label>
      <select id="f_canal_origem" data-field="canal_origem">
        <option value="">Selecione o canal</option>
        <option value="Site da Loja">Site da Loja</option>
        <option value="OLX/Webmotors/iCarros">OLX/Webmotors/iCarros</option>
        <option value="Instagram/Facebook">Instagram/Facebook</option>
        <option value="Google Ads">Google Ads</option>
        <option value="Indicação">Indicação</option>
        <option value="WhatsApp Orgânico">WhatsApp Orgânico</option>
        <option value="Showroom">Showroom</option>
        <option value="OEM">OEM</option>
        <option value="Outros">Outros</option>
      </select>
    </div>
    <div class="form-group">
      <label>Prazo de Compra</label>
      <select id="f_prazo_compra" data-field="prazo_compra">
        <option value="">Selecione o prazo</option>
        <option value="Este mês">Este mês</option>
        <option value="Até 90 dias">Até 90 dias</option>
        <option value="Mais de 90 dias">Mais de 90 dias</option>
      </select>
    </div>
    <div class="form-group">
      <label>
        <input type="checkbox" id="tem_troca"> Possui veículo para troca?
      </label>
    </div>
    <div id="campos-troca" style="display:none">
      <div class="form-group">
        <label>Marca da Troca</label>
        <input type="text" id="f_troca_marca" data-field="troca_marca" placeholder="Ex: Honda">
      </div>
      <div class="form-group">
        <label>Ano da Troca</label>
        <input type="number" id="f_troca_ano" data-field="troca_ano" placeholder="2020" min="1990" max="2099">
      </div>
      <div class="form-group">
        <label>KM da Troca</label>
        <input type="number" id="f_troca_km" data-field="troca_km" placeholder="45000">
      </div>
    </div>
    <div class="form-group">
      <label>Condição Preferida</label>
      <select id="f_condicao_preferida" data-field="condicao_preferida">
        <option value="">Selecione</option>
        <option value="Financiamento">Financiamento</option>
        <option value="Consórcio">Consórcio</option>
        <option value="À Vista">À Vista</option>
      </select>
    </div>
    <div class="form-group">
      <label>Objeção Atual</label>
      <select id="f_objecao_atual" data-field="objecao_atual">
        <option value="">Selecione a objeção</option>
        <option value="Preço/Valor">Preço/Valor</option>
        <option value="Tempo/Momento">Tempo/Momento</option>
        <option value="Crédito/Score">Crédito/Score</option>
        <option value="Estoque/Cor/Versão">Estoque/Cor/Versão</option>
        <option value="Outros">Outros</option>
      </select>
    </div>
    <div class="form-group">
      <label>Argumento Usado</label>
      <textarea id="f_argumento_usado" data-field="argumento_usado" rows="2" placeholder="Descreva o argumento utilizado..."></textarea>
    </div>
    <div class="form-group">
      <label>Próximo Passo</label>
      <input type="text" id="f_proximo_passo" data-field="proximo_passo" placeholder="Ex: Enviar simulação">
    </div>
    <div class="form-group">
      <label>Data/Hora do Próximo Passo</label>
      <input type="datetime-local" id="f_data_hora_proximo_passo" data-field="data_hora_proximo_passo">
    </div>
    <button id="btn-salvar-lead" class="btn-primario btn-full">💾 Salvar Dados</button>
    <div id="feedback-salvar" class="feedback" style="display:none">✅ Dados salvos!</div>
  </div>

  <!-- ABA STATUS -->
  <div class="tab-content" id="tab-status">
    <div id="status-grid" class="status-grid"></div>
    <div id="historico-status" class="historico-bloco">
      <h4>📋 Histórico de Status</h4>
      <ul id="lista-historico"></ul>
    </div>
    <!-- Modal de confirmação de mudança de status -->
    <dialog id="modal-status" class="sdr-modal">
      <div class="modal-content">
        <h3 id="modal-titulo">Mover para STATUS?</h3>
        <p id="modal-descricao"></p>
        <div id="modal-motivo-bloco" style="display:none">
          <label>Motivo da perda *</label>
          <select id="modal-motivo">
            <option value="">Selecione o motivo</option>
          </select>
        </div>
        <div class="modal-actions">
          <button id="modal-confirmar" class="btn-primario">✅ Confirmar</button>
          <button id="modal-cancelar" class="btn-secundario">❌ Cancelar</button>
        </div>
      </div>
    </dialog>
  </div>

  <!-- ABA CADÊNCIA -->
  <div class="tab-content" id="tab-cadencia">
    <div id="cadencia-conteudo"></div>
  </div>

  <!-- ABA TEMPLATES -->
  <div class="tab-content" id="tab-templates">
    <div class="form-group">
      <label>Filtrar por status</label>
      <select id="filtro-template-status">
        <option value="">Todos</option>
        <option value="M0">M0</option>
        <option value="W1">W1</option>
        <option value="W2">W2</option>
        <option value="FR30">FR30</option>
        <option value="NS">NS</option>
        <option value="A1">A1</option>
        <option value="A1C">A1C</option>
        <option value="N1">N1</option>
      </select>
    </div>
    <div id="templates-lista"></div>
  </div>

</div>
`;
  }

  // ─── Preenche o formulário de lead ────────────────────────────────────────
  function preencherFormularioLead(root, dados) {
    const mapa = {
      nome: 'f_nome',
      seu_nome: 'f_seu_nome',
      telefone: 'f_telefone',
      email: 'f_email',
      loja: 'f_loja',
      modelo_versao: 'f_modelo_versao',
      modelo: 'f_modelo_versao',
      cor_preferida: 'f_cor_preferida',
      canal_origem: 'f_canal_origem',
      prazo_compra: 'f_prazo_compra',
      condicao_preferida: 'f_condicao_preferida',
      objecao_atual: 'f_objecao_atual',
      argumento_usado: 'f_argumento_usado',
      proximo_passo: 'f_proximo_passo',
      data_hora_proximo_passo: 'f_data_hora_proximo_passo',
      troca_marca: 'f_troca_marca',
      troca_ano: 'f_troca_ano',
      troca_km: 'f_troca_km'
    };

    Object.entries(mapa).forEach(([campo, id]) => {
      if (dados[campo] !== undefined && dados[campo] !== null) {
        const el = root.getElementById(id);
        if (el && !el.value) el.value = dados[campo];
      }
    });

    // Mostra campos de troca se houver dados
    if (dados.troca_marca || dados.troca_ano || dados.troca_km) {
      const toggle = root.getElementById('tem_troca');
      const campos = root.getElementById('campos-troca');
      if (toggle) toggle.checked = true;
      if (campos) campos.style.display = 'block';
    }
  }

  // ─── Salva dados do formulário no chrome.storage.local ────────────────────
  function salvarDadosLead(root, storageKey, estado) {
    const campos = root.querySelectorAll('[data-field]');
    const formData = {};
    campos.forEach((el) => {
      const campo = el.dataset.field;
      formData[campo] = el.value || '';
    });

    // Salva nome do SDR globalmente
    if (formData.seu_nome) {
      chrome.storage.local.set({ sdr_global: { seu_nome: formData.seu_nome } });
    }

    estado.leadForm = formData;

    chrome.storage.local.get(storageKey, (result) => {
      const existente = result[storageKey] || {};
      const atualizado = Object.assign(existente, { leadForm: formData });
      chrome.storage.local.set({ [storageKey]: atualizado }, () => {
        const fb = root.getElementById('feedback-salvar');
        if (fb) {
          fb.style.display = 'block';
          setTimeout(() => { fb.style.display = 'none'; }, 2500);
        }
      });
    });
  }

  // ─── Renderiza grid de status ─────────────────────────────────────────────
  function renderizarStatusGrid(root, estado) {
    const grid = root.getElementById('status-grid');
    if (!grid) return;

    grid.innerHTML = '';

    STATUSES.forEach((s) => {
      const card = document.createElement('div');
      card.className = 'status-card status-' + s.id;
      card.dataset.statusId = s.id;
      if (estado.status === s.id) card.classList.add('ativo');

      card.innerHTML = `
        <div class="status-card-label">${s.label}</div>
        <div class="status-card-desc">${s.descricao}</div>
      `;
      card.style.borderLeftColor = s.color;

      card.addEventListener('click', () => {
        if (estado.status !== s.id) {
          abrirModalStatus(root, s, estado);
        }
      });

      grid.appendChild(card);
    });

    atualizarHistoricoUI(root, estado);
  }

  // ─── Modal de confirmação de mudança de status ────────────────────────────
  function abrirModalStatus(root, statusAlvo, estado) {
    const modal = root.getElementById('modal-status');
    const titulo = root.getElementById('modal-titulo');
    const descricao = root.getElementById('modal-descricao');
    const motivoBloco = root.getElementById('modal-motivo-bloco');
    const motivoSelect = root.getElementById('modal-motivo');
    const btnConfirmar = root.getElementById('modal-confirmar');
    const btnCancelar = root.getElementById('modal-cancelar');

    if (!modal) return;

    titulo.textContent = `Mover para ${statusAlvo.label}?`;
    descricao.textContent = statusAlvo.descricao;

    // Configura campo de motivo para PERDIDO
    if (statusAlvo.requer_motivo && statusAlvo.motivos) {
      motivoBloco.style.display = 'block';
      motivoSelect.innerHTML = '<option value="">Selecione o motivo</option>';
      statusAlvo.motivos.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        motivoSelect.appendChild(opt);
      });
    } else {
      motivoBloco.style.display = 'none';
    }

    modal.showModal();

    // Remove listeners anteriores clonando os botões
    const novoConfirmar = btnConfirmar.cloneNode(true);
    const novoCancelar = btnCancelar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(novoConfirmar, btnConfirmar);
    btnCancelar.parentNode.replaceChild(novoCancelar, btnCancelar);

    novoConfirmar.addEventListener('click', () => {
      if (statusAlvo.requer_motivo && !motivoSelect.value) {
        motivoSelect.classList.add('erro');
        return;
      }
      const motivo = motivoSelect ? motivoSelect.value : '';
      confirmarMudancaStatus(root, statusAlvo.id, motivo, estado);
      modal.close();
    });

    novoCancelar.addEventListener('click', () => modal.close());
  }

  // ─── Confirma e salva a mudança de status ────────────────────────────────
  function confirmarMudancaStatus(root, novoStatusId, motivo, estado) {
    const registro = {
      de: estado.status,
      para: novoStatusId,
      motivo: motivo || '',
      timestamp: new Date().toLocaleString('pt-BR')
    };

    estado.status = novoStatusId;
    estado.historico = estado.historico || [];
    estado.historico.unshift(registro);

    // Persiste no storage
    const storageKey = 'sdr_lead_' + window.location.href;
    chrome.storage.local.get(storageKey, (result) => {
      const existente = result[storageKey] || {};
      existente.status = novoStatusId;
      existente.historico = estado.historico;
      chrome.storage.local.set({ [storageKey]: existente });
    });

    // Atualiza UI
    renderizarStatusGrid(root, estado);
    renderizarCadencia(root, estado, storageKey);
    iniciarTimerSLA(root, estado);
  }

  // ─── Atualiza a lista de histórico de status ─────────────────────────────
  function atualizarHistoricoUI(root, estado) {
    const lista = root.getElementById('lista-historico');
    if (!lista) return;
    lista.innerHTML = '';

    if (!estado.historico || estado.historico.length === 0) {
      lista.innerHTML = '<li class="historico-vazio">Nenhuma mudança registrada.</li>';
      return;
    }

    estado.historico.forEach((h) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="hist-ts">${h.timestamp}</span>
        <span class="hist-de">${h.de || '—'}</span> →
        <span class="hist-para">${h.para}</span>
        ${h.motivo ? `<span class="hist-motivo">(${h.motivo})</span>` : ''}
      `;
      lista.appendChild(li);
    });
  }

  // ─── Timer SLA regressivo ─────────────────────────────────────────────────
  let timerInterval = null;

  function iniciarTimerSLA(root, estado) {
    const timerEl = root.getElementById('sla-timer');
    if (!timerEl) return;

    if (timerInterval) clearInterval(timerInterval);

    const statusDef = STATUSES.find((s) => s.id === estado.status);

    // Só exibe para M0 (SLA 10 min) e NS (72h)
    if (!statusDef || (!statusDef.sla_min && !statusDef.sla_horas)) {
      timerEl.style.display = 'none';
      return;
    }

    timerEl.style.display = 'block';

    const storageKey = 'sdr_lead_' + window.location.href;
    chrome.storage.local.get(storageKey, (result) => {
      const dados = result[storageKey] || {};
      const agora = Date.now();

      // Guarda o timestamp de início do SLA se não existir
      if (!dados.sla_start || dados.sla_status !== estado.status) {
        dados.sla_start = agora;
        dados.sla_status = estado.status;
        chrome.storage.local.set({ [storageKey]: dados });
      }

      const duracaoMs = statusDef.sla_min
        ? statusDef.sla_min * 60 * 1000
        : statusDef.sla_horas * 3600 * 1000;

      function tick() {
        const restante = duracaoMs - (Date.now() - dados.sla_start);
        if (restante <= 0) {
          timerEl.textContent = statusDef.sla_min
            ? '⏰ SLA EXPIRADO!'
            : '⏰ 72h EXPIRADO!';
          timerEl.classList.add('sla-expirado');
          clearInterval(timerInterval);
          return;
        }
        timerEl.textContent = '⏱ ' + formatarTempo(restante);
        timerEl.classList.remove('sla-expirado');
      }

      tick();
      timerInterval = setInterval(tick, 1000);
    });
  }

  function formatarTempo(ms) {
    const totalSeg = Math.floor(ms / 1000);
    const h = Math.floor(totalSeg / 3600);
    const m = Math.floor((totalSeg % 3600) / 60);
    const s = totalSeg % 60;
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  // ─── Renderiza a aba de Cadência ──────────────────────────────────────────
  function renderizarCadencia(root, estado, storageKey) {
    const container = root.getElementById('cadencia-conteudo');
    if (!container) return;

    container.innerHTML = '';

    // Timer SLA no topo
    const timer = document.createElement('div');
    timer.id = 'sla-timer';
    timer.className = 'sla-timer';
    timer.style.display = 'none';
    container.appendChild(timer);
    iniciarTimerSLA(root, estado);

    const statusId = estado.status;
    let cad = CADENCES[statusId];

    // Resolve referência (W1 → M0, A1C → A1)
    if (cad && cad.ref) cad = CADENCES[cad.ref];

    if (!cad) {
      container.innerHTML += '<p class="sem-cadencia">Nenhuma cadência definida para o status atual.</p>';
      return;
    }

    const titulo = document.createElement('div');
    titulo.className = 'cadencia-titulo';

    if (statusId === 'M0' || statusId === 'W1') {
      titulo.innerHTML = `<strong>⚡ ${cad.label}</strong><br><small>5-6 toques em 3 dias</small>`;
    } else if (statusId === 'NS') {
      titulo.innerHTML = `<strong>🚨 ${cad.label}</strong>`;
    } else if (statusId === 'N1') {
      titulo.innerHTML = `<strong>💼 ${cad.label}</strong><br><small>⚠️ NUNCA sair sem próximo passo marcado!</small>`;
    } else if (statusId === 'W2') {
      titulo.innerHTML = `<strong>🌡️ ${cad.label}</strong><br><small>⚠️ Sempre com NOVIDADE REAL</small>`;
    } else if (statusId === 'FR30') {
      titulo.innerHTML = `<strong>❄️ ${cad.label}</strong>`;
    } else {
      titulo.innerHTML = `<strong>${cad.label}</strong>`;
    }
    container.appendChild(titulo);

    // Carrega checkboxes salvos
    chrome.storage.local.get(storageKey, (result) => {
      const salvo = result[storageKey] || {};
      const checkboxes = salvo.checkboxes || {};

      function salvarCheckboxes(novoEstado) {
        checkboxes[statusId] = novoEstado;
        chrome.storage.local.get(storageKey, (r2) => {
          const d = r2[storageKey] || {};
          d.checkboxes = Object.assign(d.checkboxes || {}, { [statusId]: novoEstado });
          chrome.storage.local.set({ [storageKey]: d });
        });
      }

      const cbEstado = checkboxes[statusId] || {};

      // ── Cadência por dias (M0/W1) ──────────────────────────────────────
      if (cad.tipo === 'intensiva' && cad.dias) {
        let totalToques = 0;
        let totalFeitos = 0;

        cad.dias.forEach((dia) => {
          const diaEl = document.createElement('div');
          diaEl.className = 'cadencia-dia';

          const diaLabel = document.createElement('div');
          diaLabel.className = 'cadencia-dia-label';
          diaLabel.textContent = `📅 DIA ${dia.dia} — ${dia.label.toUpperCase()}`;
          diaEl.appendChild(diaLabel);

          dia.toques.forEach((toque, idx) => {
            totalToques++;
            const chaveCheckbox = `d${dia.dia}_t${idx}`;
            const feito = cbEstado[chaveCheckbox] || false;
            if (feito) totalFeitos++;

            const item = criarItemCadencia(root, toque, chaveCheckbox, feito, cbEstado, salvarCheckboxes);
            diaEl.appendChild(item);
          });

          container.appendChild(diaEl);
        });

        const progresso = document.createElement('div');
        progresso.className = 'cadencia-progresso';
        progresso.textContent = `Progresso: ${totalFeitos} de ${totalToques} toques realizados`;
        container.appendChild(progresso);

      // ── Cadência semanal (W2) ──────────────────────────────────────────
      } else if (cad.tipo === 'semanal' && cad.semanas) {
        cad.semanas.forEach((semana, idx) => {
          const chave = `sem${semana.semana}`;
          const feito = cbEstado[chave] || false;

          const toque = {
            canal: semana.canal,
            label: semana.label,
            template_id: semana.template_id
          };
          const item = criarItemCadencia(root, toque, chave, feito, cbEstado, salvarCheckboxes, `Semana ${semana.semana} — `);
          container.appendChild(item);
        });

      // ── Cadência mensal (FR30) ─────────────────────────────────────────
      } else if (cad.tipo === 'mensal' && cad.toques) {
        cad.toques.forEach((toque, idx) => {
          const chave = `mensal${idx}`;
          const feito = cbEstado[chave] || false;
          const item = criarItemCadencia(root, toque, chave, feito, cbEstado, salvarCheckboxes);
          container.appendChild(item);
        });

      // ── Cadência urgente (NS) ──────────────────────────────────────────
      } else if (cad.tipo === 'urgente' && cad.toques) {
        cad.toques.forEach((toque, idx) => {
          const chave = `ns${idx}`;
          const feito = cbEstado[chave] || false;
          const prefixo = toque.hora ? `${toque.hora} — ` : '';
          const item = criarItemCadencia(root, toque, chave, feito, cbEstado, salvarCheckboxes, prefixo);
          container.appendChild(item);
        });

      // ── Cadência de confirmação (A1/A1C) ───────────────────────────────
      } else if (cad.tipo === 'confirmacao' && cad.toques) {
        cad.toques.forEach((toque, idx) => {
          const chave = `conf${idx}`;
          const feito = cbEstado[chave] || false;
          const prefixo = toque.momento ? `${toque.momento} — ` : '';
          const item = criarItemCadencia(root, toque, chave, feito, cbEstado, salvarCheckboxes, prefixo);
          container.appendChild(item);

          // Checklist adicional (ex: separar veículo)
          if (toque.checklist) {
            toque.checklist.forEach((item2, idx2) => {
              const chave2 = `conf${idx}_cl${idx2}`;
              const feito2 = cbEstado[chave2] || false;
              const checkItem = criarItemChecklist(root, item2, chave2, feito2, cbEstado, salvarCheckboxes);
              container.appendChild(checkItem);
            });
          }
        });

      // ── Cadência de proposta (N1) ──────────────────────────────────────
      } else if (cad.tipo === 'proposta' && cad.toques) {
        cad.toques.forEach((toque, idx) => {
          const chave = `n1_${idx}`;
          const feito = cbEstado[chave] || false;
          const prefixo = toque.momento ? `${toque.momento} — ` : '';
          const item = criarItemCadencia(root, toque, chave, feito, cbEstado, salvarCheckboxes, prefixo);
          container.appendChild(item);
        });
      }
    });
  }

  // ─── Cria item de cadência com checkbox e botão de template ──────────────
  function criarItemCadencia(root, toque, chave, feito, cbEstado, salvarFn, prefixo) {
    prefixo = prefixo || '';
    const item = document.createElement('div');
    item.className = 'cadencia-item' + (feito ? ' feito' : '') + (toque.urgente ? ' urgente' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = feito;
    checkbox.className = 'cadencia-cb';

    checkbox.addEventListener('change', () => {
      cbEstado[chave] = checkbox.checked;
      item.classList.toggle('feito', checkbox.checked);
      salvarFn(cbEstado);
    });

    const textoSpan = document.createElement('span');
    textoSpan.className = 'cadencia-item-texto';
    textoSpan.textContent = `${toque.canal} — ${prefixo}${toque.label}`;
    if (toque.obs) {
      const obs = document.createElement('small');
      obs.className = 'cadencia-obs';
      obs.textContent = ` (${toque.obs})`;
      textoSpan.appendChild(obs);
    }

    item.appendChild(checkbox);
    item.appendChild(textoSpan);

    // Botão de template (se houver)
    if (toque.template_id) {
      const btnTpl = document.createElement('button');
      btnTpl.className = 'btn-template-link';
      btnTpl.title = 'Abrir template';
      btnTpl.textContent = '📋';
      btnTpl.addEventListener('click', () => {
        abrirTemplate(root, toque.template_id);
      });
      item.appendChild(btnTpl);
    }

    return item;
  }

  // ─── Cria item de checklist simples ───────────────────────────────────────
  function criarItemChecklist(root, texto, chave, feito, cbEstado, salvarFn) {
    const item = document.createElement('div');
    item.className = 'cadencia-item checklist-item' + (feito ? ' feito' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = feito;
    checkbox.className = 'cadencia-cb';

    checkbox.addEventListener('change', () => {
      cbEstado[chave] = checkbox.checked;
      item.classList.toggle('feito', checkbox.checked);
      salvarFn(cbEstado);
    });

    const span = document.createElement('span');
    span.textContent = `✅ ${texto}`;

    item.appendChild(checkbox);
    item.appendChild(span);
    return item;
  }

  // ─── Abre a aba de Templates e filtra pelo template específico ────────────
  function abrirTemplate(root, templateId) {
    // Navega para aba de templates
    root.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    root.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    const btnTemplates = root.querySelector('[data-tab="templates"]');
    if (btnTemplates) btnTemplates.classList.add('active');
    const tabTemplates = root.getElementById('tab-templates');
    if (tabTemplates) tabTemplates.classList.add('active');

    // Rola até o template desejado
    setTimeout(() => {
      const card = root.getElementById('tpl-' + templateId);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth' });
        card.classList.add('destaque');
        setTimeout(() => card.classList.remove('destaque'), 2000);
      }
    }, 100);
  }

  // ─── Renderiza a aba de Templates ────────────────────────────────────────
  function renderizarTemplates(root, estado) {
    const lista = root.getElementById('templates-lista');
    const filtro = root.getElementById('filtro-template-status');
    if (!lista) return;

    function renderLista(filtroStatus) {
      lista.innerHTML = '';
      const tpls = filtroStatus
        ? TEMPLATES.filter((t) => t.status === filtroStatus)
        : TEMPLATES;

      tpls.forEach((tpl) => {
        const card = criarCardTemplate(root, tpl, estado);
        lista.appendChild(card);
      });
    }

    renderLista('');

    if (filtro) {
      filtro.addEventListener('change', () => renderLista(filtro.value));
      // Pré-filtra pelo status atual
      if (estado.status && filtro.querySelector(`option[value="${estado.status}"]`)) {
        filtro.value = estado.status;
        renderLista(estado.status);
      }
    }
  }

  // ─── Cria card de template ────────────────────────────────────────────────
  function criarCardTemplate(root, tpl, estado) {
    const statusDef = STATUSES.find((s) => s.id === tpl.status) || {};
    const cor = statusDef.color || '#999';

    const card = document.createElement('div');
    card.className = 'template-card';
    card.id = 'tpl-' + tpl.id;

    // Badge de status + canal
    const badges = document.createElement('div');
    badges.className = 'template-badges';
    badges.innerHTML = `
      <span class="badge-status" style="background:${cor}">${tpl.status}</span>
      <span class="badge-canal">${canais[tpl.canal] || ''} ${tpl.canal}</span>
    `;
    card.appendChild(badges);

    // Título
    const titulo = document.createElement('div');
    titulo.className = 'template-titulo';
    titulo.textContent = tpl.label;
    card.appendChild(titulo);

    // Preview do texto (colapsado)
    const preview = document.createElement('div');
    preview.className = 'template-preview colapsado';
    preview.innerHTML = destacarVariaveis(tpl.mensagem);
    titulo.addEventListener('click', () => {
      preview.classList.toggle('colapsado');
    });
    card.appendChild(preview);

    // Campos de variáveis detectados
    const variaveisDetectadas = extrairVariaveis(tpl.mensagem);
    if (variaveisDetectadas.length > 0) {
      const varBloco = document.createElement('div');
      varBloco.className = 'template-variaveis';

      variaveisDetectadas.forEach((varNome) => {
        const grupo = document.createElement('div');
        grupo.className = 'var-grupo';

        const label = document.createElement('label');
        label.textContent = varNome;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'var-input';
        input.dataset.varNome = varNome;
        input.placeholder = `{{${varNome}}}`;

        // Pré-preenche variáveis com dados do formulário
        const valorPreenchido = obterValorVariavel(root, varNome, estado);
        if (valorPreenchido) input.value = valorPreenchido;

        grupo.appendChild(label);
        grupo.appendChild(input);
        varBloco.appendChild(grupo);
      });

      card.appendChild(varBloco);
    }

    // Botões de ação
    const acoes = document.createElement('div');
    acoes.className = 'template-acoes';

    const btnCopiar = document.createElement('button');
    btnCopiar.className = 'btn-copiar';
    btnCopiar.textContent = '📋 Copiar mensagem';
    btnCopiar.addEventListener('click', () => {
      const texto = montarMensagem(card, tpl.mensagem);
      navigator.clipboard.writeText(texto).then(() => {
        btnCopiar.textContent = '✅ Copiado!';
        setTimeout(() => { btnCopiar.textContent = '📋 Copiar mensagem'; }, 2000);
      });
    });

    const btnInserir = document.createElement('button');
    btnInserir.className = 'btn-inserir';
    btnInserir.textContent = '💾 Inserir como comentário';
    btnInserir.addEventListener('click', () => {
      const texto = montarMensagem(card, tpl.mensagem);
      const ok = window.__sdrInjectComment(texto);
      if (ok) {
        btnInserir.textContent = '✅ Inserido!';
        setTimeout(() => { btnInserir.textContent = '💾 Inserir como comentário'; }, 2000);
      } else {
        btnInserir.textContent = '⚠️ Campo não encontrado';
        setTimeout(() => { btnInserir.textContent = '💾 Inserir como comentário'; }, 3000);
      }
    });

    acoes.appendChild(btnCopiar);
    acoes.appendChild(btnInserir);
    card.appendChild(acoes);

    return card;
  }

  // ─── Utilitários de template ──────────────────────────────────────────────
  const canais = {
    'WhatsApp': '💬',
    'SMS': '📱',
    'Áudio WhatsApp': '🎙️'
  };

  function extrairVariaveis(mensagem) {
    const matches = mensagem.match(/\{\{([^}]+)\}\}/g) || [];
    const unicas = [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
    return unicas;
  }

  function destacarVariaveis(mensagem) {
    return mensagem
      .replace(/\n/g, '<br>')
      .replace(/\{\{([^}]+)\}\}/g, '<span class="var-destaque">{{$1}}</span>');
  }

  function montarMensagem(card, mensagemTemplate) {
    let texto = mensagemTemplate;
    card.querySelectorAll('.var-input').forEach((input) => {
      const varNome = input.dataset.varNome;
      const valor = input.value || `{{${varNome}}}`;
      texto = texto.replace(new RegExp(`\\{\\{${varNome}\\}\\}`, 'g'), valor);
    });
    return texto;
  }

  function obterValorVariavel(root, varNome, estado) {
    // Mapa de variável → campo do formulário
    const mapa = {
      nome: 'f_nome',
      seu_nome: 'f_seu_nome',
      loja: 'f_loja',
      modelo: 'f_modelo_versao',
      versao: 'f_modelo_versao',
      cor: 'f_cor_preferida'
    };
    const fieldId = mapa[varNome];
    if (!fieldId) return '';
    const el = root.getElementById(fieldId);
    return el ? el.value : '';
  }
})();
