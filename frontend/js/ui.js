/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — ui.js
   Helpers de interface: toast, modal, badges, formatação
═══════════════════════════════════════════════════════════════ */

/* ── Toast ─────────────────────────────────────────────────── */
const Toast = {
  _container: null,

  init() {
    this._container = document.getElementById('toast-container');
  },

  show(message, type = 'success', duration = 3500) {
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <span class="toast-msg">${UI.esc(message)}</span>`;
    this._container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },

  success: (msg) => Toast.show(msg, 'success'),
  error:   (msg) => Toast.show(msg, 'error'),
  info:    (msg) => Toast.show(msg, 'info'),
  warning: (msg) => Toast.show(msg, 'warning'),
};

/* ── Modal ─────────────────────────────────────────────────── */
const Modal = {
  open(id)  { document.getElementById(id)?.classList.add('open'); },
  close(id) { document.getElementById(id)?.classList.remove('open'); },

  // Modal genérico (formulários)
  form({ title, body, onSave, saveLabel = 'Salvar' }) {
    document.getElementById('modal-title').textContent  = title;
    document.getElementById('modal-body').innerHTML     = body;
    const saveBtn = document.getElementById('modal-save');
    saveBtn.textContent = saveLabel;
    saveBtn.disabled = false;
    saveBtn.onclick = onSave;
    this.open('modal-form');
  },

  // Modal de confirmação
  confirm({ title, message, onConfirm, confirmLabel = 'Remover' }) {
    document.getElementById('confirm-title').textContent   = title;
    document.getElementById('confirm-message').textContent = message;
    const okBtn = document.getElementById('confirm-ok');
    okBtn.textContent = confirmLabel;
    okBtn.disabled = false;
    okBtn.onclick = onConfirm;
    this.open('modal-confirm');
  },

  // Modal de status
  status({ title, body, onSave }) {
    document.getElementById('status-title').textContent = title;
    document.getElementById('status-body').innerHTML    = body;
    const saveBtn = document.getElementById('status-save');
    saveBtn.disabled = false;
    saveBtn.onclick = onSave;
    this.open('modal-status');
  },
};

/* ── UI Helpers ────────────────────────────────────────────── */
const UI = {
  // Escapar HTML para prevenir XSS
  esc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  // Renderizar badge de status
  statusBadge(status) {
    const cfg = Config.STATUS_ORDENS[status];
    if (!cfg) return `<span class="badge badge-gray">${this.esc(status)}</span>`;
    return `<span class="badge ${cfg.badge}">${cfg.label}</span>`;
  },

  // Renderizar badge de prioridade
  prioridadeBadge(prioridade) {
    const cfg = Config.PRIORIDADES[prioridade];
    if (!cfg) return `<span class="badge badge-gray">${this.esc(prioridade)}</span>`;
    return `<span class="badge ${cfg.badge}">${cfg.label}</span>`;
  },

  // Loading state
  loading(msg = 'Carregando...') {
    return `<div class="loading-state">
              <div class="spinner"></div>
              <span>${msg}</span>
            </div>`;
  },

  // Empty state
  empty(icon, title, desc = '', action = '') {
    return `<div class="empty-state">
              <div class="empty-icon">${icon}</div>
              <p class="empty-title">${title}</p>
              ${desc   ? `<p class="empty-desc">${desc}</p>` : ''}
              ${action ? action : ''}
            </div>`;
  },

  // Opções de um select como HTML
  selectOptions(arr, selected = '', emptyLabel = 'Selecione...') {
    const empty = `<option value="">${emptyLabel}</option>`;
    return empty + arr.map(item => {
      const val  = typeof item === 'object' ? item.value : item;
      const lbl  = typeof item === 'object' ? item.label : item;
      const sel  = val === selected ? 'selected' : '';
      return `<option value="${this.esc(val)}" ${sel}>${this.esc(lbl)}</option>`;
    }).join('');
  },

  // Formatar moeda BRL
  brl(valor) {
    return Number(valor ?? 0).toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL',
    });
  },

  // Definir conteúdo da página
  setContent(html) {
    document.getElementById('main-content').innerHTML = html;
  },

  // Botão de salvar em estado de loading
  setBtnLoading(btn, loading, label = 'Salvar') {
    if (loading) {
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner spinner-sm"></div> Salvando...`;
    } else {
      btn.disabled = false;
      btn.textContent = label;
    }
  },
};
