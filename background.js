// background.js — Service Worker da extensão SDR Concessionária
// Ao clicar no ícone da extensão, envia mensagem toggle_sidebar para o content script da aba ativa

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggle_sidebar' });
});

// ─── Constantes ───────────────────────────────────────────────────────────────

const AUTO_ATENDER_POLL_INTERVAL_MINUTES = 0.05; // ~3 seconds (0.05 * 60 = 3)
const ALARM_NAME = 'auto_atender_tick';
const NOTIFICATION_ICON_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findPlanetfoneTab(callback) {
  chrome.tabs.query({ url: 'http://10.56.24.27/*' }, (tabs) => {
    callback(tabs && tabs.length > 0 ? tabs[0] : null);
  });
}

// ─── Click-to-Call Broker ─────────────────────────────────────────────────────
// Recebe click_to_call do content.js do Dulleads, encaminha dial_number ao Planetfone

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'click_to_call') {
    console.log('[SDR-CALL] Broker recebeu click_to_call:', msg.numero);
    findPlanetfoneTab((tab) => {
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'dial_number', numero: msg.numero });
        console.log('[SDR-CALL] dial_number enviado para aba Planetfone', tab.id);
      } else {
        console.warn('[SDR-CALL] Aba do Planetfone não encontrada. Abrindo aviso.');
        chrome.notifications.create({
          type: 'basic',
          iconUrl: NOTIFICATION_ICON_DATA_URI,
          title: 'SDR — Click-to-Call',
          message: 'Abra a aba do Planetfone (10.56.24.27) antes de ligar.'
        });
      }
    });
    return true;
  }
});

// ─── Auto-Atender — Alarm Polling ─────────────────────────────────────────────

// Garante que o alarm existe ao iniciar o service worker
chrome.alarms.get(ALARM_NAME, (existing) => {
  if (!existing) {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: AUTO_ATENDER_POLL_INTERVAL_MINUTES });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  chrome.storage.local.get('autoAtender', (result) => {
    if (!result.autoAtender) return;

    findPlanetfoneTab((tab) => {
      if (!tab) return;
      chrome.tabs.sendMessage(tab.id, { action: 'check_incoming_call' }, (response) => {
        if (chrome.runtime.lastError) return; // aba ainda carregando
        if (response && response.found) {
          console.log('[SDR-CALL] Chamada entrante detectada — auto-atender acionado.');
        }
      });
    });
  });
});
