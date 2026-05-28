import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request Interceptor — injeta token JWT em toda requisição ───────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — trata 401 globalmente ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// ─── Clientes ────────────────────────────────────────────────────────
export const clienteService = {
  listar: () => api.get('/clientes'),
  buscarPorId: (id) => api.get(`/clientes/${id}`),
  criar: (data) => api.post('/clientes', data),
  atualizar: (id, data) => api.put(`/clientes/${id}`, data),
  deletar: (id) => api.delete(`/clientes/${id}`),
}

// ─── Equipamentos ────────────────────────────────────────────────────
export const equipamentoService = {
  listar: () => api.get('/equipamentos'),
  buscarPorId: (id) => api.get(`/equipamentos/${id}`),
  buscarPorCliente: (clienteId) => api.get(`/equipamentos/cliente/${clienteId}`),
  criar: (data) => api.post('/equipamentos', data),
  atualizar: (id, data) => api.put(`/equipamentos/${id}`, data),
  deletar: (id) => api.delete(`/equipamentos/${id}`),
}

// ─── Técnicos ────────────────────────────────────────────────────────
export const tecnicoService = {
  listar: () => api.get('/tecnicos'),
  buscarPorId: (id) => api.get(`/tecnicos/${id}`),
  criar: (data) => api.post('/tecnicos', data),
  atualizar: (id, data) => api.put(`/tecnicos/${id}`, data),
  deletar: (id) => api.delete(`/tecnicos/${id}`),
}

// ─── Ordens de Serviço ───────────────────────────────────────────────
export const ordemService = {
  listar: (status) => api.get('/ordensservico', { params: status ? { status } : {} }),
  buscarPorId: (id) => api.get(`/ordensservico/${id}`),
  dashboard: () => api.get('/ordensservico/dashboard'),
  criar: (data) => api.post('/ordensservico', data),
  atualizar: (id, data) => api.put(`/ordensservico/${id}`, data),
  atualizarStatus: (id, data) => api.patch(`/ordensservico/${id}/status`, data),
  deletar: (id) => api.delete(`/ordensservico/${id}`),
}

export default api
