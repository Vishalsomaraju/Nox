import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { timeAgo } from '@/utils/formatters'

const notificationText = (type, actorName) => {
  switch (type) {
    case 'like':
      return `liked your post`
    case 'comment':
      return `commented on your post`
    case 'follow':
      return `started following you`
    case 'mention':
      return `mentioned you in a post`
    case 'reply':
      return `replied to your comment`
    default:
      return `interacted with you`
  }
}

function NotificationItem({ notification, onClick }) {
  const navigate = useNavigate()
  const { actor, type, post, read, createdAt } = notification

  const handleClick = () => {
    onClick?.(notification)
    if (type === 'follow') {
      navigate(`/profile/${actor?.username}`)
    } else if (post?.id) {
      navigate(`/post/${post.id}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        cursor: 'pointer',
        background: read ? 'transparent' : 'var(--accent-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = read ? 'transparent' : 'var(--accent-subtle)')}
    >
      {/* Actor avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--story-ring-start), var(--story-ring-end))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {actor?.avatarUrl ? (
            <img
              src={actor.avatarUrl}
              alt={actor.username}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>
              {(actor?.displayName || actor?.username || '?')[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Notification type icon badge */}
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: type === 'like' ? '#ec4899' : type === 'follow' ? 'var(--accent)' : '#3b82f6',
            border: '2px solid var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {type === 'like' && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
          {type === 'follow' && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          )}
          {(type === 'comment' || type === 'reply' || type === 'mention') && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </div>
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>
            {actor?.displayName || actor?.username}
          </span>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>
            {notificationText(type, actor?.displayName || actor?.username)}
          </span>
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
          {timeAgo(createdAt)}
        </p>
      </div>

      {/* Post thumbnail (for like/comment) */}
      {post?.imageUrl && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src={post.imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Unread dot */}
      {!read && <div className="notif-dot" />}
    </motion.div>
  )
}

export default NotificationItem
