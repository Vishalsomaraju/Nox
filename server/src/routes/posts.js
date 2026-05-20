import { Router } from 'express'
import {
  createPost, getFeed, getExplore,
  getPost, deletePost,
  likePost, unlikePost, getUserPosts,
} from '../controllers/postController.js'
import { getComments, createComment, deleteComment } from '../controllers/commentController.js'
import { authenticate, optionalAuth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// Feed & Explore
router.get('/feed', authenticate, getFeed)
router.get('/explore', optionalAuth, getExplore)

// User posts
router.get('/user/:username', optionalAuth, getUserPosts)

// Post CRUD
router.post('/', authenticate, upload.single('image'), createPost)
router.get('/:id', optionalAuth, getPost)
router.delete('/:id', authenticate, deletePost)

// Likes
router.post('/:id/like', authenticate, likePost)
router.delete('/:id/like', authenticate, unlikePost)

// Comments (nested under posts)
router.get('/:id/comments', optionalAuth, getComments)
router.post('/:id/comments', authenticate, createComment)

export default router
