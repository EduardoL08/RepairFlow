import { Loader2, Inbox, AlertTriangle, X } from 'lucide-react'

// ─── Loading Spinner ─────────────────────────────────────────────────
export function LoadingSpinner({ message = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={32} className="animate-spin text-primary-500" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────
export function EmptyState({ title = 'Nenhum item encontrado', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Inbox size={40} className="text-gray-300" />
      <p className="text-gray-600 font-medium">{title}</p>
      {description && <p className="text-gray-400 text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

// ─── Page Header ─────────────────────────────────────────────────────
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── Confirm Modal ───────────────────────────────────────────────────
export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-danger" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Base ──────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Badge de Status OS ──────────────────────────────────────────────
const statusConfig = {
  Aberta:         { label: 'Aberta',           class: 'bg-blue-100 text-blue-700' },
  EmAndamento:    { label: 'Em Andamento',      class: 'bg-yellow-100 text-yellow-700' },
  AguardandoPeca: { label: 'Aguardando Peça',   class: 'bg-orange-100 text-orange-700' },
  Finalizada:     { label: 'Finalizada',        class: 'bg-green-100 text-green-700' },
}

const prioridadeConfig = {
  Baixa: { label: 'Baixa', class: 'bg-gray-100 text-gray-600' },
  Media: { label: 'Média', class: 'bg-blue-100 text-blue-600' },
  Alta:  { label: 'Alta',  class: 'bg-red-100 text-red-600' },
}

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? { label: status, class: 'bg-gray-100 text-gray-600' }
  return <span className={`badge ${cfg.class}`}>{cfg.label}</span>
}

export function PrioridadeBadge({ prioridade }) {
  const cfg = prioridadeConfig[prioridade] ?? { label: prioridade, class: 'bg-gray-100 text-gray-600' }
  return <span className={`badge ${cfg.class}`}>{cfg.label}</span>
}
