import { Router } from 'express'
import { getStories, createStory, deleteStory, viewStory } from '../controllers/storyController.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.get('/', authenticate, getStories)
router.post('/', authenticate, upload.single('media'), createStory)
router.delete('/:id', authenticate, deleteStory)
router.post('/:id/view', authenticate, viewStory)

export default router
