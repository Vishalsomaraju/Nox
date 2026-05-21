import axios from 'axios'
import useAuthStore from '@/store/authStore'

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '') + '/api',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getResponseData = (response) => response?.data?.data ?? response?.data

export const getApiErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.error || error?.response?.data?.message || fallback

// Request interceptor: attach Authorization header
api.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith('/api')) {
      config.url = config.url.replace(/^\/api(?=\/|$)/, '')
    }
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor: handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Skip interceptor for login and refresh to prevent deadlock
    if (!originalRequest || originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await api.post('/auth/refresh')
        const newToken = getResponseData(res)?.accessToken
        useAuthStore.getState().setAuth(useAuthStore.getState().user, newToken)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
