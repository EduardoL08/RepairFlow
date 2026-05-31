/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — ui.js
   Helpers: toast, modal, badges, ícones, formatação
═══════════════════════════════════════════════════════════════ */

const Toast = {
  _container: null,
  init() {
    this._container = document.getElementById("toast-container");
  },

  show(message, type = "success", duration = 3500) {
    const iconMap = {
      success: Icons.get("checkCircle", 15),
      error: Icons.get("x", 15),
      info: Icons.get("zap", 15),
      warning: Icons.get("alertTriangle", 15),
    };
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${iconMap[type] || ""}</span>
      <span class="toast-msg">${UI.esc(message)}</span>`;
    this._container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },

  success: (msg) => Toast.show(msg, "success"),
  error: (msg) => Toast.show(msg, "error"),
  info: (msg) => Toast.show(msg, "info"),
  warning: (msg) => Toast.show(msg, "warning"),
};

const Modal = {
  open(id) {
    document.getElementById(id)?.classList.add("open");
  },
  close(id) {
    document.getElementById(id)?.classList.remove("open");
  },

  form({ title, body, onSave, saveLabel = "Salvar" }) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML = body;
    const btn = document.getElementById("modal-save");
    btn.textContent = saveLabel;
    btn.disabled = false;
    btn.onclick = onSave;
    this.open("modal-form");
  },

  confirm({ title, message, onConfirm, confirmLabel = "Remover" }) {
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-message").textContent = message;
    const btn = document.getElementById("confirm-ok");
    btn.textContent = confirmLabel;
    btn.disabled = false;
    btn.onclick = onConfirm;
    this.open("modal-confirm");
  },

  status({ title, body, onSave }) {
    document.getElementById("status-title").textContent = title;
    document.getElementById("status-body").innerHTML = body;
    const btn = document.getElementById("status-save");
    btn.disabled = false;
    btn.onclick = onSave;
    this.open("modal-status");
  },
};

const UI = {
  esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },

  statusBadge(status) {
    const cfg = Config.STATUS_ORDENS[status];
    if (!cfg)
      return `<span class="badge badge-gray">${this.esc(status)}</span>`;
    return `<span class="badge ${cfg.badge}">${cfg.label}</span>`;
  },

  prioridadeBadge(prioridade) {
    const cfg = Config.PRIORIDADES[prioridade];
    if (!cfg)
      return `<span class="badge badge-gray">${this.esc(prioridade)}</span>`;
    return `<span class="badge ${cfg.badge}">${cfg.label}</span>`;
  },

  loading(msg = "Carregando...") {
    return `<div class="loading-state">
              ${Icons.get("loader", 20, "ico-spin icon-accent")}
              <span>${msg}</span>
            </div>`;
  },

  empty(iconName, title, desc = "", action = "") {
    return `<div class="empty-state">
              <div class="empty-icon">${Icons.get(iconName, 40)}</div>
              <p class="empty-title">${title}</p>
              ${desc ? `<p class="empty-desc">${desc}</p>` : ""}
              ${action ? action : ""}
            </div>`;
  },

  selectOptions(arr, selected = "", emptyLabel = "Selecione...") {
    const empty = `<option value="">${emptyLabel}</option>`;
    return (
      empty +
      arr
        .map((item) => {
          const val = typeof item === "object" ? item.value : item;
          const lbl = typeof item === "object" ? item.label : item;
          return `<option value="${this.esc(val)}" ${val === selected ? "selected" : ""}>${this.esc(lbl)}</option>`;
        })
        .join("")
    );
  },

  brl(valor) {
    return Number(valor ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  },

  setContent(html) {
    document.getElementById("main-content").innerHTML = html;
  },

  setBtnLoading(btn, loading, label = "Salvar") {
    if (loading) {
      btn.disabled = true;
      btn.innerHTML = `${Icons.get("loader", 14, "ico-spin")} Salvando...`;
    } else {
      btn.disabled = false;
      btn.textContent = label;
    }
  },
};
