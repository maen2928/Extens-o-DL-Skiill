// background.js — Service Worker da extensão SDR Concessionária
// Ao clicar no ícone da extensão, envia mensagem toggle_sidebar para o content script da aba ativa

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggle_sidebar' });
});
