// data/statuses.js — Definição dos status do pipeline SDR Concessionária

const STATUSES = [
  {
    id: 'M0',
    label: '🆕 M0 – Novo',
    color: '#FF6B6B',
    sla_min: 10,
    descricao: 'Lead entrou. Contatar em até 10 minutos!',
    transicoes: [
      { gatilho: 'Primeiro contato realizado', proximo: 'Q1' }
    ]
  },
  {
    id: 'Q1',
    label: '🔍 Q1 – Qualificação',
    color: '#FFD93D',
    descricao: 'Coleta de dados em andamento.',
    transicoes: [
      { gatilho: 'Data/hora de visita agendada', proximo: 'A1' },
      { gatilho: 'Sem retorno D0–D3', proximo: 'W1' },
      { gatilho: 'Sem retorno D4+', proximo: 'W2' }
    ]
  },
  {
    id: 'A1',
    label: '📅 A1 – Agendado',
    color: '#6BCB77',
    descricao: 'Visita/test drive com data marcada.',
    transicoes: [
      { gatilho: 'Confirmação recebida', proximo: 'A1C' },
      { gatilho: 'Lead não compareceu', proximo: 'NS' },
      { gatilho: 'Visita realizada → proposta', proximo: 'N1' }
    ]
  },
  {
    id: 'A1C',
    label: '✅ A1C – Confirmado',
    color: '#4CAF50',
    descricao: 'Lead confirmou presença.',
    transicoes: [
      { gatilho: 'Lead não compareceu', proximo: 'NS' },
      { gatilho: 'Proposta apresentada', proximo: 'N1' }
    ]
  },
  {
    id: 'NS',
    label: '🚫 NS – No-Show',
    color: '#FF9800',
    sla_horas: 72,
    descricao: 'Não veio. Reagendar em até 72h!',
    transicoes: [
      { gatilho: 'Novo agendamento feito', proximo: 'A1' },
      { gatilho: 'Sem resposta após 72h', proximo: 'FR30' }
    ]
  },
  {
    id: 'W1',
    label: '🔥 W1 – Sem Retorno D0–D3',
    color: '#FF7043',
    descricao: 'Cadência intensiva — 5-6 toques em 3 dias.',
    transicoes: [
      { gatilho: 'Lead respondeu', proximo: 'Q1' },
      { gatilho: 'Lead agendou', proximo: 'A1' },
      { gatilho: 'Dia 4 sem resposta', proximo: 'W2' }
    ]
  },
  {
    id: 'W2',
    label: '🌡️ W2 – Sem Retorno D4–D30',
    color: '#B0BEC5',
    descricao: '1 toque/semana com novidade real.',
    transicoes: [
      { gatilho: 'Lead reativou interesse', proximo: 'Q1' },
      { gatilho: 'Dia 31+ sem resposta', proximo: 'FR30' }
    ]
  },
  {
    id: 'N1',
    label: '💼 N1 – Negociação',
    color: '#2196F3',
    descricao: 'Proposta enviada. Nunca sair sem próximo passo!',
    transicoes: [
      { gatilho: 'Pedido assinado / contrato fechado', proximo: 'GANHO' },
      { gatilho: 'Recusa definitiva com motivo', proximo: 'PERDIDO' },
      { gatilho: 'Lead esfriou', proximo: 'W2' }
    ]
  },
  {
    id: 'FR30',
    label: '❄️ FR30 – Frio 30+',
    color: '#90A4AE',
    descricao: '1 toque/mês com campanha.',
    transicoes: [
      { gatilho: 'Reativou interesse', proximo: 'Q1' }
    ]
  },
  {
    id: 'R1',
    label: '♻️ R1 – Reciclagem',
    color: '#CE93D8',
    descricao: 'Pool para campanhas sazonais.',
    transicoes: [
      { gatilho: 'Respondeu à campanha', proximo: 'Q1' }
    ]
  },
  {
    id: 'GANHO',
    label: '🏆 GANHO',
    color: '#00C853',
    descricao: 'Venda concretizada! Parabéns!',
    transicoes: []
  },
  {
    id: 'PERDIDO',
    label: '❌ PERDIDO',
    color: '#D32F2F',
    descricao: 'Mínimo 5-6 toques + 3 pings semanais antes de fechar.',
    requer_motivo: true,
    motivos: ['Preço', 'Crédito', 'Tempo', 'Estoque', 'Concorrente', 'Desistiu', 'Outros'],
    transicoes: []
  }
];
