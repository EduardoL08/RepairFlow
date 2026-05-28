import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Search, Loader2, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { tecnicoService } from '../services/api'
import useAuthStore from '../store/authStore'
import { PageHeader, LoadingSpinner, EmptyState, Modal, ConfirmModal } from '../components/ui'

const schema = z.object({
  nome:          z.string().min(3, 'Mínimo 3 caracteres'),
  especialidade: z.string().min(2, 'Especialidade obrigatória'),
  telefone:      z.string().min(10, 'Telefone inválido'),
  email:         z.string().email('E-mail inválido'),
})

const especialidades = [
  'Eletrônica Geral', 'Smartphones', 'Computadores', 'Notebooks',
  'Impressoras', 'TVs e Monitores', 'Consoles', 'Eletrodomésticos', 'Outro',
]

function FormTecnico({ onSubmit, defaultValues, isSubmitting }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const field = (name, label, placeholder, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...register(name)} type={type} placeholder={placeholder}
        className={`input-field ${errors[name] ? 'input-error' : ''}`} />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {field('nome',  'Nome',     'Carlos Silva')}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
        <select {...register('especialidade')}
          className={`input-field ${errors.especialidade ? 'input-error' : ''}`}>
          <option value="">Selecione...</option>
          {especialidades.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        {errors.especialidade && (
          <p className="text-red-500 text-xs mt-1">{errors.especialidade.message}</p>
        )}
      </div>
      {field('telefone', 'Telefone', '(11) 99999-9999')}
      {field('email',    'E-mail',   'carlos@email.com', 'email')}
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Salvar
        </button>
      </div>
    </form>
  )
}

export default function Tecnicos() {
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deletando, setDeletando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const { isAdmin } = useAuthStore()
  const admin = isAdmin()

  const carregar = async () => {
    try {
      const res = await tecnicoService.listar()
      setTecnicos(res.data)
    } catch {
      toast.error('Erro ao carregar técnicos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const filtrados = tecnicos.filter(t =>
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    t.especialidade.toLowerCase().includes(busca.toLowerCase()) ||
    t.email.toLowerCase().includes(busca.toLowerCase())
  )

  const abrirCriar = () => { setEditando(null); setModalAberto(true) }
  const abrirEditar = (t) => { setEditando(t); setModalAberto(true) }
  const fecharModal = () => { setModalAberto(false); setEditando(null) }

  const salvar = async (data) => {
    setSalvando(true)
    try {
      if (editando) {
        await tecnicoService.atualizar(editando.id, data)
        toast.success('Técnico atualizado!')
      } else {
        await tecnicoService.criar(data)
        toast.success('Técnico cadastrado!')
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
      await tecnicoService.deletar(confirmDelete.id)
      toast.success('Técnico removido.')
      setConfirmDelete(null)
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erro ao remover.')
    } finally {
      setDeletando(false)
    }
  }

  if (loading) return <LoadingSpinner message="Carregando técnicos..." />

  return (
    <div>
      <PageHeader
        title="Técnicos"
        description={`${tecnicos.length} técnico(s) cadastrado(s)`}
        action={
          admin
            ? <button onClick={abrirCriar} className="btn-primary">
                <Plus size={16} /> Novo Técnico
              </button>
            : null
        }
      />

      {/* Aviso para usuários sem permissão */}
      {!admin && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200
                        rounded-lg text-sm text-yellow-700 mb-6">
          <ShieldAlert size={16} />
          Apenas administradores podem cadastrar e editar técnicos.
        </div>
      )}

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou especialidade..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="input-field pr-9"
        />
      </div>

      {filtrados.length === 0
        ? <EmptyState
            title="Nenhum técnico encontrado"
            description={admin ? 'Cadastre um técnico para começar.' : 'Nenhum técnico cadastrado ainda.'}
            action={admin
              ? <button onClick={abrirCriar} className="btn-primary"><Plus size={16} />Novo Técnico</button>
              : null
            }
          />
        : <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Nome', 'Especialidade', 'Telefone', 'E-mail', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.nome}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-blue-50 text-blue-700">{t.especialidade}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.telefone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{t.email}</td>
                    <td className="px-4 py-3">
                      {admin && (
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => abrirEditar(t)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setConfirmDelete(t)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }

      {admin && (
        <>
          <Modal isOpen={modalAberto} onClose={fecharModal}
            title={editando ? 'Editar Técnico' : 'Novo Técnico'}>
            <FormTecnico onSubmit={salvar} defaultValues={editando} isSubmitting={salvando} />
          </Modal>

          <ConfirmModal
            isOpen={!!confirmDelete}
            title="Remover técnico"
            message={`Tem certeza que deseja remover "${confirmDelete?.nome}"?`}
            onConfirm={deletar}
            onCancel={() => setConfirmDelete(null)}
            loading={deletando}
          />
        </>
      )}
    </div>
  )
}
