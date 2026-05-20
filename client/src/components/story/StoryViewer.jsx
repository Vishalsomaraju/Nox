import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { timeAgo } from '@/utils/formatters'

const STORY_DURATION = 5000 // 5 seconds per story

function StoryViewer() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const progressInterval = useRef(null)
  const startTime = useRef(null)
  const accumulated = useRef(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['stories', username],
    queryFn: () => api.get(`/stories/${username}`).then((r) => r.data),
  })

  const stories = data?.stories || []
  const currentStory = stories[currentIndex]

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1)
      setProgress(0)
      accumulated.current = 0
    } else {
      navigate(-1)
    }
  }, [currentIndex, stories.length, navigate])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setProgress(0)
      accumulated.current = 0
    }
  }, [currentIndex])

  // Progress timer
  useEffect(() => {
    if (isPaused || !currentStory) return

    startTime.current = Date.now()

    progressInterval.current = setInterval(() => {
      const elapsed = accumulated.current + (Date.now() - startTime.current)
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(progressInterval.current)
        goNext()
      }
    }, 50)

    return () => clearInterval(progressInterval.current)
  }, [currentIndex, isPaused, currentStory, goNext])

  const handlePause = () => {
    setIsPaused(true)
    accumulated.current += Date.now() - startTime.current
    clearInterval(progressInterval.current)
  }

  const handleResume = () => {
    setIsPaused(false)
    startTime.current = Date.now()
  }

  const handleTap = (e) => {
    const x = e.clientX
    const half = window.innerWidth / 2
    if (x < half) {
      goPrev()
    } else {
      goNext()
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
        }}
      >
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  if (isError || stories.length === 0) {
    navigate(-1)
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseDown={handlePause}
      onMouseUp={handleResume}
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
      onClick={handleTap}
    >
      {/* Progress bars */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '48px 12px 8px',
          display: 'flex',
          gap: 4,
          zIndex: 10,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
        }}
      >
        {stories.map((_, i) => (
          <div key={i} className="story-progress-track" style={{ flex: 1 }}>
            <motion.div
              className="story-progress-fill"
              style={{
                scaleX:
                  i < currentIndex
                    ? 1
                    : i === currentIndex
                    ? progress / 100
                    : 0,
                transformOrigin: 'left',
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); navigate(-1) }}
        style={{
          position: 'absolute',
          top: 48,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
        }}
        aria-label="Close story"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Story image */}
      <AnimatePresence mode="wait">
        {currentStory && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentStory.imageUrl ? (
              <img
                src={currentStory.imageUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
                draggable={false}
              />
            ) : (
              /* Text story */
              <div
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #1a0a2e, #2d1b69)',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <p
                  style={{
                    color: 'white',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 'clamp(20px, 5vw, 36px)',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    textAlign: 'center',
                  }}
                >
                  {currentStory.content}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User info overlay (bottom left) */}
      {currentStory && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '40px 16px 32px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 12,
            zIndex: 10,
            pointerEvents: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Avatar */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '2px solid white',
              overflow: 'hidden',
              flexShrink: 0,
              background: 'var(--bg-elevated)',
            }}
          >
            {currentStory.author?.avatarUrl ? (
              <img
                src={currentStory.author.avatarUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, var(--story-ring-start), var(--story-ring-end))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {(currentStory.author?.username || '?')[0].toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {currentStory.author?.displayName || currentStory.author?.username}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {timeAgo(currentStory.createdAt)}
            </div>
          </div>
        </div>
      )}

      {/* Tap zones (invisible) */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 5 }}>
        <div style={{ flex: 1 }} />
        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}

export default StoryViewer
