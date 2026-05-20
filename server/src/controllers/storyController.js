import prisma from '../lib/prisma.js'
import { uploadImage, deleteImage } from '../services/cloudinary.js'
import { parsePaginationParams, buildCursorArgs, formatPaginatedResponse } from '../utils/pagination.js'

const STORY_EXPIRY_HOURS = 24

export const getStories = async (req, res, next) => {
  try {
    const now = new Date()

    // Get following IDs
    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true },
    })
    const followingIds = [req.user.id, ...following.map(f => f.followingId)]

    // Get active stories grouped by author
    const stories = await prisma.story.findMany({
      where: {
        authorId: { in: followingIds },
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        views: { where: { viewerId: req.user.id }, select: { id: true } },
      },
    })

    // Group by author
    const grouped = {}
    for (const story of stories) {
      const uid = story.author.id
      if (!grouped[uid]) {
        grouped[uid] = {
          user: story.author,
          stories: [],
          hasUnviewed: false,
        }
      }
      const isViewed = story.views.length > 0
      grouped[uid].stories.push({ ...story, isViewed, views: undefined })
      if (!isViewed) grouped[uid].hasUnviewed = true
    }

    // Sort: unviewed first, then own stories first
    const result = Object.values(grouped).sort((a, b) => {
      if (a.user.id === req.user.id) return -1
      if (b.user.id === req.user.id) return 1
      return b.hasUnviewed - a.hasUnviewed
    })

    return res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const createStory = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Media file required' })

    const mediaType = req.file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE'
    const { url } = await uploadImage(req.file.buffer, 'stories')

    const expiresAt = new Date(Date.now() + STORY_EXPIRY_HOURS * 60 * 60 * 1000)

    const story = await prisma.story.create({
      data: { authorId: req.user.id, mediaUrl: url, mediaType, expiresAt },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    })

    return res.status(201).json({ success: true, data: story })
  } catch (err) {
    next(err)
  }
}

export const deleteStory = async (req, res, next) => {
  try {
    const { id } = req.params
    const story = await prisma.story.findUnique({ where: { id } })
    if (!story) return res.status(404).json({ success: false, error: 'Story not found' })
    if (story.authorId !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' })

    // Delete from Cloudinary
    const parts = story.mediaUrl.split('/')
    const filename = parts[parts.length - 1].split('.')[0]
    await deleteImage(`stories/${filename}`).catch(() => {})

    await prisma.story.delete({ where: { id } })
    return res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

export const viewStory = async (req, res, next) => {
  try {
    const { id: storyId } = req.params
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { id: true } })
    if (!story) return res.status(404).json({ success: false, error: 'Story not found' })

    await prisma.storyView.upsert({
      where: { storyId_viewerId: { storyId, viewerId: req.user.id } },
      create: { storyId, viewerId: req.user.id },
      update: {},
    })

    return res.json({ success: true, data: { viewed: true } })
  } catch (err) {
    next(err)
  }
}
