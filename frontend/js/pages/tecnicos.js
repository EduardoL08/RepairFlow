const PageTecnicos = {
  _data:[], _busca:'',

  async render() {
    try{this._data=await TecnicoApi.listar();this._busca='';this._renderPage();}
    catch(err){UI.setContent(`<div class="card card-pad">${UI.empty('inbox','Erro ao carregar técnicos',err.message)}</div>`);}
  },

  _renderPage() {
    const f=this._filtrar(this._busca); const admin=Store.isAdmin();
    UI.setContent(`
      <div class="page-header">
        <div class="page-header-left"><h1>Técnicos</h1><p>${this._data.length} técnico(s)</p></div>
        ${admin?`<button class="btn btn-primary" onclick="PageTecnicos.abrirModal()">${Icons.get('plus',15)} Novo Técnico</button>`:''}
      </div>
      <div class="search-bar">
        <span class="search-icon">${Icons.get('search',14)}</span>
        <input class="input" placeholder="Buscar nome ou e-mail..." value="${UI.esc(this._busca)}" oninput="PageTecnicos.buscar(this.value)"/>
      </div>
      <div class="card">
        ${f.length===0?UI.empty('wrench',this._busca?'Nenhum resultado.':'Nenhum técnico.')
        :`<div class="table-wrapper"><table>
            <thead><tr><th>Nome</th><th>Especialidade</th><th>E-mail</th><th>Telefone</th><th></th></tr></thead>
            <tbody>${f.map(t=>this._row(t,admin)).join('')}</tbody>
          </table></div>`}
      </div>`);
  },

  _row(t,admin) {
    return `<tr>
      <td class="td-main">${UI.esc(t.nome)}</td><td>${UI.esc(t.especialidade)}</td>
      <td>${UI.esc(t.email)}</td><td>${UI.esc(t.telefone)}</td>
      <td class="td-actions"><div class="actions-cell">
        ${admin?`<button class="btn btn-icon btn-icon-edit" onclick='PageTecnicos.abrirModal(${JSON.stringify(t)})' title="Editar">${Icons.get('edit',14)}</button>
        <button class="btn btn-icon btn-icon-delete" onclick="PageTecnicos.confirmarDelete('${t.id}','${UI.esc(t.nome)}')" title="Excluir">${Icons.get('trash',14)}</button>`:''}
      </div></td></tr>`;
  },

  buscar(q){this._busca=q;this._renderPage();},
  _filtrar(q){
    if(!q)return this._data; const lq=q.toLowerCase();
    return this._data.filter(t=>t.nome.toLowerCase().includes(lq)||t.email.toLowerCase().includes(lq));
  },

  abrirModal(t=null) {
    const espOpts=UI.selectOptions(Config.ESPECIALIDADES,t?.especialidade);
    Modal.form({
      title:t?'Editar Técnico':'Novo Técnico',
      body:`
        <div class="form-group"><label class="form-label">Nome *</label>
          <input class="input" id="f-nome" value="${UI.esc(t?.nome||'')}" placeholder="Carlos Silva"/></div>
        <div class="form-group"><label class="form-label">Especialidade *</label>
          <select class="input" id="f-esp">${espOpts}</select></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Telefone *</label>
            <input class="input" id="f-tel" value="${UI.esc(t?.telefone||'')}" placeholder="(11) 99999-9999"/></div>
          <div class="form-group"><label class="form-label">E-mail *</label>
            <input class="input" type="email" id="f-email" value="${UI.esc(t?.email||'')}" placeholder="carlos@email.com"/></div>
        </div>`,
      onSave:()=>this.salvar(t),
    });
  },

  async salvar(t) {
    const btn=document.getElementById('modal-save');
    const dados={nome:document.getElementById('f-nome').value.trim(),especialidade:document.getElementById('f-esp').value,telefone:document.getElementById('f-tel').value.trim(),email:document.getElementById('f-email').value.trim()};
    if(Object.values(dados).some(v=>!v)){Toast.error('Preencha todos os campos.');return;}
    UI.setBtnLoading(btn,true);
    try{t?await TecnicoApi.atualizar(t.id,dados):await TecnicoApi.criar(dados);Toast.success(t?'Técnico atualizado!':'Técnico cadastrado!');Modal.close('modal-form');await this.render();}
    catch(err){Toast.error(err.message);}finally{UI.setBtnLoading(btn,false);}
  },

  confirmarDelete(id,nome){Modal.confirm({title:'Remover técnico?',message:`Remover "${nome}"?`,onConfirm:()=>this.deletar(id)});},

  async deletar(id){
    const btn=document.getElementById('confirm-ok');UI.setBtnLoading(btn,true,'Remover');
    try{await TecnicoApi.deletar(id);Toast.success('Técnico removido.');Modal.close('modal-confirm');await this.render();}
    catch(err){Toast.error(err.message);}finally{UI.setBtnLoading(btn,false,'Remover');}
  },
};
