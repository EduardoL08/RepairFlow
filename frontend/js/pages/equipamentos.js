/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — pages/equipamentos.js
   CRUD completo de Equipamentos
═══════════════════════════════════════════════════════════════ */

const PageEquipamentos = {
  _data: [],
  _clientes: [],
  _busca: '',

  async render() {
    try {
      [this._data, this._clientes] = await Promise.all([
        EquipamentoApi.listar(),
        ClienteApi.listar(),
      ]);
      this._busca = '';
      this._renderPage();
    } catch (err) {
      UI.setContent(`<div class="card card-pad">
        ${UI.empty('⚠️', 'Erro ao carregar equipamentos', err.message)}
      </div>`);
    }
  },

  _renderPage() {
    const filtrados = this._filtrar(this._busca);
    const admin = Store.isAdmin();

    UI.setContent(`
      <div class="page-header">
        <div class="page-header-left">
          <h1>Equipamentos</h1>
          <p>${this._data.length} equipamento(s) cadastrado(s)</p>
        </div>
        <button class="btn btn-primary" onclick="PageEquipamentos.abrirModal()">
          + Novo Equipamento
        </button>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input class="input" placeholder="Buscar nome, cliente ou série..."
               value="${UI.esc(this._busca)}"
               oninput="PageEquipamentos.buscar(this.value)" />
      </div>

      <div class="card">
        ${filtrados.length === 0
          ? UI.empty('🖥', this._busca ? 'Nenhum resultado.' : 'Nenhum equipamento cadastrado.')
          : `<div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>Nome</th><th>Cliente</th><th>Marca / Modelo</th>
                  <th>Nº Série</th><th>Categoria</th><th></th>
                </tr></thead>
                <tbody>
                  ${filtrados.map(e => this._renderRow(e, admin)).join('')}
                </tbody>
              </table>
            </div>`}
      </div>
    `);
  },

  _renderRow(e, admin) {
    return `
      <tr>
        <td class="td-main">${UI.esc(e.nome)}</td>
        <td>${UI.esc(e.nomeCliente || '—')}</td>
        <td>${UI.esc(e.marca)} ${UI.esc(e.modelo)}</td>
        <td style="font-family:monospace;font-size:.8125rem">${UI.esc(e.numeroSerie)}</td>
        <td>${UI.esc(e.categoria)}</td>
        <td class="td-actions">
          <div class="actions-cell">
            <button class="btn btn-icon btn-icon-edit"
                    onclick='PageEquipamentos.abrirModal(${JSON.stringify(e)})'
                    title="Editar">✏️</button>
            ${admin ? `<button class="btn btn-icon btn-icon-delete"
                    onclick="PageEquipamentos.confirmarDelete('${e.id}','${UI.esc(e.nome)}')"
                    title="Excluir">🗑</button>` : ''}
          </div>
        </td>
      </tr>`;
  },

  buscar(q) { this._busca = q; this._renderPage(); },

  _filtrar(q) {
    if (!q) return this._data;
    const lq = q.toLowerCase();
    return this._data.filter(e =>
      e.nome.toLowerCase().includes(lq) ||
      (e.nomeCliente || '').toLowerCase().includes(lq) ||
      e.numeroSerie.includes(q)
    );
  },

  abrirModal(e = null) {
    const cliOptions = UI.selectOptions(
      this._clientes.map(c => ({ value: c.id, label: c.nome })),
      e?.clienteId
    );
    const catOptions = UI.selectOptions(Config.CATEGORIAS, e?.categoria);

    Modal.form({
      title: e ? 'Editar Equipamento' : 'Novo Equipamento',
      body: `
        <div class="form-group">
          <label class="form-label">Nome *</label>
          <input class="input" id="f-nome" value="${UI.esc(e?.nome || '')}" placeholder="Samsung TV" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Marca *</label>
            <input class="input" id="f-marca" value="${UI.esc(e?.marca || '')}" placeholder="Samsung" />
          </div>
          <div class="form-group">
            <label class="form-label">Modelo *</label>
            <input class="input" id="f-modelo" value="${UI.esc(e?.modelo || '')}" placeholder="55 QLED" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Número de Série *</label>
          <input class="input" id="f-serie" value="${UI.esc(e?.numeroSerie || '')}" placeholder="ABC123XYZ" />
        </div>
        <div class="form-group">
          <label class="form-label">Cliente *</label>
          <select class="input" id="f-cli">${cliOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Categoria *</label>
          <select class="input" id="f-cat">${catOptions}</select>
        </div>`,
      onSave: () => this.salvar(e),
    });
  },

  async salvar(e) {
    const btn = document.getElementById('modal-save');
    const dados = {
      nome:        document.getElementById('f-nome').value.trim(),
      marca:       document.getElementById('f-marca').value.trim(),
      modelo:      document.getElementById('f-modelo').value.trim(),
      numeroSerie: document.getElementById('f-serie').value.trim(),
      clienteId:   document.getElementById('f-cli').value,
      categoria:   document.getElementById('f-cat').value,
    };

    if (Object.values(dados).some(v => !v)) {
      Toast.error('Preencha todos os campos obrigatórios.'); return;
    }

    UI.setBtnLoading(btn, true);
    try {
      if (e) {
        await EquipamentoApi.atualizar(e.id, dados);
        Toast.success('Equipamento atualizado!');
      } else {
        await EquipamentoApi.criar(dados);
        Toast.success('Equipamento cadastrado!');
      }
      Modal.close('modal-form');
      await this.render();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      UI.setBtnLoading(btn, false);
    }
  },

  confirmarDelete(id, nome) {
    Modal.confirm({
      title: 'Remover equipamento?',
      message: `Deseja remover "${nome}"?`,
      onConfirm: () => this.deletar(id),
    });
  },

  async deletar(id) {
    const btn = document.getElementById('confirm-ok');
    UI.setBtnLoading(btn, true, 'Remover');
    try {
      await EquipamentoApi.deletar(id);
      Toast.success('Equipamento removido.');
      Modal.close('modal-confirm');
      await this.render();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      UI.setBtnLoading(btn, false, 'Remover');
    }
  },
};
