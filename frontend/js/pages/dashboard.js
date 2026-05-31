/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — pages/dashboard.js
═══════════════════════════════════════════════════════════════ */

const PageDashboard = {
  async render() {
    try {
      const [stats, ordens] = await Promise.all([
        OrdemApi.dashboard(), OrdemApi.listar(),
      ]);
      const total    = stats.totalOrdens || 0;
      const cnt      = stats.contagemPorStatus || {};
      const pct      = v => total > 0 ? Math.round((v / total) * 100) : 0;
      const recentes = [...ordens]
        .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))
        .slice(0, 5);
      const user = Store.getUser();

      UI.setContent(`
        <div class="page-header">
          <div class="page-header-left">
            <h1>Olá, ${UI.esc(user?.nome?.split(' ')[0])} 👋</h1>
            <p>Aqui está o resumo do sistema.</p>
          </div>
        </div>
        ${this._stats(stats)}
        <div class="dashboard-grid">
          ${this._statusPanel(cnt, total, pct, stats)}
          ${this._recentOrders(recentes)}
        </div>`);
    } catch (err) {
      UI.setContent(`<div class="card card-pad">
        ${UI.empty('inbox', 'Erro ao carregar dashboard', err.message)}
      </div>`);
    }
  },

  _stats(s) {
    const cards = [
      { label:'Clientes',         value:s.totalClientes,    icon:'users',     css:'stat-icon-blue',   page:'clientes'     },
      { label:'Equipamentos',     value:s.totalEquipamentos, icon:'monitor',   css:'stat-icon-purple', page:'equipamentos' },
      { label:'Técnicos',         value:s.totalTecnicos,    icon:'wrench',    css:'stat-icon-yellow', page:'tecnicos'     },
      { label:'Ordens de Serviço',value:s.totalOrdens,      icon:'clipboard', css:'stat-icon-green',  page:'ordens'       },
    ];
    return `<div class="stats-grid">
      ${cards.map(c=>`
        <div class="stat-card" onclick="App.navigate('${c.page}')">
          <div class="stat-card-icon ${c.css}">${Icons.get(c.icon, 22)}</div>
          <div>
            <div class="stat-card-label">${c.label}</div>
            <div class="stat-card-value">${c.value ?? '—'}</div>
          </div>
        </div>`).join('')}
    </div>`;
  },

  _statusPanel(cnt, total, pct, stats) {
    const bars = [
      { label:'Abertas',      key:'Aberta',         cor:'#3b82f6' },
      { label:'Em Andamento', key:'EmAndamento',    cor:'#f59e0b' },
      { label:'Aguard. Peça', key:'AguardandoPeca', cor:'#f97316' },
      { label:'Finalizadas',  key:'Finalizada',     cor:'#10d987' },
    ];
    return `
      <div class="card card-pad">
        <h3 style="font-size:.9375rem;font-weight:600;margin-bottom:1.25rem;color:var(--text-primary)">
          Ordens por Status
        </h3>
        <div class="status-bars">
          ${bars.map(b => {
            const v = cnt[b.key] || 0;
            return `<div class="status-bar-item">
              <div class="status-bar-header">
                <span class="status-bar-label">${b.label}</span>
                <span>
                  <span class="status-bar-count">${v}</span>
                  <span class="status-bar-pct">(${pct(v)}%)</span>
                </span>
              </div>
              <div class="status-bar-track">
                <div class="status-bar-fill" style="width:${pct(v)}%;background:${b.cor};color:${b.cor}"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="indicators">
          <div class="indicator ${stats.ordensAlta > 0 ? 'indicator-danger' : 'indicator-success'}">
            <span class="indicator-icon">${Icons.get(stats.ordensAlta > 0 ? 'alertTriangle' : 'checkCircle', 17)}</span>
            <div class="indicator-text">
              <p>${stats.ordensAlta > 0 ? `${stats.ordensAlta} ordem(ns) alta prioridade em aberto` : 'Nenhuma urgência pendente'}</p>
              <span>Alta prioridade não finalizada</span>
            </div>
          </div>
          <div class="indicator indicator-success">
            <span class="indicator-icon">${Icons.get('checkCircle', 17)}</span>
            <div class="indicator-text">
              <p>${cnt.Finalizada || 0} ordens finalizadas</p>
              <span>${total > 0 ? `${pct(cnt.Finalizada || 0)}% do total` : 'Sem dados'}</span>
            </div>
          </div>
          <div class="indicator indicator-warning">
            <span class="indicator-icon">${Icons.get('clock', 17)}</span>
            <div class="indicator-text">
              <p>${(cnt.EmAndamento||0)+(cnt.AguardandoPeca||0)} ordens em progresso</p>
              <span>Em andamento + aguardando peça</span>
            </div>
          </div>
        </div>
      </div>`;
  },

  _recentOrders(ordens) {
    const rows = ordens.length === 0
      ? UI.empty('inbox', 'Nenhuma ordem cadastrada ainda.')
      : `<div class="table-wrapper"><table>
          <thead><tr>
            <th>Equipamento</th><th>Cliente</th>
            <th>Técnico</th><th>Status</th><th>Prioridade</th>
          </tr></thead>
          <tbody>
            ${ordens.map(o=>`<tr>
              <td class="td-main">${UI.esc(o.nomeEquipamento||'—')}</td>
              <td>${UI.esc(o.nomeCliente||'—')}</td>
              <td>${UI.esc(o.nomeTecnico||'—')}</td>
              <td>${UI.statusBadge(o.status)}</td>
              <td>${UI.prioridadeBadge(o.prioridade)}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>`;

    return `<div class="card">
      <div class="recent-card-header">
        <span class="recent-card-title">Ordens Recentes</span>
        <span class="link-action" onclick="App.navigate('ordens')">
          Ver todas ${Icons.get('arrowRight', 13)}
        </span>
      </div>
      ${rows}
    </div>`;
  },
};
