import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Monitor, Wrench, ClipboardList,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Loader2
} from 'lucide-react'
import { ordemService } from '../services/api'
import useAuthStore from '../store/authStore'

// ─── Stat Card ───────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, onClick, loading }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red:    'bg-red-50 text-red-600',
  }
  return (
    <div
      onClick={onClick}
      className={`card flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        {loading
          ? <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mt-1" />
          : <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        }
      </div>
    </div>
  )
}

// ─── Status Bar ──────────────────────────────────────────────────────
function StatusBar({ label, valor, total, color }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0
  const colors = {
    blue:   'bg-blue-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    green:  'bg-green-500',
  }
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{valor} <span className="text-gray-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── OS Recente Row ──────────────────────────────────────────────────
function OSRow({ os }) {
  const statusClass = {
    Aberta:         'bg-blue-100 text-blue-700',
    EmAndamento:    'bg-yellow-100 text-yellow-700',
    AguardandoPeca: 'bg-orange-100 text-orange-700',
    Finalizada:     'bg-green-100 text-green-700',
  }
  const statusLabel = {
    Aberta: 'Aberta', EmAndamento: 'Em Andamento',
    AguardandoPeca: 'Aguard. Peça', Finalizada: 'Finalizada',
  }
  const prioridadeClass = {
    Alta: 'text-red-600', Media: 'text-yellow-600', Baixa: 'text-gray-400'
  }
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900 font-medium truncate max-w-[180px]">
        {os.nomeEquipamento}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[140px]">
        {os.nomeCliente}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{os.nomeTecnico}</td>
      <td className="px-4 py-3">
        <span className={`badge ${statusClass[os.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {statusLabel[os.status] ?? os.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold ${prioridadeClass[os.prioridade] ?? ''}`}>
          {os.prioridade}
        </span>
      </td>
    </tr>
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [ordensRecentes, setOrdensRecentes] = useState([])
  const [loading, setLoading] = useState(true)
  const { usuario } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const carregar = async () => {
      try {
        const [dashRes, ordensRes] = await Promise.all([
          ordemService.dashboard(),
          ordemService.listar(),
        ])
        setStats(dashRes.data)
        // Últimas 5 ordens, mais recentes primeiro
        const ordenadas = [...ordensRes.data].sort(
          (a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura)
        )
        setOrdensRecentes(ordenadas.slice(0, 5))
      } catch {
        // silencioso — erros 401 são tratados pelo interceptor
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const totalOrdens = stats?.totalOrdens ?? 0
  const contagem = stats?.contagemPorStatus ?? {}

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {usuario?.nome?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Aqui está o resumo do sistema hoje.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Clientes"
          value={stats?.totalClientes}
          icon={Users}
          color="blue"
          loading={loading}
          onClick={() => navigate('/clientes')}
        />
        <StatCard
          title="Equipamentos"
          value={stats?.totalEquipamentos}
          icon={Monitor}
          color="purple"
          loading={loading}
          onClick={() => navigate('/equipamentos')}
        />
        <StatCard
          title="Técnicos"
          value={stats?.totalTecnicos}
          icon={Wrench}
          color="yellow"
          loading={loading}
          onClick={() => navigate('/tecnicos')}
        />
        <StatCard
          title="Ordens de Serviço"
          value={stats?.totalOrdens}
          icon={ClipboardList}
          color="green"
          loading={loading}
          onClick={() => navigate('/ordens-servico')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Ordens por Status */}
        <div className="card lg:col-span-1">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Ordens por Status
          </h2>
          {loading
            ? <div className="space-y-4">{[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
              ))}</div>
            : <div className="space-y-4">
                <StatusBar label="Abertas"        valor={contagem.Aberta ?? 0}         total={totalOrdens} color="blue" />
                <StatusBar label="Em Andamento"   valor={contagem.EmAndamento ?? 0}    total={totalOrdens} color="yellow" />
                <StatusBar label="Aguard. Peça"   valor={contagem.AguardandoPeca ?? 0} total={totalOrdens} color="orange" />
                <StatusBar label="Finalizadas"    valor={contagem.Finalizada ?? 0}     total={totalOrdens} color="green" />
              </div>
          }
        </div>

        {/* Alertas */}
        <div className="card lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Indicadores
          </h2>
          {loading
            ? <div className="space-y-3">{[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}</div>
            : <div className="space-y-3">

                {/* Alta prioridade */}
                <div className={`flex items-center gap-3 p-4 rounded-lg ${
                  stats?.ordensAlta > 0 ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
                }`}>
                  <AlertTriangle size={20} className={stats?.ordensAlta > 0 ? 'text-red-500' : 'text-gray-300'} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {stats?.ordensAlta > 0
                        ? `${stats.ordensAlta} ordem(ns) de alta prioridade em aberto`
                        : 'Nenhuma ordem de alta prioridade em aberto'}
                    </p>
                    <p className="text-xs text-gray-500">Requer atenção imediata</p>
                  </div>
                </div>

                {/* Finalizadas */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                  <CheckCircle size={20} className="text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {contagem.Finalizada ?? 0} ordens finalizadas
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalOrdens > 0
                        ? `${Math.round(((contagem.Finalizada ?? 0) / totalOrdens) * 100)}% do total`
                        : 'Sem dados ainda'}
                    </p>
                  </div>
                </div>

                {/* Em andamento */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                  <Clock size={20} className="text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {(contagem.EmAndamento ?? 0) + (contagem.AguardandoPeca ?? 0)} ordens em progresso
                    </p>
                    <p className="text-xs text-gray-500">Em andamento ou aguardando peça</p>
                  </div>
                </div>
              </div>
          }
        </div>
      </div>

      {/* Ordens Recentes */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            Ordens Recentes
          </h2>
          <button
            onClick={() => navigate('/ordens-servico')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todas →
          </button>
        </div>

        {loading
          ? <div className="space-y-3">{[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}</div>
          : ordensRecentes.length === 0
            ? <p className="text-center text-gray-400 py-8 text-sm">Nenhuma ordem cadastrada ainda.</p>
            : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Equipamento</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Técnico</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prioridade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ordensRecentes.map((os) => <OSRow key={os.id} os={os} />)}
                  </tbody>
                </table>
              </div>
        }
      </div>
    </div>
  )
}
