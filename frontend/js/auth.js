/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — auth.js
   Lógica de autenticação: login, logout, guards
═══════════════════════════════════════════════════════════════ */

const Auth = {
  // ── Login ───────────────────────────────────────────────────
  async login() {
    const email = document.getElementById('input-email').value.trim();
    const senha = document.getElementById('input-senha').value;
    const errEl = document.getElementById('login-error');
    const btn   = document.getElementById('btn-login');

    // Limpar erro anterior
    errEl.classList.remove('visible');

    // Validação básica
    if (!email || !senha) {
      errEl.textContent = 'Preencha e-mail e senha.';
      errEl.classList.add('visible');
      return;
    }

    // Loading
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner spinner-sm"></div> Entrando...`;

    try {
      const data = await AuthApi.login({ email, senha });
      Store.salvarSessao(data);
      App.showApp();
      Toast.success(`Bem-vindo, ${data.nome}!`);
    } catch (error) {
      errEl.textContent = error.message || 'Credenciais inválidas.';
      errEl.classList.add('visible');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  },

  // ── Logout ──────────────────────────────────────────────────
  logout() {
    Store.limparSessao();
    App.showLogin();
  },

  // ── Verificar sessão ────────────────────────────────────────
  verificarSessao() {
    return Store.isLogado();
  },

  // ── Toggle visibilidade da senha ────────────────────────────
  toggleSenha() {
    const input = document.getElementById('input-senha');
    const btn   = document.getElementById('btn-toggle-senha');
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁';
    }
  },
};
