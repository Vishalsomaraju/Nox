import prisma from '../lib/prisma.js'
import { uploadImage, deleteImage } from '../services/cloudinary.js'
import { emitNotification } from '../services/socket.js'
import { generateBlurhash } from '../utils/blurhash.js'
import { extractHashtags } from '../utils/helpers.js'
import { parsePaginationParams, buildCursorArgs, formatPaginatedResponse } from '../utils/pagination.js'

// Shared post include config for consistent response shape
const postInclude = (userId) => ({
  author: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } },
  _count: { select: { likes: true, comments: true } },
  ...(userId && {
    likes: { where: { userId }, select: { id: true } },
    bookmarks: { where: { userId }, select: { id: true } },
  }),
})

const formatPost = (post, userId) => ({
  ...post,
  isLiked: userId ? post.likes?.length > 0 : false,
  isBookmarked: userId ? post.bookmarks?.length > 0 : false,
  likes: undefined,
  bookmarks: undefined,
})

export const createPost = async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content?.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required' })
    }

    let imageUrl = null
    let blurhash = null

    if (req.file) {
      const [uploadResult, hash] = await Promise.all([
        uploadImage(req.file.buffer, 'posts'),
        generateBlurhash(req.file.buffer),
      ])
      imageUrl = uploadResult.url
      blurhash = hash
    }

    const post = await prisma.post.create({
      data: { content: content.trim(), imageUrl, blurhash, authorId: req.user.id },
      include: postInclude(req.user.id),
    })

    // Process hashtags in background
    const tags = extractHashtags(content)
    if (tags.length > 0) {
      Promise.all(
        tags.map(name =>
          prisma.hashtag.upsert({
            where: { name },
            create: { name, postCount: 1 },
            update: { postCount: { increment: 1 } },
          }).then(hashtag =>
            prisma.postHashtag.upsert({
              where: { postId_hashtagId: { postId: post.id, hashtagId: hashtag.id } },
              create: { postId: post.id, hashtagId: hashtag.id },
              update: {},
            })
          )
        )
      ).catch(console.error)
    }

    return res.status(201).json({ success: true, data: formatPost(post, req.user.id) })
  } catch (err) {
    next(err)
  }
}

export const getFeed = async (req, res, next) => {
  try {
    const { cursor, limit } = parsePaginationParams(req.query)

    // Get IDs of users being followed
    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true },
    })
    const followingIds = following.map(f => f.followingId)

    // Also get blocked user IDs to exclude
    const blocks = await prisma.block.findMany({
      where: { OR: [{ blockerId: req.user.id }, { blockedId: req.user.id }] },
      select: { blockerId: true, blockedId: true },
    })
    const blockedIds = blocks.map(b => b.blockerId === req.user.id ? b.blockedId : b.blockerId)

    const args = buildCursorArgs(cursor, limit)
    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: [...followingIds, req.user.id], notIn: blockedIds },
      },
      ...args,
      include: postInclude(req.user.id),
    })

    const { items, nextCursor, hasMore } = formatPaginatedResponse(posts, limit)
    return res.json({
      success: true,
      data: { items: items.map(p => formatPost(p, req.user.id)), nextCursor, hasMore },
    })
  } catch (err) {
    next(err)
  }
}

export const getExplore = async (req, res, next) => {
  try {
    const { cursor, limit } = parsePaginationParams(req.query)
    const userId = req.user?.id

    let excludeIds = []
    if (userId) {
      const [following, blocks] = await Promise.all([
        prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
        prisma.block.findMany({
          where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
          select: { blockerId: true, blockedId: true },
        }),
      ])
      excludeIds = [
        userId,
        ...following.map(f => f.followingId),
        ...blocks.map(b => b.blockerId === userId ? b.blockedId : b.blockerId),
      ]
    }

    const args = buildCursorArgs(cursor, limit)
    const posts = await prisma.post.findMany({
      where: excludeIds.length ? { authorId: { notIn: excludeIds } } : {},
      ...args,
      include: postInclude(userId),
    })

    const { items, nextCursor, hasMore } = formatPaginatedResponse(posts, limit)
    return res.json({
      success: true,
      data: { items: items.map(p => formatPost(p, userId)), nextCursor, hasMore },
    })
  } catch (err) {
    next(err)
  }
}

export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const post = await prisma.post.findUnique({
      where: { id },
      include: postInclude(userId),
    })
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' })
    return res.json({ success: true, data: formatPost(post, userId) })
  } catch (err) {
    next(err)
  }
}

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params
    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' })
    if (post.authorId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' })

    if (post.imageUrl) {
      // Extract publicId from URL
      const parts = post.imageUrl.split('/')
      const filename = parts[parts.length - 1].split('.')[0]
      const folder = parts[parts.length - 2]
      await deleteImage(`${folder}/${filename}`).catch(() => {})
    }

    await prisma.post.delete({ where: { id } })
    return res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

export const likePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' })

    await prisma.like.upsert({
      where: { userId_postId: { userId: req.user.id, postId } },
      create: { userId: req.user.id, postId },
      update: {},
    })

    const likeCount = await prisma.like.count({ where: { postId } })

    // Notify post author (not self)
    if (post.authorId !== req.user.id) {
      const notification = await prisma.notification.create({
        data: { recipientId: post.authorId, actorId: req.user.id, type: 'LIKE', postId },
        include: { actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      })
      emitNotification(post.authorId, notification)
    }

    return res.json({ success: true, data: { liked: true, likeCount } })
  } catch (err) {
    next(err)
  }
}

export const unlikePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params
    await prisma.like.deleteMany({ where: { userId: req.user.id, postId } })
    const likeCount = await prisma.like.count({ where: { postId } })
    return res.json({ success: true, data: { liked: false, likeCount } })
  } catch (err) {
    next(err)
  }
}

export const getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params
    const { cursor, limit } = parsePaginationParams(req.query)
    const userId = req.user?.id

    const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() }, select: { id: true } })
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    const args = buildCursorArgs(cursor, limit)
    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      ...args,
      include: postInclude(userId),
    })

    const { items, nextCursor, hasMore } = formatPaginatedResponse(posts, limit)
    return res.json({
      success: true,
      data: { items: items.map(p => formatPost(p, userId)), nextCursor, hasMore },
    })
  } catch (err) {
    next(err)
  }
}
