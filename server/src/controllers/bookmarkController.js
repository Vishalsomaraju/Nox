import prisma from '../lib/prisma.js'
import { parsePaginationParams, buildCursorArgs, formatPaginatedResponse } from '../utils/pagination.js'

export const getBookmarks = async (req, res, next) => {
  try {
    const { cursor, limit } = parsePaginationParams(req.query)
    const args = buildCursorArgs(cursor, limit)

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      ...args,
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } },
            _count: { select: { likes: true, comments: true } },
            likes: { where: { userId: req.user.id }, select: { id: true } },
            bookmarks: { where: { userId: req.user.id }, select: { id: true } },
          },
        },
      },
    })

    const { items, nextCursor, hasMore } = formatPaginatedResponse(bookmarks, limit)
    const posts = items.map(b => ({
      ...b.post,
      isLiked: b.post.likes?.length > 0,
      isBookmarked: true,
      likes: undefined,
      bookmarks: undefined,
    }))

    return res.json({ success: true, data: { items: posts, nextCursor, hasMore } })
  } catch (err) {
    next(err)
  }
}

export const bookmarkPost = async (req, res, next) => {
  try {
    const { postId } = req.params
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } })
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' })

    await prisma.bookmark.upsert({
      where: { userId_postId: { userId: req.user.id, postId } },
      create: { userId: req.user.id, postId },
      update: {},
    })
    return res.json({ success: true, data: { bookmarked: true } })
  } catch (err) {
    next(err)
  }
}

export const unbookmarkPost = async (req, res, next) => {
  try {
    const { postId } = req.params
    await prisma.bookmark.deleteMany({ where: { userId: req.user.id, postId } })
    return res.json({ success: true, data: { bookmarked: false } })
  } catch (err) {
    next(err)
  }
}
