import { Router } from 'express'
import { getPostsByHashtag, getTrendingHashtags } from '../controllers/hashtagController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/trending', getTrendingHashtags)
router.get('/:tag/posts', optionalAuth, getPostsByHashtag)

export default router
