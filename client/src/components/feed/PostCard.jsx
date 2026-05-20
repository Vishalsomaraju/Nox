import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Avatar from '@/components/ui/Avatar'
import LikeButton from './LikeButton'
import BookmarkButton from './BookmarkButton'
import { BlurhashCanvas } from '@/utils/blurhash'
import { timeAgo, formatCount, parseTextWithHashtags } from '@/utils/formatters'
import useAuthStore from '@/store/authStore'

function CaptionText({ text }) {
  const navigate = useNavigate()
  const segments = parseTextWithHashtags(text || '')

  return (
    <p style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
      {segments.map((seg, i) =>
        seg.type === 'hashtag' ? (
          <span
            key={i}
            className="hashtag-link"
            onClick={() => navigate(`/hashtag/${seg.value.slice(1)}`)}
          >
            {seg.value}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )}
    </p>
  )
}

function PostImage({ imageUrl, blurhash, alt }) {
  const [loaded, setLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--bg-elevated)',
        minHeight: 200,
        overflow: 'hidden',
      }}
    >
      {/* Blurhash placeholder */}
      {!loaded && blurhash && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <BlurhashCanvas hash={blurhash} width={32} height={32} />
        </div>
      )}

      {/* Actual image */}
      {isVisible && (
        <motion.img
          src={imageUrl}
          alt={alt || 'Post image'}
          onLoad={() => setLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            width: '100%',
            display: 'block',
            objectFit: 'cover',
            maxHeight: 600,
          }}
        />
      )}

      {/* Skeleton if no blurhash and not loaded */}
      {!loaded && !blurhash && (
        <div className="skeleton" style={{ width: '100%', minHeight: 250 }} />
      )}
    </div>
  )
}

function PostCard({ post, onCommentClick, showFullCaption = false }) {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [showOptions, setShowOptions] = useState(false)

  const author = post?.author || {}
  const isOwn = currentUser?.id === author.id

  const handleProfileClick = () => {
    if (author.username) navigate(`/profile/${author.username}`)
  }

  const handlePostClick = () => {
    navigate(`/post/${post.id}`)
  }

  return (
    <motion.article
      className="post-card mb-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-elevated)' }}
      layout
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Avatar
          src={author.avatarUrl}
          size="md"
          username={author.username}
          displayName={author.displayName}
          hasStory={author.hasActiveStory}
          onClick={handleProfileClick}
        />
        <div className="flex-1 min-w-0">
          <button
            onClick={handleProfileClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
            }}
          >
            <div
              className="font-heading font-semibold text-sm truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {author.displayName || author.username}
            </div>
            <div
              className="text-xs truncate"
              style={{ color: 'var(--text-muted)' }}
            >
              @{author.username} · {timeAgo(post.createdAt)}
            </div>
          </button>
        </div>

        {/* Options menu */}
        <div style={{ position: 'relative' }}>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowOptions(!showOptions)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 8,
              color: 'var(--text-muted)',
            }}
            aria-label="Post options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </motion.button>

          {showOptions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{
                position: 'absolute',
                right: 0,
                top: 32,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-elevated)',
                zIndex: 10,
                minWidth: 140,
                overflow: 'hidden',
              }}
            >
              {[
                { label: 'View post', action: handlePostClick },
                isOwn && { label: 'Delete', action: () => {}, color: '#ef4444' },
                !isOwn && { label: 'Report', action: () => {}, color: '#ef4444' },
              ]
                .filter(Boolean)
                .map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setShowOptions(false) }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: item.color || 'var(--text-primary)',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 14,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    {item.label}
                  </button>
                ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <PostImage
          imageUrl={post.imageUrl}
          blurhash={post.blurhash}
          alt={post.content}
        />
      )}

      {/* Caption */}
      {post.content && (
        <div className="px-4 pt-3 pb-1">
          {showFullCaption || post.content.length <= 200 ? (
            <CaptionText text={post.content} />
          ) : (
            <>
              <CaptionText text={post.content.slice(0, 200) + '…'} />
              <button
                onClick={handlePostClick}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  padding: '2px 0',
                }}
              >
                more
              </button>
            </>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center px-4 py-3 gap-4">
        <LikeButton
          postId={post.id}
          initialLiked={post.isLiked}
          initialCount={post._count?.likes ?? post.likesCount ?? 0}
        />

        {/* Comment button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onCommentClick || handlePostClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 13,
            fontWeight: 500,
          }}
          aria-label="Comments"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {formatCount(post._count?.comments ?? post.commentsCount ?? 0)}
        </motion.button>

        {/* Share */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
          onClick={() => {
            navigator.clipboard?.writeText(window.location.origin + '/post/' + post.id)
            toast?.success?.('Link copied!')
          }}
          aria-label="Share"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </motion.button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bookmark */}
        <BookmarkButton
          postId={post.id}
          initialBookmarked={post.isBookmarked}
        />
      </div>
    </motion.article>
  )
}

export default PostCard
