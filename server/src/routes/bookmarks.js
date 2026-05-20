import { Router } from 'express'
import { getBookmarks, bookmarkPost, unbookmarkPost } from '../controllers/bookmarkController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, getBookmarks)
router.post('/:postId', authenticate, bookmarkPost)
router.delete('/:postId', authenticate, unbookmarkPost)

export default router
