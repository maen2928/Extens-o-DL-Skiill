// planetfone_content.js — Content script injetado na página do Planetfone
// Gerencia discagem (click-to-call) e auto-atendimento de ligações entrantes

(function () {
  'use strict';

  // ─── Seletores (tenta múltiplos para robustez) ────────────────────────────

  const INPUT_SELECTORS = [
    'input[placeholder*="número"]',
    'input[placeholder*="numero"]',
    'input[placeholder*="discar"]',
    'input[placeholder*="Insira"]',
    '#numero_discar',
    '.phone-input',
    'input[type="tel"]',
    'input[type="text"][name*="phone"]',
    'input[type="text"][name*="numero"]',
    'input[type="text"][name*="number"]'
  ];

  const DIAL_BUTTON_SELECTORS = [
    'button.discar',
    '.btn-discar',
    'input[value="Discar"]',
    'input[value="discar"]',
    'button[title*="Discar"]',
    'button[title*="discar"]'
  ];

  const ANSWER_BUTTON_SELECTORS = [
    'button.atender',
    '.btn-atender',
    'button[title*="Atender"]',
    'button[title*="atender"]',
    'button[title*="Answer"]',
    'button[title*="answer"]',
    '.btn-answer',
    'button.answer'
  ];

  // Texto que pode indicar botão de atender/discar quando não há seletor exato
  const ANSWER_TEXT_PATTERNS = ['atender', 'answer', 'aceitar', 'accept'];
  const DIAL_TEXT_PATTERNS = ['discar', 'dial', 'ligar', 'call'];

  // ─── Utilitários ─────────────────────────────────────────────────────────

  function findBySelectors(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (_) { /* seletor inválido */ }
    }
    return null;
  }

  function findButtonByText(patterns) {
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], a[role="button"]');
    for (const btn of buttons) {
      const text = (btn.textContent || btn.value || btn.title || '').toLowerCase().trim();
      if (patterns.some(p => text.includes(p))) {
        return btn;
      }
    }
    return null;
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  function showToast(message, color) {
    const existing = document.getElementById('sdr-planetfone-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'sdr-planetfone-toast';
    toast.textContent = message;
    toast.style.cssText = [
      'position:fixed',
      'top:16px',
      'right:16px',
      'z-index:2147483647',
      'padding:10px 16px',
      'border-radius:8px',
      'font-family:system-ui,sans-serif',
      'font-size:14px',
      'font-weight:bold',
      'color:#fff',
      `background:${color || '#2563eb'}`,
      'box-shadow:0 2px 8px rgba(0,0,0,0.3)',
      'transition:opacity 0.4s'
    ].join(';');

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // ─── Discagem (dial_number) ───────────────────────────────────────────────

  function dialNumber(numero) {
    console.log('[SDR-CALL] Planetfone: discando', numero);

    const input = findBySelectors(INPUT_SELECTORS);
    if (!input) {
      console.warn('[SDR-CALL] Campo de discagem não encontrado.');
      showToast('❌ Campo de discagem não encontrado!', '#dc2626');
      return;
    }

    // Limpa e preenche o campo usando o setter nativo (compatível com React/Vue/Angular)
    input.focus();
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    nativeSetter.call(input, numero);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

    console.log('[SDR-CALL] Número inserido:', numero);

    const DIAL_BUTTON_DELAY_MS = 200; // wait for framework state update before clicking dial
    setTimeout(() => {
      const dialBtn = findBySelectors(DIAL_BUTTON_SELECTORS) || findButtonByText(DIAL_TEXT_PATTERNS);
      if (dialBtn) {
        dialBtn.click();
        console.log('[SDR-CALL] Botão Discar clicado.');
        showToast(`📞 Discando ${numero}`, '#16a34a');
      } else {
        console.warn('[SDR-CALL] Botão Discar não encontrado.');
        showToast(`⚠️ Número inserido (${numero}), clique em Discar.`, '#d97706');
      }
    }, DIAL_BUTTON_DELAY_MS);
  }

  // ─── Auto-Atender (check_incoming_call) ──────────────────────────────────

  function tryAnswerCall() {
    const answerBtn =
      findBySelectors(ANSWER_BUTTON_SELECTORS) ||
      findButtonByText(ANSWER_TEXT_PATTERNS);

    if (answerBtn && isVisible(answerBtn)) {
      console.log('[SDR-CALL] Botão Atender encontrado — clicando automaticamente.');
      answerBtn.click();
      showToast('📲 Ligação atendida automaticamente', '#16a34a');
      return true;
    }
    return false;
  }

  // ─── MutationObserver para auto-atender contínuo ─────────────────────────

  const observer = new MutationObserver(() => {
    chrome.storage.local.get('autoAtender', (result) => {
      if (!result.autoAtender) return;
      tryAnswerCall();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // ─── Listener de mensagens do background ────────────────────────────────

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'dial_number') {
      dialNumber(msg.numero);
      sendResponse({ ok: true });
      return true;
    }

    if (msg.action === 'check_incoming_call') {
      chrome.storage.local.get('autoAtender', (result) => {
        if (!result.autoAtender) {
          sendResponse({ found: false });
          return;
        }
        const found = tryAnswerCall();
        sendResponse({ found });
      });
      return true; // async response
    }
  });

  console.log('[SDR-CALL] planetfone_content.js carregado.');
})();
