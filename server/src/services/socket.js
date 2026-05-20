/**
 * Socket.io setup and helpers
 */

let ioInstance = null

export const initSocket = (io) => {
  ioInstance = io

  io.on('connection', (socket) => {
    socket.on('authenticate', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`)
      }
    })

    socket.on('disconnect', () => {
      // Rooms are cleaned up automatically
    })
  })
}

/**
 * Emit a notification to a specific user's room.
 */
export const emitNotification = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification:new', notification)
  }
}
