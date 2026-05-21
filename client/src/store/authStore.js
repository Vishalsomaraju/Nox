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

    const fetchMe = async (token) => {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      set({ user: getResponseData(res), accessToken: token, isLoading: false })
    }

    const attemptRefresh = async () => {
      try {
        const refreshRes = await api.post('/auth/refresh')
        const newToken = getResponseData(refreshRes)?.accessToken
        if (newToken) {
          localStorage.setItem('nox_token', newToken)
          await fetchMe(newToken)
        } else {
          throw new Error('No token returned')
        }
      } catch (err) {
        set({ user: null, accessToken: null, isLoading: false })
        localStorage.removeItem('nox_token')
      }
    }

    if (!storedToken) {
      await attemptRefresh()
      return
    }

    set({ accessToken: storedToken })

    try {
      await fetchMe(storedToken)
    } catch (err) {
      if (err?.response?.status === 401) {
        await attemptRefresh()
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
