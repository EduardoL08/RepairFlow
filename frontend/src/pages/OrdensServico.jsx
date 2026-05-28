import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Search, Loader2, RefreshCw, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { ordemService, equipamentoService, tecnicoService } from '../services/api'
import useAuthStore from '../store/authStore'
import {
  PageHeader, LoadingSpinner, EmptyState, Modal,
  ConfirmModal, StatusBadge, PrioridadeBadge
} from '../components/ui'

// ─── Schemas ────────────────────────────────────────────────────────
const schemaOrdem = z.object({
  equipamentoId:   z.string().min(1, 'Selecione um equipamento'),
  tecnicoId:       z.string().min(1, 'Selecione um técnico'),
  problemaRelatado:z.string().min(10, 'Descreva o problema com ao menos 10 caracteres'),
  valor:           z.coerce.number().min(0, 'Valor não pode ser negativo'),
  prioridade:      z.enum(['Baixa', 'Media', 'Alta']),
  diagnostico:     z.string().optional(),
  solucao:         z.string().optional(),
})

const schemaStatus = z.object({
  status:      z.enum(['Aberta', 'EmAndamento', 'AguardandoPeca', 'Finalizada']),
  diagnostico: z.string().optional(),
  solucao:     z.string().optional(),
  valor:       z.coerce.number().min(0).optional(),
})

const STATUS_OPTS = [
  { value: '',                label: 'Todos os status' },
  { value: 'Aberta',          label: 'Aberta' },
  { value: 'EmAndamento',     label: 'Em Andamento' },
  { value: 'AguardandoPeca',  label: 'Aguardando Peça' },
  { value: 'Finalizada',      label: 'Finalizada' },
]

const PRIORIDADE_OPTS = ['Baixa', 'Media', 'Alta']

// ─── Formulário de Criar / Editar OS ────────────────────────────────
function FormOrdem({ onSubmit, defaultValues, isSubmitting, equipamentos, tecnicos }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schemaOrdem),
    defaultValues: { prioridade: 'Media', valor: 0, ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Equipamento */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipamento</label>
          <select {...register('equipamentoId')}
            className={`input-field ${errors.equipamentoId ? 'input-error' : ''}`}>
            <option value="">Selecione um equipamento...</option>
            {equipamentos.map(e => (
              <option key={e.id} value={e.id}>
                {e.nome} — {e.marca} ({e.nomeCliente})
              </option>
            ))}
          </select>
          {errors.equipamentoId && <p className="text-red-500 text-xs mt-1">{errors.equipamentoId.message}</p>}
        </div>

        {/* Técnico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
          <select {...register('tecnicoId')}
            className={`input-field ${errors.tecnicoId ? 'input-error' : ''}`}>
            <option value="">Selecione...</option>
            {tecnicos.map(t => (
              <option key={t.id} value={t.id}>{t.nome} — {t.especialidade}</option>
            ))}
          </select>
          {errors.tecnicoId && <p className="text-red-500 text-xs mt-1">{errors.tecnicoId.message}</p>}
        </div>

        {/* Prioridade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
          <select {...register('prioridade')} className="input-field">
            {PRIORIDADE_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Problema */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Problema Relatado</label>
        <textarea {...register('problemaRelatado')} rows={3}
          placeholder="Descreva o problema relatado pelo cliente..."
          className={`input-field resize-none ${errors.problemaRelatado ? 'input-error' : ''}`} />
        {errors.problemaRelatado && <p className="text-red-500 text-xs mt-1">{errors.problemaRelatado.message}</p>}
      </div>

      {/* Diagnóstico */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diagnóstico <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea {...register('diagnostico')} rows={2}
          placeholder="Diagnóstico técnico..."
          className="input-field resize-none" />
      </div>

      {/* Valor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
        <input {...register('valor')} type="number" step="0.01" min="0"
          className={`input-field ${errors.valor ? 'input-error' : ''}`} />
        {errors.valor && <p className="text-red-500 text-xs mt-1">{errors.valor.message}</p>}
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Salvar
        </button>
      </div>
    </form>
  )
}

// ─── Modal de Atualizar Status ───────────────────────────────────────
function ModalStatus({ isOpen, onClose, ordem, onSalvar, salvando }) {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(schemaStatus),
    defaultValues: {
      status: ordem?.status ?? 'Aberta',
      diagnostico: ordem?.diagnostico ?? '',
      solucao: ordem?.solucao ?? '',
      valor: ordem?.valor ?? 0,
    },
  })

  useEffect(() => {
    if (ordem) reset({
      status: ordem.status,
      diagnostico: ordem.diagnostico ?? '',
      solucao: ordem.solucao ?? '',
      valor: ordem.valor ?? 0,
    })
  }, [ordem, reset])

  const statusAtual = watch('status')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atualizar Status da OS">
      <form onSubmit={handleSubmit(onSalvar)} className="space-y-4">

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Novo Status</label>
          <div className="grid grid-cols-2 gap-2">
            {['Aberta', 'EmAndamento', 'AguardandoPeca', 'Finalizada'].map(s => {
              const labels = {
                Aberta: 'Aberta', EmAndamento: 'Em Andamento',
                AguardandoPeca: 'Aguard. Peça', Finalizada: 'Finalizada'
              }
              const colors = {
                Aberta: 'border-blue-400 bg-blue-50 text-blue-700',
                EmAndamento: 'border-yellow-400 bg-yellow-50 text-yellow-700',
                AguardandoPeca: 'border-orange-400 bg-orange-50 text-orange-700',
                Finalizada: 'border-green-400 bg-green-50 text-green-700',
              }
              const inactive = 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              return (
                <label key={s}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer
                              transition-all text-sm font-medium
                              ${statusAtual === s ? colors[s] : inactive}`}>
                  <input {...register('status')} type="radio" value={s} className="sr-only" />
                  {labels[s]}
                </label>
              )
            })}
          </div>
        </div>

        {/* Diagnóstico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
          <textarea {...register('diagnostico')} rows={2}
            className="input-field resize-none"
            placeholder="Diagnóstico técnico..." />
        </div>

        {/* Solução */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Solução</label>
          <textarea {...register('solucao')} rows={2}
            className="input-field resize-none"
            placeholder="Solução aplicada..." />
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
          <input {...register('valor')} type="number" step="0.01" min="0"
            className="input-field" />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando && <Loader2 size={16} className="animate-spin" />}
            <RefreshCw size={15} />
            Atualizar Status
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Página Principal ────────────────────────────────────────────────
export default function OrdensServico() {
  const [ordens, setOrdens] = useState([])
  const [equipamentos, setEquipamentos] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [modalOrdem, setModalOrdem] = useState(false)
  const [modalStatus, setModalStatus] = useState(false)
  const [editando, setEditando] = useState(null)
  const [ordemStatus, setOrdemStatus] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deletando, setDeletando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [salvandoStatus, setSalvandoStatus] = useState(false)
  const { isAdmin } = useAuthStore()

  const carregar = async () => {
    try {
      const [ordRes, eqRes, tecRes] = await Promise.all([
        ordemService.listar(filtroStatus || undefined),
        equipamentoService.listar(),
        tecnicoService.listar(),
      ])
      setOrdens(ordRes.data)
      setEquipamentos(eqRes.data)
      setTecnicos(tecRes.data)
    } catch {
      toast.error('Erro ao carregar ordens.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [filtroStatus])

  const filtradas = ordens.filter(o =>
    o.nomeEquipamento?.toLowerCase().includes(busca.toLowerCase()) ||
    o.nomeCliente?.toLowerCase().includes(busca.toLowerCase()) ||
    o.nomeTecnico?.toLowerCase().includes(busca.toLowerCase()) ||
    o.problemaRelatado?.toLowerCase().includes(busca.toLowerCase())
  )

  const abrirCriar = () => { setEditando(null); setModalOrdem(true) }
  const abrirEditar = (o) => { setEditando(o); setModalOrdem(true) }
  const abrirStatus = (o) => { setOrdemStatus(o); setModalStatus(true) }
  const fecharModalOrdem = () => { setModalOrdem(false); setEditando(null) }
  const fecharModalStatus = () => { setModalStatus(false); setOrdemStatus(null) }

  const salvar = async (data) => {
    setSalvando(true)
    try {
      if (editando) {
        await ordemService.atualizar(editando.id, data)
        toast.success('Ordem atualizada!')
      } else {
        await ordemService.criar(data)
        toast.success('Ordem criada!')
      }
      fecharModalOrdem()
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  const salvarStatus = async (data) => {
    setSalvandoStatus(true)
    try {
      await ordemService.atualizarStatus(ordemStatus.id, data)
      toast.success('Status atualizado!')
      fecharModalStatus()
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erro ao atualizar status.')
    } finally {
      setSalvandoStatus(false)
    }
  }

  const deletar = async () => {
    setDeletando(true)
    try {
      await ordemService.deletar(confirmDelete.id)
      toast.success('Ordem removida.')
      setConfirmDelete(null)
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erro ao remover.')
    } finally {
      setDeletando(false)
    }
  }

  if (loading) return <LoadingSpinner message="Carregando ordens de serviço..." />

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description={`${ordens.length} ordem(ns) encontrada(s)`}
        action={
          <button onClick={abrirCriar} className="btn-primary">
            <Plus size={16} /> Nova Ordem
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por equipamento, cliente..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="input-field pr-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="input-field w-auto"
          >
            {STATUS_OPTS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filtradas.length === 0
        ? <EmptyState
            title="Nenhuma ordem encontrada"
            description="Crie uma nova ordem de serviço para começar."
            action={<button onClick={abrirCriar} className="btn-primary"><Plus size={16} />Nova Ordem</button>}
          />
        : <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Equipamento', 'Cliente', 'Técnico', 'Problema', 'Status', 'Prioridade', 'Abertura', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[140px] truncate">
                      {o.nomeEquipamento}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                      {o.nomeCliente}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                      {o.nomeTecnico}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate">
                      {o.problemaRelatado}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PrioridadeBadge prioridade={o.prioridade} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(o.dataAbertura).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => abrirStatus(o)}
                          title="Atualizar status"
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                          <RefreshCw size={15} />
                        </button>
                        <button onClick={() => abrirEditar(o)}
                          title="Editar"
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        {isAdmin() && (
                          <button onClick={() => setConfirmDelete(o)}
                            title="Remover"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }

      {/* Modal criar/editar OS */}
      <Modal isOpen={modalOrdem} onClose={fecharModalOrdem} size="lg"
        title={editando ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}>
        <FormOrdem
          onSubmit={salvar}
          defaultValues={editando}
          isSubmitting={salvando}
          equipamentos={equipamentos}
          tecnicos={tecnicos}
        />
      </Modal>

      {/* Modal atualizar status */}
      <ModalStatus
        isOpen={modalStatus}
        onClose={fecharModalStatus}
        ordem={ordemStatus}
        onSalvar={salvarStatus}
        salvando={salvandoStatus}
      />

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Remover ordem"
        message={`Tem certeza que deseja remover a OS de "${confirmDelete?.nomeEquipamento}"?`}
        onConfirm={deletar}
        onCancel={() => setConfirmDelete(null)}
        loading={deletando}
      />
    </div>
  )
}
