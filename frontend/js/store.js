/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — store.js
   Estado global da aplicação usando localStorage
═══════════════════════════════════════════════════════════════ */

const Store = {
  // ── Chaves do localStorage ──────────────────────────────────
  KEYS: {
    TOKEN:   'rf_token',
    USER:    'rf_user',
  },

  // ── Token ───────────────────────────────────────────────────
  getToken() {
    return localStorage.getItem(this.KEYS.TOKEN);
  },

  setToken(token) {
    localStorage.setItem(this.KEYS.TOKEN, token);
  },

  removeToken() {
    localStorage.removeItem(this.KEYS.TOKEN);
  },

  // ── Usuário ─────────────────────────────────────────────────
  getUser() {
    try {
      const raw = localStorage.getItem(this.KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
  },

  removeUser() {
    localStorage.removeItem(this.KEYS.USER);
  },

  // ── Sessão ──────────────────────────────────────────────────
  salvarSessao(authResponse) {
    this.setToken(authResponse.token);
    this.setUser({
      nome:      authResponse.nome,
      email:     authResponse.email,
      role:      authResponse.role,
      expiracao: authResponse.expiracao,
    });
  },

  limparSessao() {
    this.removeToken();
    this.removeUser();
  },

  // ── Verificações ────────────────────────────────────────────
  isLogado() {
    const token = this.getToken();
    const user  = this.getUser();
    if (!token || !user) return false;
    // Verifica se o token não expirou
    if (user.expiracao) {
      return new Date(user.expiracao) > new Date();
    }
    return !!token;
  },

  isAdmin() {
    return this.getUser()?.role === 'admin';
  },
};
