import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { safeUser } from '../utils/helpers.js'

const REFRESH_TOKEN_MAX_PER_USER = 5
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

const authPayload = (user, accessToken) => {
  const payload = { user: safeUser(user), accessToken }
  return { success: true, ...payload, data: payload }
}

export const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body

    const existing = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: email.toLowerCase() }, 
          { username: username.toLowerCase() }
        ] 
      },
    })
    if (existing) {
      const field = existing.email.toLowerCase() === email.toLowerCase() ? 'Email' : 'Username'
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
    return res.status(201).json(authPayload(user, accessToken))
  } catch (err) {
    next(err)
  }
}

export const checkUsername = async (req, res, next) => {
  try {
    const { username } = req.query
    if (!username) {
      return res.status(400).json({ success: false, error: 'Username is required' })
    }
    
    const existing = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    })
    
    if (existing) {
      return res.status(409).json({ success: false, error: 'Username taken' })
    }
    
    return res.json({ success: true, data: 'Username available' })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body

    const user = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() }
        ]
      } 
    })
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
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
    return res.json(authPayload(user, accessToken))
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
    return res.json({ success: true, accessToken: newAccessToken, data: { accessToken: newAccessToken } })
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
    const safe = safeUser(user)
    return res.json({ success: true, user: safe, data: safe })
  } catch (err) {
    next(err)
  }
}
