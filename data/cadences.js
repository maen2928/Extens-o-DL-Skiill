// ────────────────────────────────────────────────────────────────
// data/cadences.js — Cadências de Contato por Status
// Define quais toques fazer em cada status e em qual momento
// ────────────────────────────────────────────────────────────────
const CADENCES = {
  M0: {
    tipo: 'intensiva',
    titulo: '🔥 Cadência Intensiva — 5 a 6 toques em 3 dias',
    descricao: 'SLA de 10 minutos para primeiro contato!',
    dias: [
      {
        dia: 0,
        label: '📅 Dia 0 — HOJE (urgente)',
        toques: [
          { id: 'd0_voz', canal: '📞', label: 'Voz — ligar AGORA (SLA: 10 min)', template_id: null, urgente: true, horario: 'Imediato' },
          { id: 'd0_wpp', canal: '💬', label: 'WhatsApp — texto de boas-vindas', template_id: 'msg_m0_whatsapp', horario: 'Imediato' },
          { id: 'd0_sms', canal: '📱', label: 'SMS — primeiro contato', template_id: 'sms_m0', horario: 'Imediato' },
          { id: 'd0_audio', canal: '🎙️', label: 'WhatsApp áudio curto (+4–6h)', template_id: 'audio_m0', horario: '4–6h após entrada' }
        ]
      },
      {
        dia: 1,
        label: '📅 Dia 1 — AMANHÃ',
        toques: [
          { id: 'd1_voz', canal: '📞', label: 'Voz — manhã cedo (08h–09h)', template_id: null, horario: '08h–09h' },
          { id: 'd1_sms', canal: '📱', label: 'SMS interativo "1 ou 2"', template_id: 'sms_w1_d1', horario: '09h–10h' }
        ]
      },
      {
        dia: 2,
        label: '📅 Dia 2',
        toques: [
          { id: 'd2_voz', canal: '📞', label: 'Voz — final da tarde (16h–17h30)', template_id: null, horario: '16h–17h30' },
          { id: 'd2_wpp', canal: '💬', label: 'WhatsApp — novidade/benefício real', template_id: 'msg_w1_d2', horario: '17h–18h' }
        ]
      },
      {
        dia: 3,
        label: '📅 Dia 3 — ÚLTIMO TOQUE INTENSIVO',
        toques: [
          { id: 'd3_voz', canal: '📞', label: 'Voz — último toque (10h ou 15h)', template_id: null, horario: '10h–11h ou 15h–16h' },
          { id: 'd3_sms', canal: '📱', label: 'SMS encerramento cadência', template_id: 'sms_w1_d3', horario: 'Após ligação' }
        ]
      }
    ]
  },

  W1: {
    tipo: 'intensiva',
    titulo: '🔥 W1 — Continuação Cadência Intensiva (D0–D3)',
    descricao: 'Mesmo fluxo de M0. Lead ainda não respondeu.',
    referencia: 'M0' // herda cadência de M0
  },

  W2: {
    tipo: 'semanal',
    titulo: '🌡️ W2 — Cadência Semanal (D4–D30)',
    descricao: '1 toque por semana. SEMPRE com novidade real (taxa, cor, bônus, campanha).',
    semanas: [
      {
        semana: 1,
        label: 'Semana 1 (D4–D10)',
        toques: [
          { id: 'w2_s1', canal: '💬', label: 'WhatsApp — novidade da semana', template_id: 'msg_w2_semanal', obs: 'Mencionar novidade real específica' }
        ]
      },
      {
        semana: 2,
        label: 'Semana 2 (D11–D17)',
        toques: [
          { id: 'w2_s2', canal: '📞', label: 'Voz ou WhatsApp — semana 2', template_id: 'msg_w2_semanal', obs: 'Tentar canal diferente da semana 1' }
        ]
      },
      {
        semana: 3,
        label: 'Semana 3 (D18–D24)',
        toques: [
          { id: 'w2_s3', canal: '💬', label: 'WhatsApp — novidade semana 3', template_id: 'msg_w2_semanal', obs: 'Nova taxa ou chegada de estoque' }
        ]
      },
      {
        semana: 4,
        label: 'Semana 4 (D25–D30) — último semanal',
        toques: [
          { id: 'w2_s4', canal: '📞', label: 'Voz + E-mail — última tentativa semanal', template_id: 'msg_w2_semanal', obs: 'Após D30 sem resposta → mover para FR30' }
        ]
      }
    ]
  },

  FR30: {
    tipo: 'mensal',
    titulo: '❄️ FR30 — Cadência Mensal (30+ dias)',
    descricao: '1 toque por mês. Sempre atrelar a campanha real do período.',
    toques: [
      { id: 'fr30_m1', canal: '💬', label: 'WhatsApp/E-mail — campanha do mês', template_id: 'msg_fr30_mensal', obs: 'Taxa especial | Lançamento | Feirão | Bônus troca' }
    ]
  },

  NS: {
    tipo: 'urgencia_72h',
    titulo: '🚫 NS — Reagendamento em até 72h',
    descricao: 'Lead não compareceu. Oferecer 2 opções de horário. Urgente!',
    sla_horas: 72,
    toques: [
      { id: 'ns_voz', canal: '📞', label: '0–2h após no-show — Ligar agora', template_id: null, urgente: true, horario: 'Imediato (até 2h)' },
      { id: 'ns_wpp', canal: '💬', label: '2–4h — WhatsApp reagendamento (2 horários)', template_id: 'msg_ns_reagendar', horario: '2–4h após no-show' },
      { id: 'ns_sms', canal: '📱', label: '24h sem resposta — SMS final', template_id: 'sms_w1_d3', horario: '24h após no-show' }
    ]
  },

  A1: {
    tipo: 'confirmacao',
    titulo: '📅 A1 — Confirmação do Agendamento',
    descricao: 'Garantir comparecimento. Separar veículo e verificar benefício.',
    toques: [
      { id: 'a1_confirma', canal: '💬', label: '1 dia antes — confirmar via WhatsApp/Voz', template_id: 'msg_a1_confirmacao', horario: '24h antes' },
      { id: 'a1_veiculo', canal: '🚗', label: 'Separar o veículo de interesse', template_id: null, horario: 'Antes do agendamento', acao_interna: true },
      { id: 'a1_beneficio', canal: '💡', label: 'Verificar e anotar benefício vigente', template_id: null, horario: 'Antes do agendamento', acao_interna: true }
    ]
  },

  A1C: {
    tipo: 'confirmacao',
    titulo: '✅ A1C — Lembrete 1 Hora Antes',
    descricao: 'Lead confirmado. Enviar lembrete 1h antes. Carro na pista.',
    toques: [
      { id: 'a1c_lembrete', canal: '💬', label: '1h antes — WhatsApp lembrete final', template_id: 'msg_a1c_1h', horario: '1h antes' },
      { id: 'a1c_pista', canal: '🚗', label: 'Confirmar que carro está na pista', template_id: null, horario: '1h antes', acao_interna: true }
    ]
  },

  N1: {
    tipo: 'proposta',
    titulo: '💼 N1 — Acompanhamento de Proposta',
    descricao: 'NUNCA sair de N1 sem próximo passo marcado (data + hora).',
    regra_ouro: true,
    toques: [
      { id: 'n1_imediato', canal: '📞', label: 'Imediato após envio — Ligar para apresentar', template_id: null, horario: 'Logo após envio' },
      { id: 'n1_wpp_24h', canal: '💬', label: '24h sem resposta — WhatsApp follow-up', template_id: 'msg_n1_followup', horario: '24h após proposta' },
      { id: 'n1_voz_48h', canal: '📞', label: '48h sem resposta — Voz ou E-mail', template_id: null, horario: '48h após proposta' },
      { id: 'n1_passo', canal: '📌', label: '⚠️ REGISTRAR próximo passo + data/hora', template_id: null, urgente: true, acao_interna: true }
    ]
  },

  R1: {
    tipo: 'reciclagem',
    titulo: '♻️ R1 — Base de Reciclagem',
    descricao: 'Aguardar campanha sazonal, lançamento ou feirão relevante.',
    toques: [
      { id: 'r1_campanha', canal: '💬', label: 'Ativar na próxima campanha relevante', template_id: 'msg_fr30_mensal', obs: 'Lançamento | Troca de ano | Feirão | Black Friday' }
    ]
  }
};

// Exportar para uso no sidebar.js
if (typeof window !== 'undefined') {
  window.__sdrCadences = CADENCES;
}