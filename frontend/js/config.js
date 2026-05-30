/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — config.js
   Configurações globais e constantes
═══════════════════════════════════════════════════════════════ */

const Config = {
  // URL base da API — o nginx dentro do container faz proxy de /api → backend:5000/api
  API_BASE: '/api',

  // Páginas disponíveis
  PAGES: [
    { id: 'dashboard',    icon: '⊞',  label: 'Dashboard'         },
    { id: 'clientes',     icon: '👥', label: 'Clientes'           },
    { id: 'equipamentos', icon: '🖥', label: 'Equipamentos'       },
    { id: 'tecnicos',     icon: '🔧', label: 'Técnicos'           },
    { id: 'ordens',       icon: '📋', label: 'Ordens de Serviço'  },
  ],

  // Categorias de equipamento
  CATEGORIAS: [
    'Computador', 'Notebook', 'Smartphone', 'Tablet',
    'Impressora', 'TV', 'Console', 'Outro',
  ],

  // Especialidades de técnico
  ESPECIALIDADES: [
    'Eletrônica Geral', 'Smartphones', 'Computadores', 'Notebooks',
    'Impressoras', 'TVs e Monitores', 'Consoles', 'Eletrodomésticos', 'Outro',
  ],

  // Status das ordens
  STATUS_ORDENS: {
    Aberta:          { label: 'Aberta',          badge: 'badge-blue',   cor: '#3b82f6' },
    EmAndamento:     { label: 'Em Andamento',     badge: 'badge-yellow', cor: '#eab308' },
    AguardandoPeca:  { label: 'Aguardando Peça',  badge: 'badge-orange', cor: '#f97316' },
    Finalizada:      { label: 'Finalizada',       badge: 'badge-green',  cor: '#22c55e' },
  },

  // Prioridades
  PRIORIDADES: {
    Baixa: { label: 'Baixa', badge: 'badge-gray'   },
    Media: { label: 'Média', badge: 'badge-yellow' },
    Alta:  { label: 'Alta',  badge: 'badge-red'    },
  },
};
