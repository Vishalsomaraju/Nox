import prisma from '../lib/prisma.js'
import { parsePaginationParams, buildCursorArgs, formatPaginatedResponse } from '../utils/pagination.js'

export const getNotifications = async (req, res, next) => {
  try {
    const { cursor, limit } = parsePaginationParams(req.query)
    const args = buildCursorArgs(cursor, limit)

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId: req.user.id },
        ...args,
        include: {
          actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      }),
      prisma.notification.count({ where: { recipientId: req.user.id, read: false } }),
    ])

    const { items, nextCursor, hasMore } = formatPaginatedResponse(notifications, limit)
    return res.json({ success: true, data: { items, nextCursor, hasMore, unreadCount } })
  } catch (err) {
    next(err)
  }
}

export const markAllRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, read: false },
      data: { read: true },
    })
    return res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

export const markOneRead = async (req, res, next) => {
  try {
    const { id } = req.params
    const notif = await prisma.notification.findUnique({ where: { id } })
    if (!notif) return res.status(404).json({ success: false, error: 'Notification not found' })
    if (notif.recipientId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' })

    await prisma.notification.update({ where: { id }, data: { read: true } })
    return res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}
