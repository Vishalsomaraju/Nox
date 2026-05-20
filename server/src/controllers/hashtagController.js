import prisma from '../lib/prisma.js'
import { parsePaginationParams, buildCursorArgs, formatPaginatedResponse } from '../utils/pagination.js'

export const getPostsByHashtag = async (req, res, next) => {
  try {
    const { tag } = req.params
    const { cursor, limit } = parsePaginationParams(req.query)
    const userId = req.user?.id

    const hashtag = await prisma.hashtag.findUnique({
      where: { name: tag.toLowerCase() },
      select: { id: true, name: true, postCount: true },
    })
    if (!hashtag) return res.status(404).json({ success: false, error: 'Hashtag not found' })

    const args = buildCursorArgs(cursor, limit)

    const postHashtags = await prisma.postHashtag.findMany({
      where: { hashtagId: hashtag.id },
      ...args,
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } },
            _count: { select: { likes: true, comments: true } },
            ...(userId && {
              likes: { where: { userId }, select: { id: true } },
              bookmarks: { where: { userId }, select: { id: true } },
            }),
          },
        },
      },
    })

    const { items, nextCursor, hasMore } = formatPaginatedResponse(postHashtags, limit)
    const posts = items.map(ph => ({
      ...ph.post,
      isLiked: userId ? ph.post.likes?.length > 0 : false,
      isBookmarked: userId ? ph.post.bookmarks?.length > 0 : false,
      likes: undefined,
      bookmarks: undefined,
    }))

    return res.json({ success: true, data: { hashtag, items: posts, nextCursor, hasMore } })
  } catch (err) {
    next(err)
  }
}

export const getTrendingHashtags = async (req, res, next) => {
  try {
    const hashtags = await prisma.hashtag.findMany({
      orderBy: { postCount: 'desc' },
      take: 10,
      select: { id: true, name: true, postCount: true },
    })
    return res.json({ success: true, data: hashtags })
  } catch (err) {
    next(err)
  }
}
