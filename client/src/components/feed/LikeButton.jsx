import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCount } from '@/utils/formatters'
import { api } from '@/services/api'
import toast from 'react-hot-toast'

function LikeButton({ postId, initialLiked = false, initialCount = 0, onToggle }) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = useCallback(async () => {
    if (isLoading) return

    const prevLiked = isLiked
    const prevCount = count

    // Optimistic update
    const newLiked = !prevLiked
    setIsLiked(newLiked)
    setCount(newLiked ? prevCount + 1 : prevCount - 1)

    if (newLiked) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }

    setIsLoading(true)
    try {
      if (newLiked) {
        await api.post(`/posts/${postId}/like`)
      } else {
        await api.delete(`/posts/${postId}/like`)
      }
      onToggle?.(newLiked, newLiked ? prevCount + 1 : prevCount - 1)
    } catch (err) {
      // Revert
      setIsLiked(prevLiked)
      setCount(prevCount)
      toast.error('Failed to update like')
    } finally {
      setIsLoading(false)
    }
  }, [isLiked, count, isLoading, postId, onToggle])

  return (
    <motion.button
      onClick={handleLike}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 0',
        color: isLiked ? '#ec4899' : 'var(--text-muted)',
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 500,
        fontSize: 13,
        transition: 'color 0.2s ease',
        userSelect: 'none',
      }}
      whileTap={{ scale: 0.88 }}
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
    >
      <motion.span
        animate={
          isAnimating
            ? { scale: [1, 1.5, 1.2, 1.4, 1], rotate: [0, -10, 10, -5, 0] }
            : { scale: 1 }
        }
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {isLiked ? (
          // Filled heart
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ec4899" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        ) : (
          // Outline heart
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )}
      </motion.span>

      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
        >
          {formatCount(count)}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

export default LikeButton
