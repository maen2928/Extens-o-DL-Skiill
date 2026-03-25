// data/templates.js — Templates de mensagem por status e canal SDR Concessionária

const TEMPLATES = [
  {
    id: 'msg_m0_whatsapp',
    status: 'M0',
    canal: 'WhatsApp',
    label: 'M0 — Primeiro Contato WhatsApp',
    variaveis: ['nome', 'seu_nome', 'loja', 'modelo', 'versao', 'cor', 'data_bonus', 'hora1', 'hora2'],
    mensagem: `Olá, {{nome}} 👋\nSou {{seu_nome}} da {{loja}}.\nVi que você demonstrou interesse no *{{modelo}}*.\nTenho a versão *{{versao}}* na cor *{{cor}}* em estoque\ne um *bônus especial na troca* válido até {{data_bonus}}. 🚗\n\nPosso reservar um horário sem compromisso para você conhecer e dirigir.\nFica melhor {{hora1}} ou {{hora2}}?`
  },
  {
    id: 'sms_m0_dia0',
    status: 'M0',
    canal: 'SMS',
    label: 'M0 — SMS Primeiro Contato',
    variaveis: ['nome', 'seu_nome', 'loja', 'modelo'],
    mensagem: `{{nome}}, sou {{seu_nome}} da {{loja}}. Vi seu interesse no {{modelo}}. Tenho estoque e bônus especial. Responde para agendarmos!`
  },
  {
    id: 'audio_m0_roteiro',
    status: 'M0',
    canal: 'Áudio WhatsApp',
    label: 'M0 — Roteiro Áudio WhatsApp',
    variaveis: ['nome', 'seu_nome', 'loja', 'modelo', 'hora1', 'hora2'],
    mensagem: `"Olá, {{nome}}! Tudo bem? Sou {{seu_nome}}, da {{loja}}.\nTe mandei uma mensagem há pouco sobre o {{modelo}}.\nTenho uma condição especial no estoque — quero te apresentar em menos de 10 minutinhos.\nMe fala, {{hora1}} ou {{hora2}} fica bom pra você?\nEspero seu retorno. Abraços!"`
  },
  {
    id: 'sms_w1_dia1',
    status: 'W1',
    canal: 'SMS',
    label: 'W1 Dia 1 — SMS "1 ou 2"',
    variaveis: ['nome', 'seu_nome', 'loja', 'modelo'],
    mensagem: `{{nome}}, tudo bem? {{seu_nome}} da {{loja}}.\nSobre o {{modelo}}: responda *1* se quer que eu ligue\nou *2* se não tem interesse. Simples assim! 😊`
  },
  {
    id: 'msg_w1_dia2_beneficio',
    status: 'W1',
    canal: 'WhatsApp',
    label: 'W1 Dia 2 — Benefício Real',
    variaveis: ['nome', 'seu_nome', 'loja', 'modelo', 'cor', 'beneficio_real', 'data_limite', 'duracao'],
    mensagem: `{{nome}}, boa tarde! {{seu_nome}} da {{loja}} novamente.\n\nO *{{modelo}} {{cor}}* que te mencionei tem *{{beneficio_real}}* válido até {{data_limite}}. 🗓️\n\nConsigo separar para um test drive rápido.\nQuando você tem {{duracao}} minutinhos esta semana?`
  },
  {
    id: 'sms_w1_dia3_ultima',
    status: 'W1',
    canal: 'SMS',
    label: 'W1 Dia 3 — SMS Última Tentativa',
    variaveis: ['nome', 'modelo', 'seu_nome', 'loja'],
    mensagem: `{{nome}}, última tentativa por agora sobre o {{modelo}}.\nResponda *1* (sim, me chame) ou *2* (não tenho interesse)\ne eu paro. Prometo! 🙏 — {{seu_nome}}, {{loja}}`
  },
  {
    id: 'msg_w2_semanal',
    status: 'W2',
    canal: 'WhatsApp',
    label: 'W2 — Toque Semanal com Novidade',
    variaveis: ['nome', 'seu_nome', 'loja', 'novidade_real', 'modelo'],
    mensagem: `Olá, {{nome}}! {{seu_nome}} da {{loja}}.\n\nApareceu uma novidade que pode te interessar:\n*{{novidade_real}}* disponível agora no {{modelo}}.\n\nAinda está considerando? Posso te passar os detalhes em 5 minutinhos. 📲`
  },
  {
    id: 'msg_fr30_mensal',
    status: 'FR30',
    canal: 'WhatsApp',
    label: 'FR30 — Toque Mensal com Campanha',
    variaveis: ['nome', 'seu_nome', 'loja', 'campanha_mes', 'modelo'],
    mensagem: `Olá, {{nome}}! Tudo bem? {{seu_nome}} da {{loja}}.\n\nSei que faz um tempo, mas não esqueci de você! 😊\nTemos *{{campanha_mes}}* em andamento este mês no {{modelo}} com condições especiais.\n\nVale uma conversa rápida? Quando você tem um minutinho?`
  },
  {
    id: 'msg_ns_reagendar',
    status: 'NS',
    canal: 'WhatsApp',
    label: 'NS — Reagendamento Pós No-Show',
    variaveis: ['nome', 'seu_nome', 'loja', 'modelo', 'hora1', 'hora2'],
    mensagem: `{{nome}}, tudo bem? {{seu_nome}} da {{loja}}.\n\nDeixei o *{{modelo}}* separado para você mas não conseguiu vir.\nSem problemas — sei que o dia a dia complica! 😊\n\nPosso ajustar para *{{hora1}} hoje* ou *{{hora2}} amanhã*?\nJá incluo a *avaliação gratuita do seu usado* na hora. 🚗🔑`
  },
  {
    id: 'msg_a1_confirmacao_dia',
    status: 'A1',
    canal: 'WhatsApp',
    label: 'A1 — Confirmação 1 Dia Antes',
    variaveis: ['nome', 'seu_nome', 'loja', 'hora_agendamento', 'modelo', 'cor', 'beneficio_vigente'],
    mensagem: `Olá, {{nome}}! {{seu_nome}} da {{loja}}.\n\nConfirmando seu horário *amanhã às {{hora_agendamento}}* para conhecer o *{{modelo}} {{cor}}*. 🚗\n\nJá deixei o carro separado! Vou ter também o *{{beneficio_vigente}}* disponível para você.\n\nConfirma sua presença? ✅`
  },
  {
    id: 'msg_a1c_lembrete_1h',
    status: 'A1C',
    canal: 'WhatsApp',
    label: 'A1C — Lembrete 1 Hora Antes',
    variaveis: ['nome', 'periodo', 'loja', 'modelo', 'cor', 'endereco_curto', 'seu_nome'],
    mensagem: `{{nome}}, boa {{periodo}}! Daqui a pouco é seu horário aqui na {{loja}}. 🕐\n\nO *{{modelo}} {{cor}}* já está na pista te esperando!\nQualquer dúvida para chegar: {{endereco_curto}}.\n\nTe esperamos! 🤝 — {{seu_nome}}`
  },
  {
    id: 'msg_n1_followup',
    status: 'N1',
    canal: 'WhatsApp',
    label: 'N1 — Follow-up de Proposta',
    variaveis: ['nome', 'seu_nome', 'loja', 'modelo', 'valor_entrada', 'valor_parcela'],
    mensagem: `{{nome}}, tudo bem? {{seu_nome}} da {{loja}}.\n\nEnviei a simulação do *{{modelo}}* com entrada de *{{valor_entrada}}* e parcelas de *{{valor_parcela}}*. 💰\n\nQuer ajustar o valor de entrada ou o prazo?\nSe aprovarmos o crédito, separo o carro hoje com o *bônus de troca* vigente.\n\nO que você achou da proposta?`
  }
];
