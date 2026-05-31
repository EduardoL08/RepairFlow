/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — config.js
   Configurações globais e constantes
═══════════════════════════════════════════════════════════════ */

const Config = {
  API_BASE: '/api',

  // Páginas — icon usa o nome do catálogo Icons._svg
  PAGES: [
    { id: 'dashboard',    icon: 'dashboard',  label: 'Dashboard'          },
    { id: 'clientes',     icon: 'users',      label: 'Clientes'            },
    { id: 'equipamentos', icon: 'monitor',    label: 'Equipamentos'        },
    { id: 'tecnicos',     icon: 'wrench',     label: 'Técnicos'            },
    { id: 'ordens',       icon: 'clipboard',  label: 'Ordens de Serviço'   },
  ],

  CATEGORIAS: [
    'Computador', 'Notebook', 'Smartphone', 'Tablet',
    'Impressora', 'TV', 'Console', 'Outro',
  ],

  ESPECIALIDADES: [
    'Eletrônica Geral', 'Smartphones', 'Computadores', 'Notebooks',
    'Impressoras', 'TVs e Monitores', 'Consoles', 'Eletrodomésticos', 'Outro',
  ],

  STATUS_ORDENS: {
    Aberta:         { label: 'Aberta',          badge: 'badge-blue',   cor: '#3b82f6' },
    EmAndamento:    { label: 'Em Andamento',     badge: 'badge-yellow', cor: '#f59e0b' },
    AguardandoPeca: { label: 'Aguardando Peça',  badge: 'badge-orange', cor: '#f97316' },
    Finalizada:     { label: 'Finalizada',       badge: 'badge-green',  cor: '#10d987' },
  },

  PRIORIDADES: {
    Baixa: { label: 'Baixa', badge: 'badge-gray'   },
    Media: { label: 'Média', badge: 'badge-yellow' },
    Alta:  { label: 'Alta',  badge: 'badge-red'    },
  },
};
