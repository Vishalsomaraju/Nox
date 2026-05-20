import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/services/api'
import toast from 'react-hot-toast'

function BookmarkButton({ postId, initialBookmarked = false, onToggle }) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = useCallback(async () => {
    if (isLoading) return

    const prev = isBookmarked
    setIsBookmarked(!prev)

    if (!prev) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 400)
    }

    setIsLoading(true)
    try {
      if (prev) {
        await api.delete(`/posts/${postId}/bookmark`)
      } else {
        await api.post(`/posts/${postId}/bookmark`)
      }
      onToggle?.(!prev)
    } catch {
      setIsBookmarked(prev)
      toast.error('Failed to update bookmark')
    } finally {
      setIsLoading(false)
    }
  }, [isBookmarked, isLoading, postId, onToggle])

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.88 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)',
        transition: 'color 0.2s ease',
      }}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
    >
      <motion.span
        animate={
          isAnimating
            ? { scale: [1, 1.4, 0.9, 1.1, 1], y: [0, -4, 0, -2, 0] }
            : { scale: 1, y: 0 }
        }
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ display: 'flex' }}
      >
        {isBookmarked ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </motion.span>
    </motion.button>
  )
}

export default BookmarkButton
