/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — pages/clientes.js
═══════════════════════════════════════════════════════════════ */

const PageClientes = {
  _data: [], _busca: '',

  async render() {
    try {
      this._data = await ClienteApi.listar();
      this._busca = '';
      this._renderPage();
    } catch (err) {
      UI.setContent(`<div class="card card-pad">${UI.empty('inbox','Erro ao carregar clientes',err.message)}</div>`);
    }
  },

  _renderPage() {
    const f = this._filtrar(this._busca);
    const admin = Store.isAdmin();
    UI.setContent(`
      <div class="page-header">
        <div class="page-header-left">
          <h1>Clientes</h1>
          <p>${this._data.length} cliente(s) cadastrado(s)</p>
        </div>
        <button class="btn btn-primary" onclick="PageClientes.abrirModal()">
          ${Icons.get('plus',15)} Novo Cliente
        </button>
      </div>
      <div class="search-bar">
        ${Icons.get('search',14,'search-icon')}
        <input class="input" placeholder="Buscar nome, e-mail ou CPF..."
               value="${UI.esc(this._busca)}" oninput="PageClientes.buscar(this.value)" />
      </div>
      <div class="card">
        ${f.length === 0
          ? UI.empty('users', this._busca ? 'Nenhum resultado.' : 'Nenhum cliente cadastrado.',
              '', !this._busca ? `<button class="btn btn-primary btn-sm" onclick="PageClientes.abrirModal()">${Icons.get('plus',13)} Novo Cliente</button>` : '')
          : `<div class="table-wrapper"><table>
              <thead><tr><th>Nome</th><th>CPF</th><th>E-mail</th><th>Telefone</th><th>Endereço</th><th></th></tr></thead>
              <tbody>${f.map(c=>this._row(c,admin)).join('')}</tbody>
            </table></div>`}
      </div>`);
  },

  _row(c, admin) {
    return `<tr>
      <td class="td-main">${UI.esc(c.nome)}</td>
      <td>${UI.esc(c.cpf)}</td>
      <td>${UI.esc(c.email)}</td>
      <td>${UI.esc(c.telefone)}</td>
      <td>${UI.esc(c.endereco)}</td>
      <td class="td-actions"><div class="actions-cell">
        <button class="btn btn-icon btn-icon-edit" onclick='PageClientes.abrirModal(${JSON.stringify(c)})' title="Editar">
          ${Icons.get('edit',14)}
        </button>
        ${admin ? `<button class="btn btn-icon btn-icon-delete" onclick="PageClientes.confirmarDelete('${c.id}','${UI.esc(c.nome)}')" title="Excluir">
          ${Icons.get('trash',14)}
        </button>` : ''}
      </div></td>
    </tr>`;
  },

  buscar(q) { this._busca = q; this._renderPage(); },

  _filtrar(q) {
    if (!q) return this._data;
    const lq = q.toLowerCase();
    return this._data.filter(c =>
      c.nome.toLowerCase().includes(lq) || c.email.toLowerCase().includes(lq) || c.cpf.includes(q));
  },

  abrirModal(c = null) {
    Modal.form({
      title: c ? 'Editar Cliente' : 'Novo Cliente',
      body: `
        <div class="form-group"><label class="form-label">Nome *</label>
          <input class="input" id="f-nome" value="${UI.esc(c?.nome||'')}" placeholder="João Silva"/></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">CPF *</label>
            <input class="input" id="f-cpf" value="${UI.esc(c?.cpf||'')}" placeholder="000.000.000-00"/></div>
          <div class="form-group"><label class="form-label">Telefone *</label>
            <input class="input" id="f-tel" value="${UI.esc(c?.telefone||'')}" placeholder="(11) 99999-9999"/></div>
        </div>
        <div class="form-group"><label class="form-label">E-mail *</label>
          <input class="input" type="email" id="f-email" value="${UI.esc(c?.email||'')}" placeholder="joao@email.com"/></div>
        <div class="form-group"><label class="form-label">Endereço *</label>
          <input class="input" id="f-end" value="${UI.esc(c?.endereco||'')}" placeholder="Rua das Flores, 123"/></div>`,
      onSave: () => this.salvar(c),
    });
  },

  async salvar(c) {
    const btn = document.getElementById('modal-save');
    const dados = {
      nome:     document.getElementById('f-nome').value.trim(),
      cpf:      document.getElementById('f-cpf').value.trim(),
      telefone: document.getElementById('f-tel').value.trim(),
      email:    document.getElementById('f-email').value.trim(),
      endereco: document.getElementById('f-end').value.trim(),
    };
    if (Object.values(dados).some(v => !v)) { Toast.error('Preencha todos os campos.'); return; }
    UI.setBtnLoading(btn, true);
    try {
      c ? await ClienteApi.atualizar(c.id, dados) : await ClienteApi.criar(dados);
      Toast.success(c ? 'Cliente atualizado!' : 'Cliente cadastrado!');
      Modal.close('modal-form'); await this.render();
    } catch (err) { Toast.error(err.message); }
    finally { UI.setBtnLoading(btn, false); }
  },

  confirmarDelete(id, nome) {
    Modal.confirm({ title:'Remover cliente?', message:`Deseja remover "${nome}"? Esta ação não pode ser desfeita.`, onConfirm:()=>this.deletar(id) });
  },

  async deletar(id) {
    const btn = document.getElementById('confirm-ok');
    UI.setBtnLoading(btn, true, 'Remover');
    try {
      await ClienteApi.deletar(id);
      Toast.success('Cliente removido.'); Modal.close('modal-confirm'); await this.render();
    } catch (err) { Toast.error(err.message); }
    finally { UI.setBtnLoading(btn, false, 'Remover'); }
  },
};
