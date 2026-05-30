/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — pages/ordens.js
   CRUD completo de Ordens de Serviço + atualização de status
═══════════════════════════════════════════════════════════════ */

const PageOrdens = {
  _data: [],
  _equipamentos: [],
  _tecnicos: [],
  _busca: '',
  _filtroStatus: '',

  async render() {
    try {
      [this._data, this._equipamentos, this._tecnicos] = await Promise.all([
        OrdemApi.listar(),
        EquipamentoApi.listar(),
        TecnicoApi.listar(),
      ]);
      this._busca = '';
      this._filtroStatus = '';
      this._renderPage();
    } catch (err) {
      UI.setContent(`<div class="card card-pad">
        ${UI.empty('⚠️', 'Erro ao carregar ordens', err.message)}
      </div>`);
    }
  },

  _renderPage() {
    const filtrados = this._filtrar();
    const admin = Store.isAdmin();

    UI.setContent(`
      <div class="page-header">
        <div class="page-header-left">
          <h1>Ordens de Serviço</h1>
          <p>${this._data.length} ordem(ns) no total</p>
        </div>
        <button class="btn btn-primary" onclick="PageOrdens.abrirModalCriar()">
          + Nova Ordem
        </button>
      </div>

      <div class="filters-row">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input class="input" placeholder="Buscar equipamento ou cliente..."
                 value="${UI.esc(this._busca)}"
                 oninput="PageOrdens.filtrar(this.value, '${this._filtroStatus}')" />
        </div>
        <select class="input" style="width:auto;min-width:180px"
                onchange="PageOrdens.filtrar('${UI.esc(this._busca)}', this.value)">
          <option value="" ${!this._filtroStatus ? 'selected' : ''}>Todos os Status</option>
          <option value="Aberta"         ${this._filtroStatus==='Aberta'?'selected':''}>Aberta</option>
          <option value="EmAndamento"    ${this._filtroStatus==='EmAndamento'?'selected':''}>Em Andamento</option>
          <option value="AguardandoPeca" ${this._filtroStatus==='AguardandoPeca'?'selected':''}>Aguardando Peça</option>
          <option value="Finalizada"     ${this._filtroStatus==='Finalizada'?'selected':''}>Finalizada</option>
        </select>
      </div>

      <div class="card">
        ${filtrados.length === 0
          ? UI.empty('📋', 'Nenhuma ordem encontrada.',
              this._busca || this._filtroStatus ? 'Tente ajustar os filtros.' : 'Crie a primeira ordem clicando em "+ Nova Ordem".')
          : `<div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>Equipamento</th><th>Cliente</th><th>Técnico</th>
                  <th>Status</th><th>Prioridade</th><th>Valor</th><th></th>
                </tr></thead>
                <tbody>
                  ${filtrados.map(o => this._renderRow(o, admin)).join('')}
                </tbody>
              </table>
            </div>`}
      </div>
    `);
  },

  _renderRow(o, admin) {
    return `
      <tr>
        <td class="td-main">${UI.esc(o.nomeEquipamento || '—')}</td>
        <td>${UI.esc(o.nomeCliente || '—')}</td>
        <td>${UI.esc(o.nomeTecnico || '—')}</td>
        <td>${UI.statusBadge(o.status)}</td>
        <td>${UI.prioridadeBadge(o.prioridade)}</td>
        <td style="font-family:monospace">${UI.brl(o.valor)}</td>
        <td class="td-actions">
          <div class="actions-cell">
            <button class="btn btn-icon btn-icon-status"
                    onclick='PageOrdens.abrirModalStatus(${JSON.stringify(o)})'
                    title="Atualizar status">✅</button>
            ${admin ? `<button class="btn btn-icon btn-icon-delete"
                    onclick="PageOrdens.confirmarDelete('${o.id}')"
                    title="Excluir">🗑</button>` : ''}
          </div>
        </td>
      </tr>`;
  },

  filtrar(busca, status) {
    this._busca = busca;
    this._filtroStatus = status;
    this._renderPage();
  },

  _filtrar() {
    let f = this._data;
    if (this._filtroStatus) f = f.filter(o => o.status === this._filtroStatus);
    if (this._busca) {
      const lq = this._busca.toLowerCase();
      f = f.filter(o =>
        (o.nomeEquipamento || '').toLowerCase().includes(lq) ||
        (o.nomeCliente     || '').toLowerCase().includes(lq)
      );
    }
    return f;
  },

  abrirModalCriar() {
    const equipOpts = UI.selectOptions(
      this._equipamentos.map(e => ({ value: e.id, label: `${e.nome} (${e.nomeCliente || '—'})` }))
    );
    const tecOpts = UI.selectOptions(
      this._tecnicos.map(t => ({ value: t.id, label: t.nome }))
    );
    const priOpts = UI.selectOptions(['Baixa', 'Media', 'Alta']);

    Modal.form({
      title: 'Nova Ordem de Serviço',
      body: `
        <div class="form-group">
          <label class="form-label">Equipamento *</label>
          <select class="input" id="fo-equip">${equipOpts}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Técnico *</label>
          <select class="input" id="fo-tec">${tecOpts}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Problema Relatado * (mín. 10 caracteres)</label>
          <textarea class="input" id="fo-prob"
                    placeholder="Descreva detalhadamente o problema..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Valor (R$)</label>
            <input class="input" type="number" id="fo-val" value="0" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label class="form-label">Prioridade *</label>
            <select class="input" id="fo-pri">${priOpts}</select>
          </div>
        </div>`,
      onSave: () => this.criarOrdem(),
    });
  },

  async criarOrdem() {
    const btn = document.getElementById('modal-save');
    const prob = document.getElementById('fo-prob').value.trim();
    const dados = {
      equipamentoId:   document.getElementById('fo-equip').value,
      tecnicoId:       document.getElementById('fo-tec').value,
      problemaRelatado: prob,
      valor:           parseFloat(document.getElementById('fo-val').value) || 0,
      prioridade:      document.getElementById('fo-pri').value,
    };

    if (!dados.equipamentoId || !dados.tecnicoId || !dados.prioridade) {
      Toast.error('Selecione equipamento, técnico e prioridade.'); return;
    }
    if (prob.length < 10) {
      Toast.error('Problema relatado deve ter no mínimo 10 caracteres.'); return;
    }

    UI.setBtnLoading(btn, true);
    try {
      await OrdemApi.criar(dados);
      Toast.success('Ordem de serviço criada!');
      Modal.close('modal-form');
      await this.render();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      UI.setBtnLoading(btn, false);
    }
  },

  abrirModalStatus(o) {
    const statusOpts = [
      ['Aberta',         'Aberta'],
      ['EmAndamento',    'Em Andamento'],
      ['AguardandoPeca', 'Aguardando Peça'],
      ['Finalizada',     'Finalizada'],
    ];

    Modal.status({
      title: `Status: ${o.nomeEquipamento || 'Ordem'}`,
      body: `
        <p style="font-size:.8125rem;color:var(--gray-500);margin-bottom:1rem">
          Status atual: ${UI.statusBadge(o.status)}
        </p>
        <div class="form-group">
          <label class="form-label">Novo Status *</label>
          ${statusOpts.map(([val, lbl]) => `
            <label class="radio-option">
              <input type="radio" name="novo-status" value="${val}"
                     ${o.status === val ? 'checked' : ''} />
              <span>${lbl}</span>
            </label>`).join('')}
        </div>
        <div class="form-group">
          <label class="form-label">Diagnóstico</label>
          <textarea class="input" id="st-diag"
                    placeholder="Resultado da análise...">${UI.esc(o.diagnostico || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Solução</label>
          <textarea class="input" id="st-sol"
                    placeholder="Como foi resolvido...">${UI.esc(o.solucao || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Valor (R$)</label>
          <input class="input" type="number" id="st-val"
                 value="${o.valor || 0}" min="0" step="0.01" />
        </div>`,
      onSave: () => this.atualizarStatus(o.id),
    });
  },

  async atualizarStatus(id) {
    const btn = document.getElementById('status-save');
    const novoStatus = document.querySelector('input[name="novo-status"]:checked')?.value;

    if (!novoStatus) { Toast.error('Selecione um status.'); return; }

    const dados = {
      status:      novoStatus,
      diagnostico: document.getElementById('st-diag').value.trim() || undefined,
      solucao:     document.getElementById('st-sol').value.trim()  || undefined,
      valor:       parseFloat(document.getElementById('st-val').value) || undefined,
    };

    UI.setBtnLoading(btn, true, 'Atualizar');
    try {
      await OrdemApi.atualizarStatus(id, dados);
      Toast.success('Status atualizado com sucesso!');
      Modal.close('modal-status');
      await this.render();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      UI.setBtnLoading(btn, false, 'Atualizar');
    }
  },

  confirmarDelete(id) {
    Modal.confirm({
      title: 'Remover ordem?',
      message: 'Deseja remover esta ordem de serviço? Esta ação não pode ser desfeita.',
      onConfirm: () => this.deletar(id),
    });
  },

  async deletar(id) {
    const btn = document.getElementById('confirm-ok');
    UI.setBtnLoading(btn, true, 'Remover');
    try {
      await OrdemApi.deletar(id);
      Toast.success('Ordem removida.');
      Modal.close('modal-confirm');
      await this.render();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      UI.setBtnLoading(btn, false, 'Remover');
    }
  },
};
