import prisma from '../lib/prisma.js'
import { uploadImage } from '../services/cloudinary.js'
import { emitNotification } from '../services/socket.js'
import { parsePaginationParams, buildCursorArgs, formatPaginatedResponse } from '../utils/pagination.js'
import { safeUser } from '../utils/helpers.js'

export const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        _count: { select: { followers: true, following: true, posts: true } },
      },
    })
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    let isFollowing = false
    if (req.user) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.user.id, followingId: user.id } },
      })
      isFollowing = !!follow
    }

    return res.json({ success: true, data: { ...safeUser(user), isFollowing } })
  } catch (err) {
    next(err)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, website, username } = req.body
    const data = {}
    if (displayName !== undefined) data.displayName = displayName
    if (bio !== undefined) data.bio = bio
    if (website !== undefined) data.website = website
    if (username !== undefined) data.username = username.toLowerCase()

    const updated = await prisma.user.update({ where: { id: req.user.id }, data })
    return res.json({ success: true, data: safeUser(updated) })
  } catch (err) {
    next(err)
  }
}

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' })
    const { url } = await uploadImage(req.file.buffer, 'avatars', `avatar_${req.user.id}`)
    const updated = await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: url } })
    return res.json({ success: true, data: { avatarUrl: url, user: safeUser(updated) } })
  } catch (err) {
    next(err)
  }
}

export const followUser = async (req, res, next) => {
  try {
    const { id: targetId } = req.params
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' })
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } })
    if (!target) return res.status(404).json({ success: false, error: 'User not found' })

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: req.user.id, followingId: targetId } },
      create: { followerId: req.user.id, followingId: targetId },
      update: {},
    })

    // Notification
    const notification = await prisma.notification.create({
      data: { recipientId: targetId, actorId: req.user.id, type: 'FOLLOW' },
      include: { actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    })
    emitNotification(targetId, notification)

    return res.json({ success: true, data: { following: true } })
  } catch (err) {
    next(err)
  }
}

export const unfollowUser = async (req, res, next) => {
  try {
    const { id: targetId } = req.params
    await prisma.follow.deleteMany({
      where: { followerId: req.user.id, followingId: targetId },
    })
    return res.json({ success: true, data: { following: false } })
  } catch (err) {
    next(err)
  }
}

export const getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params
    const { cursor, limit } = parsePaginationParams(req.query)
    const args = buildCursorArgs(cursor, limit)

    const follows = await prisma.follow.findMany({
      where: { followingId: id },
      ...args,
      include: {
        follower: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } },
      },
    })

    const { items, nextCursor, hasMore } = formatPaginatedResponse(follows, limit)
    return res.json({ success: true, data: { items: items.map(f => f.follower), nextCursor, hasMore } })
  } catch (err) {
    next(err)
  }
}

export const getFollowing = async (req, res, next) => {
  try {
    const { id } = req.params
    const { cursor, limit } = parsePaginationParams(req.query)
    const args = buildCursorArgs(cursor, limit)

    const follows = await prisma.follow.findMany({
      where: { followerId: id },
      ...args,
      include: {
        following: { select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true } },
      },
    })

    const { items, nextCursor, hasMore } = formatPaginatedResponse(follows, limit)
    return res.json({ success: true, data: { items: items.map(f => f.following), nextCursor, hasMore } })
  } catch (err) {
    next(err)
  }
}

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 1) {
      return res.json({ success: true, data: [] })
    }
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q.toLowerCase(), mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: { id: true, username: true, displayName: true, avatarUrl: true, isVerified: true, _count: { select: { followers: true } } },
    })
    return res.json({ success: true, data: users })
  } catch (err) {
    next(err)
  }
}

export const blockUser = async (req, res, next) => {
  try {
    const { id: blockedId } = req.params
    await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: req.user.id, blockedId } },
      create: { blockerId: req.user.id, blockedId },
      update: {},
    })
    return res.json({ success: true, data: { blocked: true } })
  } catch (err) {
    next(err)
  }
}

export const unblockUser = async (req, res, next) => {
  try {
    const { id: blockedId } = req.params
    await prisma.block.deleteMany({ where: { blockerId: req.user.id, blockedId } })
    return res.json({ success: true, data: { blocked: false } })
  } catch (err) {
    next(err)
  }
}
