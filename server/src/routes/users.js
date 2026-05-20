import { Router } from 'express'
import {
  getProfile, updateProfile, uploadAvatar,
  followUser, unfollowUser,
  getFollowers, getFollowing,
  searchUsers, blockUser, unblockUser,
} from '../controllers/userController.js'
import { authenticate, optionalAuth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.get('/search', optionalAuth, searchUsers)
router.get('/:username', optionalAuth, getProfile)
router.put('/me/profile', authenticate, updateProfile)
router.post('/me/avatar', authenticate, upload.single('avatar'), uploadAvatar)
router.post('/:id/follow', authenticate, followUser)
router.delete('/:id/follow', authenticate, unfollowUser)
router.get('/:id/followers', optionalAuth, getFollowers)
router.get('/:id/following', optionalAuth, getFollowing)
router.post('/:id/block', authenticate, blockUser)
router.delete('/:id/block', authenticate, unblockUser)

export default router
