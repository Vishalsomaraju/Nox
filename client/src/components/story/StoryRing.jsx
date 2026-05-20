import { useNavigate } from 'react-router-dom'
import Avatar from '@/components/ui/Avatar'

function StoryRing({ user }) {
  const navigate = useNavigate()

  if (!user) return null

  return (
    <button
      onClick={() => navigate(`/story/${user.username}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        padding: '2px 0',
      }}
      aria-label={`View ${user.username}'s story`}
    >
      <Avatar
        src={user.avatarUrl}
        size="lg"
        username={user.username}
        displayName={user.displayName}
        hasStory
        viewed={user.viewed}
        disableHover
      />
      <span
        style={{
          fontSize: 11,
          color: 'var(--text-secondary)',
          fontFamily: 'Space Grotesk, sans-serif',
          maxWidth: 56,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        {user.username}
      </span>
    </button>
  )
}

export default StoryRing
