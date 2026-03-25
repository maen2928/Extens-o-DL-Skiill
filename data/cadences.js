// data/cadences.js — Mapa de cadência por status SDR Concessionária

const CADENCES = {
  M0: {
    tipo: 'intensiva',
    label: 'Cadência Intensiva D0–D3',
    sla_min: 10,
    dias: [
      {
        dia: 0,
        label: 'Hoje',
        toques: [
          { canal: '📞 Voz', tipo: 'ligacao', label: 'Ligar agora (SLA 10 min)', template_id: null, urgente: true },
          { canal: '💬 WhatsApp', tipo: 'texto', label: 'Mensagem de texto', template_id: 'msg_m0_whatsapp' },
          { canal: '📱 SMS', tipo: 'sms', label: 'SMS curto', template_id: 'sms_m0_dia0' },
          { canal: '🎙️ WhatsApp', tipo: 'audio', label: 'Áudio +4h', template_id: 'audio_m0_roteiro', obs: 'Enviar 4-6h após primeiro toque' }
        ]
      },
      {
        dia: 1,
        label: 'Amanhã',
        toques: [
          { canal: '📞 Voz', tipo: 'ligacao', label: 'Ligar cedo (08h–09h)', template_id: null },
          { canal: '📱 SMS', tipo: 'sms', label: 'SMS "1 ou 2"', template_id: 'sms_w1_dia1' }
        ]
      },
      {
        dia: 2,
        label: 'Dia 2',
        toques: [
          { canal: '📞 Voz', tipo: 'ligacao', label: 'Ligar tarde (16h–17h30)', template_id: null },
          { canal: '💬 WhatsApp', tipo: 'texto', label: 'Novidade/Benefício', template_id: 'msg_w1_dia2_beneficio' }
        ]
      },
      {
        dia: 3,
        label: 'Dia 3',
        toques: [
          { canal: '📞 Voz', tipo: 'ligacao', label: 'Último toque', template_id: null },
          { canal: '📱 SMS', tipo: 'sms', label: 'Encerramento cadência', template_id: 'sms_w1_dia3_ultima' }
        ]
      }
    ]
  },

  // W1 usa a mesma cadência intensiva de M0
  W1: { tipo: 'intensiva', label: 'Cadência Intensiva D0–D3', ref: 'M0' },

  W2: {
    tipo: 'semanal',
    label: 'Cadência Semanal D4–D30',
    semanas: [
      { semana: 1, canal: '💬 WhatsApp', label: 'Toque semanal com novidade real', template_id: 'msg_w2_semanal' },
      { semana: 2, canal: '💬 WhatsApp ou 📞 Voz', label: 'Toque semanal', template_id: 'msg_w2_semanal' },
      { semana: 3, canal: '💬 WhatsApp', label: 'Toque semanal com novidade', template_id: 'msg_w2_semanal' },
      { semana: 4, canal: '📞 Voz ou 📧 E-mail', label: 'Último toque do ciclo', template_id: 'msg_w2_semanal' }
    ]
  },

  FR30: {
    tipo: 'mensal',
    label: 'Cadência Mensal 30+',
    toques: [
      { canal: '💬 WhatsApp ou 📧 E-mail', label: 'Toque mensal com campanha', template_id: 'msg_fr30_mensal' }
    ]
  },

  NS: {
    tipo: 'urgente',
    label: 'Reagendamento No-Show (72h)',
    sla_horas: 72,
    toques: [
      { hora: '0–2h', canal: '📞 Voz', label: 'Ligar imediatamente', template_id: null },
      { hora: '2–4h', canal: '💬 WhatsApp', label: 'Oferecer 2 horários', template_id: 'msg_ns_reagendar' },
      { hora: '24h', canal: '📱 SMS ou 📞 Voz', label: 'Último contato sem resposta', template_id: 'sms_w1_dia3_ultima' }
    ]
  },

  A1: {
    tipo: 'confirmacao',
    label: 'Confirmação de Agendamento',
    toques: [
      {
        momento: '1 dia antes',
        canal: '💬 WhatsApp',
        label: 'Confirmar presença',
        template_id: 'msg_a1_confirmacao_dia',
        checklist: ['Separar veículo de interesse', 'Verificar benefício vigente']
      },
      {
        momento: '1h antes',
        canal: '💬 WhatsApp',
        label: 'Lembrete final',
        template_id: 'msg_a1c_lembrete_1h'
      }
    ]
  },

  // A1C usa a mesma cadência de confirmação de A1
  A1C: { tipo: 'confirmacao', label: 'Confirmado — Lembrete 1h', ref: 'A1' },

  N1: {
    tipo: 'proposta',
    label: 'Acompanhamento de Proposta',
    regra_ouro: true,
    toques: [
      { momento: 'Imediato', canal: '📞 Voz', label: 'Apresentar proposta', template_id: null },
      { momento: '24h', canal: '💬 WhatsApp', label: 'Follow-up proposta', template_id: 'msg_n1_followup' },
      { momento: '48h', canal: '📞 Voz ou 📧 E-mail', label: 'Último follow-up', template_id: 'msg_n1_followup' }
    ]
  }
};
