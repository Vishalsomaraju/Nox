import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { safeUser } from '../utils/helpers.js'

const REFRESH_TOKEN_MAX_PER_USER = 5
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

export const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username'
      return res.status(409).json({ success: false, error: `${field} already taken` })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { username: username.toLowerCase(), email: email.toLowerCase(), passwordHash, displayName },
    })

    const accessToken = generateAccessToken(user.id)
    const refreshTokenValue = generateRefreshToken(user.id)

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.cookie('refreshToken', refreshTokenValue, COOKIE_OPTIONS)
    return res.status(201).json({ success: true, data: { user: safeUser(user), accessToken } })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    // Rotate: keep only latest N tokens per user
    const existingTokens = await prisma.refreshToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    if (existingTokens.length >= REFRESH_TOKEN_MAX_PER_USER) {
      const toDelete = existingTokens.slice(REFRESH_TOKEN_MAX_PER_USER - 1)
      await prisma.refreshToken.deleteMany({ where: { id: { in: toDelete.map(t => t.id) } } })
    }

    const accessToken = generateAccessToken(user.id)
    const refreshTokenValue = generateRefreshToken(user.id)

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.cookie('refreshToken', refreshTokenValue, COOKIE_OPTIONS)
    return res.json({ success: true, data: { user: safeUser(user), accessToken } })
  } catch (err) {
    next(err)
  }
}

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) {
      return res.status(401).json({ success: false, error: 'No refresh token' })
    }

    // Verify JWT signature & expiry
    let decoded
    try {
      decoded = verifyRefreshToken(token)
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' })
    }

    // Check token exists in DB (not logged out)
    const storedToken = await prisma.refreshToken.findUnique({ where: { token } })
    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.clearCookie('refreshToken')
      return res.status(401).json({ success: false, error: 'Refresh token expired or revoked' })
    }

    // Delete old, create new (rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } })

    const newAccessToken = generateAccessToken(decoded.userId)
    const newRefreshTokenValue = generateRefreshToken(decoded.userId)

    await prisma.refreshToken.create({
      data: {
        token: newRefreshTokenValue,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    res.cookie('refreshToken', newRefreshTokenValue, COOKIE_OPTIONS)
    return res.json({ success: true, data: { accessToken: newAccessToken } })
  } catch (err) {
    next(err)
  }
}

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {})
    }
    res.clearCookie('refreshToken')
    return res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

export const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: { select: { followers: true, following: true, posts: true } },
      },
    })
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    return res.json({ success: true, data: safeUser(user) })
  } catch (err) {
    next(err)
  }
}
