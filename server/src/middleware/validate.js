import { validationResult } from 'express-validator'

/**
 * Run after express-validator chains.
 * Returns 400 if any validation errors exist.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}
