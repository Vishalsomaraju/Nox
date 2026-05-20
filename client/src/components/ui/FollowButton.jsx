import { useState } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '@/store/authStore'
import { api } from '@/services/api'
import toast from 'react-hot-toast'

function FollowButton({ userId, isFollowing: initialIsFollowing = false, onToggle, size = 'sm' }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isHovering, setIsHovering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const currentUser = useAuthStore((s) => s.user)

  // Don't show follow button for own profile
  if (currentUser?.id === userId) return null

  const handleToggle = async () => {
    if (isLoading) return
    const prev = isFollowing
    setIsFollowing(!prev)
    setIsLoading(true)

    try {
      if (prev) {
        await api.delete(`/users/${userId}/follow`)
      } else {
        await api.post(`/users/${userId}/follow`)
      }
      onToggle?.(!prev)
    } catch (err) {
      setIsFollowing(prev)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const sizeStyles = {
    sm: { padding: '6px 14px', fontSize: 13 },
    md: { padding: '9px 20px', fontSize: 14 },
    lg: { padding: '11px 24px', fontSize: 15 },
  }

  const isUnfollowing = isFollowing && isHovering

  return (
    <motion.button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileTap={{ scale: 0.95 }}
      disabled={isLoading}
      style={{
        ...(sizeStyles[size] || sizeStyles.sm),
        borderRadius: 'var(--radius-btn)',
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 600,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        border: isFollowing ? '1.5px solid var(--border)' : '1.5px solid var(--accent)',
        background: isFollowing
          ? isUnfollowing
            ? 'rgba(239,68,68,0.08)'
            : 'var(--bg-elevated)'
          : 'var(--accent)',
        color: isFollowing
          ? isUnfollowing
            ? '#ef4444'
            : 'var(--text-primary)'
          : '#ffffff',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: size === 'sm' ? 80 : 100,
        opacity: isLoading ? 0.7 : 1,
      }}
    >
      {isLoading ? (
        <div
          className="spinner"
          style={{
            width: 14,
            height: 14,
            borderColor: 'var(--border)',
            borderTopColor: isFollowing ? 'var(--text-primary)' : '#fff',
          }}
        />
      ) : isFollowing ? (
        isUnfollowing ? 'Unfollow' : 'Following'
      ) : (
        'Follow'
      )}
    </motion.button>
  )
}

export default FollowButton
