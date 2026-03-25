// content.js — Script injetado no Dulleads CRM
// Gerencia o painel lateral SDR via Shadow DOM
// Os arquivos data/*.js e sidebar.js são carregados antes pelo manifest.json

(function () {
  'use strict';

  let sidebarOpen = false;
  let shadowHost = null;
  let shadowRoot = null;

  // ─── Extração de dados do lead da página ───────────────────────────────────
  function extractLeadData() {
    const get = (selectors) => {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return (el.innerText || el.value || el.textContent || '').trim();
      }
      return '';
    };

    return {
      nome: get(['.lead-name', '[data-field="name"]', 'h1.contact-name', '.deal-title', 'h1']),
      telefone: get(['.phone-number', '[data-field="phone"]', 'a[href^="tel:"]', '.tel-field']),
      email: get(['.email-field', '[data-field="email"]', 'a[href^="mailto:"]']),
      modelo: get(['.product-name', '[data-field="produto"]', '.deal-product', '.vehicle-name', '.model-name']),
      status_atual: get(['.pipeline-stage.active', '.stage-name', '.status-badge', '.kanban-column--active .column-title'])
    };
  }

  // ─── Injeção de comentário no campo de nota do Dulleads ──────────────────
  function injectComment(texto) {
    const selectors = [
      'textarea[name*="comment"]',
      '.comment-input textarea',
      '[data-field="note"] textarea',
      '.notes-input textarea',
      'textarea[placeholder*="comentário"]',
      'textarea[placeholder*="observação"]',
      'textarea[placeholder*="nota"]',
      'textarea'
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        el.focus();
        // Dispara o setter nativo para compatibilidade com React/Vue
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(el, texto);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  // Expõe globalmente para que o sidebar.js possa chamar
  window.__sdrInjectComment = injectComment;

  // ─── Inicialização do painel via Shadow DOM ──────────────────────────────
  function initSidebar() {
    shadowHost = document.createElement('div');
    shadowHost.id = 'sdr-sidebar-host';
    shadowHost.style.cssText = [
      'position:fixed',
      'top:0',
      'right:0',
      'width:370px',
      'height:100vh',
      'z-index:2147483647',
      'font-family:system-ui,sans-serif',
      'pointer-events:none'
    ].join(';');
    document.body.appendChild(shadowHost);

    shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    // Injeta o CSS do painel no Shadow DOM (isolado do CSS da página)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('sidebar.css');
    shadowRoot.appendChild(link);

    // Contêiner raiz do painel
    const container = document.createElement('div');
    container.id = 'sdr-panel';
    container.style.pointerEvents = 'all';
    shadowRoot.appendChild(container);

    // sidebar.js já foi carregado como content script — chama diretamente
    if (typeof window.__sdrInitPanel === 'function') {
      window.__sdrInitPanel(shadowRoot, container, extractLeadData());
    }
  }

  // ─── Abrir / Fechar painel ───────────────────────────────────────────────
  function toggleSidebar() {
    if (sidebarOpen) {
      if (shadowHost) shadowHost.style.display = 'none';
      sidebarOpen = false;
    } else {
      if (!shadowHost) {
        initSidebar();
      } else {
        shadowHost.style.display = '';
      }
      sidebarOpen = true;
      // Atualiza os dados do lead ao reabrir
      if (typeof window.__sdrUpdateLeadData === 'function') {
        window.__sdrUpdateLeadData(extractLeadData());
      }
    }
  }

  // ─── Listener de mensagens do background ────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'toggle_sidebar') toggleSidebar();
  });
})();
