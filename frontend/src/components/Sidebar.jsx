import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Monitor,
  Wrench,
  ClipboardList,
  LogOut,
  Zap,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/clientes',        label: 'Clientes',        icon: Users },
  { to: '/equipamentos',    label: 'Equipamentos',    icon: Monitor },
  { to: '/tecnicos',        label: 'Técnicos',        icon: Wrench },
  { to: '/ordens-servico',  label: 'Ordens de Serviço', icon: ClipboardList },
]

export default function Sidebar() {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Sessão encerrada.')
    navigate('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-primary-900 flex flex-col z-30">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-700">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          RepairFlow
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-primary-700">
        <div className="mb-3 px-2">
          <p className="text-white text-sm font-medium truncate">{usuario?.nome}</p>
          <p className="text-primary-300 text-xs truncate">{usuario?.email}</p>
          <span className="mt-1 inline-block badge bg-primary-700 text-primary-200 capitalize">
            {usuario?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-200
                     hover:bg-primary-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}