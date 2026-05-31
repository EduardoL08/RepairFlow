/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — app.js
   App principal: inicialização, sidebar com ícones SVG, roteamento por hash
═══════════════════════════════════════════════════════════════ */

const Routes = {
  dashboard:    () => PageDashboard.render(),
  clientes:     () => PageClientes.render(),
  equipamentos: () => PageEquipamentos.render(),
  tecnicos:     () => PageTecnicos.render(),
  ordens:       () => PageOrdens.render(),
};

const App = {
  init() {
    Toast.init();
    this._bindEvents();
    Store.isLogado() ? this.showApp() : this.showLogin();
  },

  showLogin() {
    document.getElementById('login-page').classList.add('visible');
    document.getElementById('app').classList.remove('visible');
    document.getElementById('input-email').value = '';
    document.getElementById('input-senha').value = '';
    document.getElementById('login-error').classList.remove('visible');
    location.hash = '';
  },

  showApp() {
    document.getElementById('login-page').classList.remove('visible');
    document.getElementById('app').classList.add('visible');
    this._renderSidebar();
    const page = location.hash.replace('#', '') || 'dashboard';
    this.navigate(page);
  },

  navigate(page) {
    if (!Routes[page]) page = 'dashboard';
    location.hash = page;
    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.page === page));
    UI.setContent(UI.loading());
    Routes[page]();
  },

  _renderSidebar() {
    const user = Store.getUser();

    document.getElementById('sidebar-nav').innerHTML = `
      <div class="nav-section">Menu</div>
      ${Config.PAGES.map(p => `
        <div class="nav-item" data-page="${p.id}" onclick="App.navigate('${p.id}')">
          <span class="nav-item-icon">${Icons.get(p.icon, 16)}</span>
          ${p.label}
        </div>`).join('')}`;

    document.getElementById('user-info').innerHTML = `
      <p class="user-name">${UI.esc(user?.nome || '')}</p>
      <p class="user-email">${UI.esc(user?.email || '')}</p>
      <span class="user-role">${UI.esc(user?.role || '')}</span>`;
  },

  _bindEvents() {
    window.addEventListener('hashchange', () => {
      if (Store.isLogado()) {
        const page = location.hash.replace('#', '') || 'dashboard';
        this.navigate(page);
      }
    });

    document.getElementById('input-senha')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') Auth.login();
    });

    document.getElementById('input-email')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('input-senha').focus();
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
