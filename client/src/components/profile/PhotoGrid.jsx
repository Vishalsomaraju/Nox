import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { formatCount } from '@/utils/formatters'

function PhotoGridSkeleton() {
  return (
    <div className="explore-grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="skeleton explore-cell" />
      ))}
    </div>
  )
}

function PhotoGrid({ posts = [], isLoading = false, emptyMessage = 'No posts yet' }) {
  const navigate = useNavigate()

  if (isLoading) return <PhotoGridSkeleton />

  if (!posts.length) {
    return (
      <div
        style={{
          padding: '48px 16px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: '0 auto' }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14 }}>
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="explore-grid">
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          className="explore-cell"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.03, duration: 0.3 }}
          onClick={() => navigate(`/post/${post.id}`)}
        >
          {post.imageUrl ? (
            <>
              <img
                src={post.imageUrl}
                alt={post.content || 'Post'}
                loading="lazy"
              />
              <div className="explore-cell-overlay">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {formatCount(post._count?.likes ?? post.likesCount ?? 0)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {formatCount(post._count?.comments ?? post.commentsCount ?? 0)}
                </span>
              </div>
            </>
          ) : (
            /* Text-only post placeholder */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a0a2e, #2d1b69)',
                padding: 8,
              }}
            >
              <p
                style={{
                  color: 'white',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  textAlign: 'center',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {post.content}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default PhotoGrid
