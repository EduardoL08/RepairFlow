/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — pages/clientes.js
   CRUD completo de Clientes
═══════════════════════════════════════════════════════════════ */

const PageClientes = {
  _data: [],
  _busca: '',

  async render() {
    try {
      this._data = await ClienteApi.listar();
      this._busca = '';
      this._renderPage();
    } catch (err) {
      UI.setContent(`<div class="card card-pad">
        ${UI.empty('⚠️', 'Erro ao carregar clientes', err.message)}
      </div>`);
    }
  },

  _renderPage() {
    const filtrados = this._filtrar(this._busca);
    const admin = Store.isAdmin();

    UI.setContent(`
      <div class="page-header">
        <div class="page-header-left">
          <h1>Clientes</h1>
          <p>${this._data.length} cliente(s) cadastrado(s)</p>
        </div>
        <button class="btn btn-primary" onclick="PageClientes.abrirModal()">
          + Novo Cliente
        </button>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input class="input" id="busca-clientes"
               placeholder="Buscar nome, e-mail ou CPF..."
               value="${UI.esc(this._busca)}"
               oninput="PageClientes.buscar(this.value)" />
      </div>

      <div class="card">
        ${filtrados.length === 0
          ? UI.empty('👥', this._busca ? 'Nenhum resultado.' : 'Nenhum cliente cadastrado.',
              this._busca ? '' : 'Clique em "Novo Cliente" para começar.')
          : `<div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>Nome</th><th>CPF</th><th>E-mail</th>
                  <th>Telefone</th><th>Endereço</th><th></th>
                </tr></thead>
                <tbody>
                  ${filtrados.map(c => this._renderRow(c, admin)).join('')}
                </tbody>
              </table>
            </div>`}
      </div>
    `);
  },

  _renderRow(c, admin) {
    return `
      <tr>
        <td class="td-main">${UI.esc(c.nome)}</td>
        <td>${UI.esc(c.cpf)}</td>
        <td>${UI.esc(c.email)}</td>
        <td>${UI.esc(c.telefone)}</td>
        <td>${UI.esc(c.endereco)}</td>
        <td class="td-actions">
          <div class="actions-cell">
            <button class="btn btn-icon btn-icon-edit"
                    onclick='PageClientes.abrirModal(${JSON.stringify(c)})'
                    title="Editar">✏️</button>
            ${admin ? `<button class="btn btn-icon btn-icon-delete"
                    onclick="PageClientes.confirmarDelete('${c.id}','${UI.esc(c.nome)}')"
                    title="Excluir">🗑</button>` : ''}
          </div>
        </td>
      </tr>`;
  },

  buscar(q) {
    this._busca = q;
    this._renderPage();
  },

  _filtrar(q) {
    if (!q) return this._data;
    const lq = q.toLowerCase();
    return this._data.filter(c =>
      c.nome.toLowerCase().includes(lq) ||
      c.email.toLowerCase().includes(lq) ||
      c.cpf.includes(q)
    );
  },

  abrirModal(c = null) {
    Modal.form({
      title: c ? 'Editar Cliente' : 'Novo Cliente',
      body: `
        <div class="form-group">
          <label class="form-label">Nome *</label>
          <input class="input" id="f-nome" value="${UI.esc(c?.nome || '')}" placeholder="João Silva" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">CPF *</label>
            <input class="input" id="f-cpf" value="${UI.esc(c?.cpf || '')}" placeholder="000.000.000-00" />
          </div>
          <div class="form-group">
            <label class="form-label">Telefone *</label>
            <input class="input" id="f-tel" value="${UI.esc(c?.telefone || '')}" placeholder="(11) 99999-9999" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">E-mail *</label>
          <input class="input" type="email" id="f-email" value="${UI.esc(c?.email || '')}" placeholder="joao@email.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Endereço *</label>
          <input class="input" id="f-end" value="${UI.esc(c?.endereco || '')}" placeholder="Rua das Flores, 123" />
        </div>`,
      onSave: () => this.salvar(c),
    });
  },

  async salvar(c) {
    const btn = document.getElementById('modal-save');
    const dados = {
      nome:      document.getElementById('f-nome').value.trim(),
      cpf:       document.getElementById('f-cpf').value.trim(),
      telefone:  document.getElementById('f-tel').value.trim(),
      email:     document.getElementById('f-email').value.trim(),
      endereco:  document.getElementById('f-end').value.trim(),
    };

    if (Object.values(dados).some(v => !v)) {
      Toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    UI.setBtnLoading(btn, true);
    try {
      if (c) {
        await ClienteApi.atualizar(c.id, dados);
        Toast.success('Cliente atualizado com sucesso!');
      } else {
        await ClienteApi.criar(dados);
        Toast.success('Cliente cadastrado com sucesso!');
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
      title: 'Remover cliente?',
      message: `Deseja remover "${nome}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => this.deletar(id),
    });
  },

  async deletar(id) {
    const btn = document.getElementById('confirm-ok');
    UI.setBtnLoading(btn, true, 'Remover');
    try {
      await ClienteApi.deletar(id);
      Toast.success('Cliente removido.');
      Modal.close('modal-confirm');
      await this.render();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      UI.setBtnLoading(btn, false, 'Remover');
    }
  },
};
