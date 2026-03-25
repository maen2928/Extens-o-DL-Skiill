# 🚗 SDR Concessionária — Extensão Chrome para Dulleads

Painel lateral inteligente para SDRs de concessionária com:
- Leitura automática de dados do lead
- Gestão de status com 1 clique
- Mapa de cadência diária
- Templates de mensagem com variáveis preenchidas

## ⚡ Como Instalar

1. Baixe ou clone este repositório
2. Abra o Chrome e acesse: `chrome://extensions`
3. Ative o **Modo do desenvolvedor** (canto superior direito)
4. Clique em **"Carregar sem compactação"**
5. Selecione a pasta `Extens-o-DL-Skiill`
6. O ícone 🚗 aparecerá na barra do Chrome

## 🖥️ Como Usar

1. Acesse qualquer página do Dulleads (`app.duleads.com.br`)
2. Clique no ícone 🚗 na barra do Chrome
3. O painel lateral abre à direita

### Abas do Painel

| Aba | Função |
|-----|--------|
| 👤 **Lead** | Dados do cliente — preenchimento automático + manual |
| 🔄 **Status** | Mover o lead entre etapas com 1 clique |
| 📞 **Cadência** | Mapa do dia — quais toques fazer agora |
| 💬 **Templates** | Mensagens prontas — copiar ou inserir no CRM |

### Estrutura de Arquivos

```
manifest.json       — Manifest V3 da extensão
background.js       — Service worker (toggle do painel)
content.js          — Injetado no Dulleads (Shadow DOM + leitura do DOM)
sidebar.js          — Lógica completa do painel (4 abas)
sidebar.css         — Estilos injetados no Shadow DOM
data/
  statuses.js       — Definição dos status e transições
  templates.js      — Templates de mensagem com variáveis
  cadences.js       — Mapa de cadência por status
README.md
```

## ⚠️ Observações

- Dados são salvos **localmente** no Chrome (sem servidor)
- A leitura automática depende dos seletores da tela atual do Dulleads
- Sem API oficial do Dulleads — dados são lidos visualmente da página
- Compatível com **Chrome 110+**
- **Zero dependências externas** — vanilla JS puro, sem npm, sem frameworks

## 🔧 Como Adaptar para Outro CRM

Edite os seletores em `content.js` na função `extractLeadData()`
e os seletores de comentário na função `injectComment()`.

## 📋 Status do Pipeline

| ID | Label | Descrição |
|----|-------|-----------|
| M0 | 🆕 Novo | Lead entrou — contatar em até 10 minutos |
| Q1 | 🔍 Qualificação | Coleta de dados em andamento |
| A1 | 📅 Agendado | Visita/test drive com data marcada |
| A1C | ✅ Confirmado | Lead confirmou presença |
| NS | 🚫 No-Show | Não compareceu — reagendar em 72h |
| W1 | 🔥 Sem Retorno D0-D3 | Cadência intensiva (5-6 toques) |
| W2 | 🌡️ Sem Retorno D4-D30 | 1 toque/semana com novidade |
| N1 | 💼 Negociação | Proposta enviada |
| FR30 | ❄️ Frio 30+ | 1 toque/mês com campanha |
| R1 | ♻️ Reciclagem | Pool para campanhas sazonais |
| GANHO | 🏆 Ganho | Venda concretizada! |
| PERDIDO | ❌ Perdido | Recusa definitiva com motivo |