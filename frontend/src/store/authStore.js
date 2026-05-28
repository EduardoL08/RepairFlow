import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,

      login: (authResponse) => {
        set({
          token: authResponse.token,
          usuario: {
            nome: authResponse.nome,
            email: authResponse.email,
            role: authResponse.role,
            expiracao: authResponse.expiracao,
          },
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({ token: null, usuario: null, isAuthenticated: false })
      },

      isAdmin: () => get().usuario?.role === 'admin',

      isTokenValido: () => {
        const expiracao = get().usuario?.expiracao
        if (!expiracao) return false
        return new Date(expiracao) > new Date()
      },
    }),
    {
      name: 'repairflow-auth',
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore