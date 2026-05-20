import useAuthStore from '@/store/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const isLoading = useAuthStore((s) => s.isLoading)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const updateUser = useAuthStore((s) => s.updateUser)

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    setAuth,
    clearAuth,
    updateUser,
  }
}

export default useAuth
