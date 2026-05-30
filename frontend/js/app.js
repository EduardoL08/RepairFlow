/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — app.js
   App principal: inicialização, sidebar, roteamento por hash
═══════════════════════════════════════════════════════════════ */

/* ── Mapa de rotas ─────────────────────────────────────────── */
const Routes = {
  dashboard:    () => PageDashboard.render(),
  clientes:     () => PageClientes.render(),
  equipamentos: () => PageEquipamentos.render(),
  tecnicos:     () => PageTecnicos.render(),
  ordens:       () => PageOrdens.render(),
};

/* ── App ───────────────────────────────────────────────────── */
const App = {
  // ── Inicialização ───────────────────────────────────────────
  init() {
    Toast.init();
    this._bindEvents();

    if (Store.isLogado()) {
      this.showApp();
    } else {
      this.showLogin();
    }
  },

  // ── Mostrar tela de Login ───────────────────────────────────
  showLogin() {
    document.getElementById('login-page').classList.add('visible');
    document.getElementById('app').classList.remove('visible');
    document.getElementById('input-email').value = '';
    document.getElementById('input-senha').value = '';
    document.getElementById('login-error').classList.remove('visible');
    location.hash = '';
  },

  // ── Mostrar App principal ───────────────────────────────────
  showApp() {
    document.getElementById('login-page').classList.remove('visible');
    document.getElementById('app').classList.add('visible');
    this._renderSidebar();
    const page = location.hash.replace('#', '') || 'dashboard';
    this.navigate(page);
  },

  // ── Navegar para uma página ─────────────────────────────────
  navigate(page) {
    if (!Routes[page]) page = 'dashboard';
    location.hash = page;

    // Atualizar estado ativo da sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Mostrar loading enquanto carrega
    UI.setContent(UI.loading());

    // Chamar a função da página
    Routes[page]();
  },

  // ── Renderizar Sidebar ──────────────────────────────────────
  _renderSidebar() {
    const user = Store.getUser();

    // Nav items
    document.getElementById('sidebar-nav').innerHTML = Config.PAGES
      .map(p => `
        <div class="nav-item" data-page="${p.id}" onclick="App.navigate('${p.id}')">
          <span class="nav-item-icon">${p.icon}</span>
          ${p.label}
        </div>`)
      .join('');

    // User info
    document.getElementById('user-info').innerHTML = `
      <p class="user-name">${UI.esc(user?.nome || '')}</p>
      <p class="user-email">${UI.esc(user?.email || '')}</p>
      <span class="user-role">${UI.esc(user?.role || '')}</span>`;
  },

  // ── Bind de eventos globais ─────────────────────────────────
  _bindEvents() {
    // Navegar com hash
    window.addEventListener('hashchange', () => {
      if (Store.isLogado()) {
        const page = location.hash.replace('#', '') || 'dashboard';
        this.navigate(page);
      }
    });

    // Enter no campo de senha → login
    document.getElementById('input-senha')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') Auth.login();
    });

    // Enter no campo de email → foco na senha
    document.getElementById('input-email')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('input-senha').focus();
    });

    // Fechar modal clicando no overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });
  },
};

/* ── Inicializar quando o DOM estiver pronto ───────────────── */
document.addEventListener('DOMContentLoaded', () => App.init());
