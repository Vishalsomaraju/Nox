import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (list) => {
    const unread = list.filter((n) => !n.read).length
    set({ notifications: list, unreadCount: unread })
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    }))
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  markRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      const unread = updated.filter((n) => !n.read).length
      return { notifications: updated, unreadCount: unread }
    })
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },
}))

export default useNotificationStore
