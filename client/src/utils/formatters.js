/**
 * Format a number into short form: 1234 → '1.2K', 1234567 → '1.2M'
 */
export function formatCount(n) {
  if (n == null) return '0'
  const num = Number(n)
  if (isNaN(num)) return '0'
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return String(num)
}

/**
 * Convert a date to relative time string: '2h', '3d', 'Jan 12', etc.
 */
export function timeAgo(date) {
  if (!date) return ''
  const now = new Date()
  const then = new Date(date)
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  const diffWeek = Math.floor(diffDay / 7)

  if (diffSec < 60) return 'now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHr < 24) return `${diffHr}h`
  if (diffDay < 7) return `${diffDay}d`
  if (diffWeek < 4) return `${diffWeek}w`

  // Older than 4 weeks: show month + day
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Extract hashtags from text, returns array of strings (without #)
 */
export function extractHashtags(text) {
  if (!text) return []
  const matches = text.match(/#([a-zA-Z0-9_]+)/g)
  if (!matches) return []
  return matches.map((tag) => tag.slice(1))
}

/**
 * Parse text and return array of segments: { type: 'text' | 'hashtag', value: string }
 */
export function parseTextWithHashtags(text) {
  if (!text) return []
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g)
  return parts.map((part) => ({
    type: part.startsWith('#') ? 'hashtag' : 'text',
    value: part,
  }))
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Generate initials from a display name
 */
export function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/**
 * Debounce a function
 */
export function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Truncate text to maxLength with ellipsis
 */
export function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}
