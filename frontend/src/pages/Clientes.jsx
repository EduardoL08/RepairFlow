import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { clienteService } from '../services/api'
import useAuthStore from '../store/authStore'
import { PageHeader, LoadingSpinner, EmptyState, Modal, ConfirmModal } from '../components/ui'

const schema = z.object({
  nome:     z.string().min(3, 'Mínimo 3 caracteres'),
  cpf:      z.string().min(11, 'CPF inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email:    z.string().email('E-mail inválido'),
  endereco: z.string().min(5, 'Endereço obrigatório'),
})

function FormCliente({ onSubmit, defaultValues, isSubmitting }) {
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
      {field('nome',     'Nome',     'João Silva')}
      {field('cpf',      'CPF',      '000.000.000-00')}
      {field('telefone', 'Telefone', '(11) 99999-9999')}
      {field('email',    'E-mail',   'joao@email.com', 'email')}
      {field('endereco', 'Endereço', 'Rua das Flores, 123')}
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Salvar
        </button>
      </div>
    </form>
  )
}

export default function Clientes() {
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
      const res = await clienteService.listar()
      setClientes(res.data)
    } catch {
      toast.error('Erro ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.email.toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf.includes(busca)
  )

  const abrirCriar = () => { setEditando(null); setModalAberto(true) }
  const abrirEditar = (c) => { setEditando(c); setModalAberto(true) }
  const fecharModal = () => { setModalAberto(false); setEditando(null) }

  const salvar = async (data) => {
    setSalvando(true)
    try {
      if (editando) {
        await clienteService.atualizar(editando.id, data)
        toast.success('Cliente atualizado!')
      } else {
        await clienteService.criar(data)
        toast.success('Cliente cadastrado!')
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
      await clienteService.deletar(confirmDelete.id)
      toast.success('Cliente removido.')
      setConfirmDelete(null)
      carregar()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erro ao remover.')
    } finally {
      setDeletando(false)
    }
  }

  if (loading) return <LoadingSpinner message="Carregando clientes..." />

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${clientes.length} cliente(s) cadastrado(s)`}
        action={
          <button onClick={abrirCriar} className="btn-primary">
            <Plus size={16} /> Novo Cliente
          </button>
        }
      />

      {/* Busca */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou CPF..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="input-field pr-9"
        />
      </div>

      {/* Tabela */}
      {filtrados.length === 0
        ? <EmptyState title="Nenhum cliente encontrado"
            description="Tente outro termo ou cadastre um novo cliente."
            action={<button onClick={abrirCriar} className="btn-primary"><Plus size={16}/>Novo Cliente</button>}
          />
        : <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Nome', 'CPF', 'Telefone', 'E-mail', 'Cadastro', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.cpf}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.telefone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(c.dataCadastro).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => abrirEditar(c)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        {isAdmin() && (
                          <button onClick={() => setConfirmDelete(c)}
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

      <Modal isOpen={modalAberto} onClose={fecharModal}
        title={editando ? 'Editar Cliente' : 'Novo Cliente'}>
        <FormCliente onSubmit={salvar} defaultValues={editando} isSubmitting={salvando} />
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Remover cliente"
        message={`Tem certeza que deseja remover "${confirmDelete?.nome}"?`}
        onConfirm={deletar}
        onCancel={() => setConfirmDelete(null)}
        loading={deletando}
      />
    </div>
  )
}
