import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../services/api'
import useAuthStore from '../store/authStore'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

export default function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const onSubmit = async (data) => {
    try {
      const res = await authService.login(data)
      login(res.data)
      toast.success(`Bem-vindo, ${res.data.nome}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Credenciais inválidas.'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700
                    flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl
                          flex items-center justify-center mb-4 ring-1 ring-white/20">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">RepairFlow</h1>
          <p className="text-primary-200 text-sm mt-1">Assistência Técnica</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-900 text-xl font-semibold mb-6">Entrar na plataforma</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  {...register('senha')}
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input-field pr-10 ${errors.senha ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                             hover:text-gray-600 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.senha && (
                <p className="text-red-500 text-xs mt-1">{errors.senha.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {isSubmitting
                ? <><Loader2 size={16} className="animate-spin" /> Entrando...</>
                : 'Entrar'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-primary-300 text-xs mt-6">
          RepairFlow © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
