import { io } from 'socket.io-client'

let socket = null

export const initSocket = (accessToken) => {
  if (socket?.connected) {
    return socket
  }

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    auth: {
      token: accessToken,
    },
  })

  socket.on('connect', () => {
    console.log('[NOX Socket] Connected:', socket.id)
    if (accessToken) {
      socket.emit('authenticate', { token: accessToken })
    }
  })

  socket.on('disconnect', (reason) => {
    console.log('[NOX Socket] Disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.warn('[NOX Socket] Connection error:', err.message)
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export { socket }
