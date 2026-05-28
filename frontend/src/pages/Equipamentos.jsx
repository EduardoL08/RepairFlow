import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { equipamentoService, clienteService } from '../services/api'
import useAuthStore from '../store/authStore'
import { PageHeader, LoadingSpinner, EmptyState, Modal, ConfirmModal } from '../components/ui'

const schema = z.object({
  nome:        z.string().min(2, 'Nome obrigatório'),
  marca:       z.string().min(1, 'Marca obrigatória'),
  modelo:      z.string().min(1, 'Modelo obrigatório'),
  numeroSerie: z.string().min(1, 'Número de série obrigatório'),
  clienteId:   z.string().min(1, 'Selecione um cliente'),
  categoria:   z.string().min(1, 'Categoria obrigatória'),
})

const categorias = [
  'Computador', 'Notebook', 'Smartphone', 'Tablet',
  'Impressora', 'TV', 'Console', 'Outro',
]

function FormEquipamento({ onSubmit, defaultValues, isSubmitting, clientes }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const field = (name, label, placeholder) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...register(name)} placeholder={placeholder}
        className={`input-field ${errors[name] ? 'input-error' : ''}`} />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {field('nome',        'Nome do Equipamento', 'Ex: Notebook Dell')}
        {field('marca',       'Marca',               'Ex: Dell')}
        {field('modelo',      'Modelo',              'Ex: Inspiron 15')}
        {field('numeroSerie', 'Número de Série',     'Ex: ABC123')}
      </div>

      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
        <select {...register('clienteId')}
          className={`input-field ${errors.clienteId ? 'input-error' : ''}`}>
          <option value="">Selecione um cliente...</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nome} — {c.cpf}</option>
          ))}
        </select>
        {errors.clienteId && <p className="text-red-500 text-xs mt-1">{errors.clienteId.message}</p>}
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select {...register('categoria')}
          className={`input-field ${errors.categoria ? 'input-error' : ''}`}>
          <option value="">Selecione...</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Salvar
        </button>
      </div>
    </form>
  )
}

export default function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deletando, setDeletando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const { isAdmin } = useAuthStore()

  const carregar = async () => {
    try {
      const [eqRes, cliRes] = await Promise.all([
        equipamentoService.listar(),
        clienteService.listar(),
      ])
      setEquipamentos(eqRes.data)
      setClientes(cliRes.data)
    } catch {
      toast.error('Erro ao carregar equipamentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const filtrados = equipamentos.filter(e =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    e.marca.toLowerCase().includes(busca.toLowerCase()) ||
    e.nomeCliente?.toLowerCase().includes(busca.toLowerCase()) ||
    e.numeroSerie.toLowerCase().includes(busca.toLowerCase())
  )

  const abrirCriar = () => { setEditando(null); setModalAberto(true) }
  const abrirEditar = (e) => { setEditando(e); setModalAberto(true) }
  const fecharModal = () => { setModalAberto(false); setEditando(null) }

  const salvar = async (data) => {
    setSalvando(true)
    try {
      if (editando) {
        await equipamentoService.atualizar(editando.id, data)
        toast.success('Equipamento atualizado!')
      } else {
        await equipamentoService.criar(data)
        toast.success('Equipamento cadastrado!')
      }
      fecharModal()
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  const deletar = async () => {
    setDeletando(true)
    try {
      await equipamentoService.deletar(confirmDelete.id)
      toast.success('Equipamento removido.')
      setConfirmDelete(null)
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erro ao remover.')
    } finally {
      setDeletando(false)
    }
  }

  if (loading) return <LoadingSpinner message="Carregando equipamentos..." />

  return (
    <div>
      <PageHeader
        title="Equipamentos"
        description={`${equipamentos.length} equipamento(s) cadastrado(s)`}
        action={
          <button onClick={abrirCriar} className="btn-primary">
            <Plus size={16} /> Novo Equipamento
          </button>
        }
      />

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, marca, cliente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {filtrados.length === 0
        ? <EmptyState
            title="Nenhum equipamento encontrado"
            description="Cadastre um novo equipamento para começar."
            action={<button onClick={abrirCriar} className="btn-primary"><Plus size={16} />Novo Equipamento</button>}
          />
        : <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Equipamento', 'Marca / Modelo', 'Nº Série', 'Cliente', 'Categoria', 'Entrada', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(eq => (
                  <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{eq.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{eq.marca} / {eq.modelo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">{eq.numeroSerie}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{eq.nomeCliente}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-gray-100 text-gray-600">{eq.categoria}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(eq.dataEntrada).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => abrirEditar(eq)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        {isAdmin() && (
                          <button onClick={() => setConfirmDelete(eq)}
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

      <Modal isOpen={modalAberto} onClose={fecharModal} size="lg"
        title={editando ? 'Editar Equipamento' : 'Novo Equipamento'}>
        <FormEquipamento
          onSubmit={salvar}
          defaultValues={editando}
          isSubmitting={salvando}
          clientes={clientes}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Remover equipamento"
        message={`Tem certeza que deseja remover "${confirmDelete?.nome}"?`}
        onConfirm={deletar}
        onCancel={() => setConfirmDelete(null)}
        loading={deletando}
      />
    </div>
  )
}
