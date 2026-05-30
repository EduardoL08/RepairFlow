/* ═══════════════════════════════════════════════════════════════
   REPAIRFLOW — api.js
   Cliente HTTP: fetch wrapper + todas as chamadas da API
═══════════════════════════════════════════════════════════════ */

/* ── Core HTTP ─────────────────────────────────────────────── */
async function httpRequest(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };

  // Adiciona token JWT em todas as requisições autenticadas
  const token = Store.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(Config.API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error('Sem conexão com o servidor. Verifique se o backend está rodando.');
  }

  // Sessão expirada — desloga
  if (response.status === 401) {
    Auth.logout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  // Sem conteúdo (DELETE bem-sucedido)
  if (response.status === 204) return null;

  // Parsear JSON
  const data = await response.json().catch(() => ({}));

  // Erro HTTP
  if (!response.ok) {
    const msg = data.message || data.title || data.errors
      ? Object.values(data.errors || {}).flat().join(', ')
      : `Erro ${response.status}`;
    throw new Error(msg || `Erro ${response.status}`);
  }

  return data;
}

// Atalhos para os métodos HTTP
const http = {
  get:    (path)       => httpRequest('GET',    path),
  post:   (path, body) => httpRequest('POST',   path, body),
  put:    (path, body) => httpRequest('PUT',    path, body),
  patch:  (path, body) => httpRequest('PATCH',  path, body),
  delete: (path)       => httpRequest('DELETE', path),
};

/* ── Auth endpoints ────────────────────────────────────────── */
const AuthApi = {
  login:    (data) => http.post('/auth/login',    data),
  register: (data) => http.post('/auth/register', data),
};

/* ── Clientes endpoints ────────────────────────────────────── */
const ClienteApi = {
  listar:   ()         => http.get('/clientes'),
  buscar:   (id)       => http.get(`/clientes/${id}`),
  criar:    (data)     => http.post('/clientes', data),
  atualizar:(id, data) => http.put(`/clientes/${id}`, data),
  deletar:  (id)       => http.delete(`/clientes/${id}`),
};

/* ── Equipamentos endpoints ────────────────────────────────── */
const EquipamentoApi = {
  listar:    ()           => http.get('/equipamentos'),
  buscar:    (id)         => http.get(`/equipamentos/${id}`),
  porCliente:(clienteId)  => http.get(`/equipamentos/cliente/${clienteId}`),
  criar:     (data)       => http.post('/equipamentos', data),
  atualizar: (id, data)   => http.put(`/equipamentos/${id}`, data),
  deletar:   (id)         => http.delete(`/equipamentos/${id}`),
};

/* ── Técnicos endpoints ────────────────────────────────────── */
const TecnicoApi = {
  listar:    ()         => http.get('/tecnicos'),
  buscar:    (id)       => http.get(`/tecnicos/${id}`),
  criar:     (data)     => http.post('/tecnicos', data),
  atualizar: (id, data) => http.put(`/tecnicos/${id}`, data),
  deletar:   (id)       => http.delete(`/tecnicos/${id}`),
};

/* ── Ordens de Serviço endpoints ───────────────────────────── */
const OrdemApi = {
  listar:         (status)     => http.get('/ordensservico' + (status ? `?status=${status}` : '')),
  buscar:         (id)         => http.get(`/ordensservico/${id}`),
  dashboard:      ()           => http.get('/ordensservico/dashboard'),
  criar:          (data)       => http.post('/ordensservico', data),
  atualizar:      (id, data)   => http.put(`/ordensservico/${id}`, data),
  atualizarStatus:(id, data)   => http.patch(`/ordensservico/${id}/status`, data),
  deletar:        (id)         => http.delete(`/ordensservico/${id}`),
};
