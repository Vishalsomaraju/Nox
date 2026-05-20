import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StoryRing from './StoryRing'
import { api } from '@/services/api'
import useAuthStore from '@/store/authStore'

function YourStoryButton() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  return (
    <button
      onClick={() => {/* Open story upload */}}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      aria-label="Add story"
    >
      {/* Avatar with + overlay */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--story-ring-start), var(--story-ring-end))',
                color: 'white',
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              {(user?.displayName || user?.username || '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        {/* Plus badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--bg-void)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
      <span
        style={{
          fontSize: 11,
          color: 'var(--text-secondary)',
          fontFamily: 'Space Grotesk, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        Your story
      </span>
    </button>
  )
}

function StoryBar() {
  const scrollRef = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: () => api.get('/stories').then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  })

  const stories = data?.stories || []

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 0',
      }}
    >
      <div
        ref={scrollRef}
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingLeft: 16,
          paddingRight: 16,
          scrollBehavior: 'smooth',
        }}
      >
        {/* Your story */}
        <YourStoryButton />

        {/* Stories from followed users */}
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div className="skeleton rounded-full" style={{ width: 56, height: 56 }} />
                <div className="skeleton" style={{ width: 40, height: 10 }} />
              </div>
            ))
          : stories.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <StoryRing user={user} />
              </motion.div>
            ))}

        {/* Empty state if no stories */}
        {!isLoading && stories.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              padding: '8px 0',
            }}
          >
            Follow people to see their stories
          </div>
        )}
      </div>
    </div>
  )
}

export default StoryBar
