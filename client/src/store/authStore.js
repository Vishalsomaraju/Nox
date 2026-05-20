import { create } from 'zustand'
import { api, getResponseData } from '@/services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: (user, accessToken) => {
    set({ user, accessToken, isLoading: false })
    if (accessToken) {
      localStorage.setItem('nox_token', accessToken)
    }
  },

  clearAuth: () => {
    set({ user: null, accessToken: null, isLoading: false })
    localStorage.removeItem('nox_token')
  },

  setLoading: (isLoading) => set({ isLoading }),

  initialize: async () => {
    const storedToken = localStorage.getItem('nox_token')
    if (!storedToken) {
      set({ isLoading: false })
      return
    }

    set({ accessToken: storedToken })

    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      set({ user: getResponseData(res), accessToken: storedToken, isLoading: false })
    } catch (err) {
      if (err?.response?.status === 401) {
        // Try refresh
        try {
          const refreshRes = await api.post('/auth/refresh')
          const newToken = getResponseData(refreshRes)?.accessToken
          localStorage.setItem('nox_token', newToken)
          const meRes = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${newToken}` },
          })
          set({ user: getResponseData(meRes), accessToken: newToken, isLoading: false })
        } catch {
          set({ user: null, accessToken: null, isLoading: false })
          localStorage.removeItem('nox_token')
        }
      } else {
        set({ user: null, accessToken: null, isLoading: false })
        localStorage.removeItem('nox_token')
      }
    }
  },

  updateUser: (updates) => {
    set((state) => ({ user: state.user ? { ...state.user, ...updates } : null }))
  },
}))

export default useAuthStore
