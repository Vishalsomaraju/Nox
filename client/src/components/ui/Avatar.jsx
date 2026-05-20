import { motion } from 'framer-motion'
import { getInitials } from '@/utils/formatters'

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
}

const FONT_SIZES = {
  xs: '10px',
  sm: '12px',
  md: '14px',
  lg: '20px',
  xl: '32px',
}

function Avatar({
  src,
  size = 'md',
  username = '',
  displayName = '',
  hasStory = false,
  viewed = false,
  onClick,
  className = '',
  disableHover = false,
}) {
  const px = SIZES[size] || SIZES.md
  const fontSize = FONT_SIZES[size] || FONT_SIZES.md
  const initials = getInitials(displayName || username)

  const inner = (
    <div
      style={{ width: px, height: px, minWidth: px, minHeight: px }}
      className="relative"
    >
      {/* Story ring wrapper */}
      {hasStory ? (
        <div
          className={viewed ? 'story-ring-viewed' : 'story-ring'}
          style={{ width: px, height: px, padding: 2 }}
        >
          <div
            className="story-ring-inner"
            style={{ width: '100%', height: '100%' }}
          >
            <AvatarImage src={src} initials={initials} fontSize={fontSize} />
          </div>
        </div>
      ) : (
        <div
          style={{
            width: px,
            height: px,
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <AvatarImage src={src} initials={initials} fontSize={fontSize} />
        </div>
      )}
    </div>
  )

  return (
    <motion.div
      className={`cursor-pointer select-none ${className}`}
      onClick={onClick}
      whileHover={disableHover ? {} : { scale: 1.05 }}
      whileTap={onClick ? { scale: 0.96 } : {}}
      style={{ display: 'inline-block' }}
    >
      {inner}
    </motion.div>
  )
}

function AvatarImage({ src, initials, fontSize }) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex')
        }}
      />
    )
  }

  return (
    <div
      className="avatar-fallback"
      style={{
        width: '100%',
        height: '100%',
        fontSize,
        borderRadius: '50%',
      }}
    >
      {initials}
    </div>
  )
}

export default Avatar
