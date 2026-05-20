/**
 * Extract hashtags from post content text.
 * Returns lowercase array of tag names (without #).
 */
export const extractHashtags = (text) => {
  const matches = text.match(/#([a-zA-Z0-9_]+)/g) || []
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))]
}

/**
 * Safe user object — strips passwordHash
 */
export const safeUser = (user) => {
  const { passwordHash, ...safe } = user
  return safe
}
