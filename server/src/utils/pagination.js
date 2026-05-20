/**
 * Cursor-based pagination utilities
 */

export const parsePaginationParams = (query) => {
  const limit = Math.min(parseInt(query.limit) || 20, 50)
  const cursor = query.cursor || null
  return { cursor, limit }
}

export const buildCursorArgs = (cursor, limit) => {
  const args = { take: limit + 1, orderBy: { createdAt: 'desc' } }
  if (cursor) {
    args.cursor = { id: cursor }
    args.skip = 1 // skip the cursor item itself
  }
  return args
}

export const formatPaginatedResponse = (items, limit) => {
  const hasMore = items.length > limit
  const data = hasMore ? items.slice(0, limit) : items
  const nextCursor = hasMore ? data[data.length - 1].id : null
  return { items: data, nextCursor, hasMore }
}
