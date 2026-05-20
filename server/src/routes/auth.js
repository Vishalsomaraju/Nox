import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, refresh, logout, me, checkUsername } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validate.js'
import rateLimit from 'express-rate-limit'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post(
  '/register',
  authLimiter,
  [
    body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-30 alphanumeric characters or underscores'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('displayName').trim().isLength({ min: 1, max: 50 }).withMessage('Display name is required'),
  ],
  validateRequest,
  register
)

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
)

router.get('/check-username', checkUsername)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', authenticate, me)

export default router
