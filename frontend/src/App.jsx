import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Lazy imports — navegação assíncrona (sem reload de página)
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from './components/ui'

const Clientes      = lazy(() => import('./pages/Clientes'))
const Equipamentos  = lazy(() => import('./pages/Equipamentos'))
const Tecnicos      = lazy(() => import('./pages/Tecnicos'))
const OrdensServico = lazy(() => import('./pages/OrdensServico'))

export default function App() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Lazy routes — carregam apenas quando acessadas */}
          <Route
            path="/clientes"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Clientes />
              </Suspense>
            }
          />
          <Route
            path="/equipamentos"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Equipamentos />
              </Suspense>
            }
          />
          <Route
            path="/tecnicos"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Tecnicos />
              </Suspense>
            }
          />
          <Route
            path="/ordens-servico"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <OrdensServico />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* Redireciona raiz para dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
