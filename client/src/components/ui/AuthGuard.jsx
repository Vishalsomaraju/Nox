import { Navigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'var(--bg-void)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <span
            className="font-display text-4xl gradient-text"
            style={{ letterSpacing: 4 }}
          >
            NOX
          </span>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default AuthGuard
