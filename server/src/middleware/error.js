import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import jwt from 'jsonwebtoken'

/**
 * Global error handler middleware.
 * Must be registered LAST in Express.
 */
export const errorHandler = (err, req, res, _next) => {
  console.error('[Error]', err)

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    })
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field'
      return res.status(409).json({ success: false, error: `${field} already exists` })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Record not found' })
    }
  }

  // Generic fallback
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'
  return res.status(status).json({ success: false, error: message })
}
