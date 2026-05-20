import prisma from '../lib/prisma.js'
import { emitNotification } from '../services/socket.js'
import { parsePaginationParams, buildCursorArgs, formatPaginatedResponse } from '../utils/pagination.js'

export const getComments = async (req, res, next) => {
  try {
    const { id: postId } = req.params
    const { cursor, limit } = parsePaginationParams(req.query)
    const args = buildCursorArgs(cursor, limit)

    const comments = await prisma.comment.findMany({
      where: { postId },
      ...args,
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } },
      },
    })

    const { items, nextCursor, hasMore } = formatPaginatedResponse(comments, limit)
    return res.json({ success: true, data: { items, nextCursor, hasMore } })
  } catch (err) {
    next(err)
  }
}

export const createComment = async (req, res, next) => {
  try {
    const { id: postId } = req.params
    const { content } = req.body

    if (!content?.trim()) {
      return res.status(400).json({ success: false, error: 'Comment content is required' })
    }

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' })

    const comment = await prisma.comment.create({
      data: { content: content.trim(), authorId: req.user.id, postId },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } },
      },
    })

    // Notify post author (not self)
    if (post.authorId !== req.user.id) {
      const notification = await prisma.notification.create({
        data: { recipientId: post.authorId, actorId: req.user.id, type: 'COMMENT', postId, commentId: comment.id },
        include: { actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      })
      emitNotification(post.authorId, notification)
    }

    return res.status(201).json({ success: true, data: comment })
  } catch (err) {
    next(err)
  }
}

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' })
    if (comment.authorId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' })

    await prisma.comment.delete({ where: { id } })
    return res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}
