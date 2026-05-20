import { verifyAccessToken } from '../utils/jwt.js'
import prisma from '../lib/prisma.js'

/**
 * Require a valid Bearer access token. Attaches req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, displayName: true, avatarUrl: true, isVerified: true },
    })

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }
}

/**
 * Optionally authenticate — sets req.user if token valid, null otherwise.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      req.user = null
      return next()
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, displayName: true, avatarUrl: true, isVerified: true },
    })

    req.user = user || null
    next()
  } catch {
    req.user = null
    next()
  }
}
