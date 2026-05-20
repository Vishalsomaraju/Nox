import { useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

/**
 * Custom hook for infinite scroll using IntersectionObserver + react-query
 *
 * @param {Array} queryKey - React Query key
 * @param {Function} fetchFn - Function that receives { pageParam } and returns { items, nextCursor }
 * @param {Object} options - Additional react-query options
 */
export function useInfiniteScroll(queryKey, fetchFn, options = {}) {
  const observerRef = useRef(null)
  const sentinelRef = useRef(null)

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchFn({ pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    ...options,
  })

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query

  const handleIntersection = useCallback(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    })

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [handleIntersection])

  // Flatten pages into a single items array
  const items = query.data?.pages.flatMap((page) => page?.items ?? []) ?? []

  return {
    items,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: query.refetch,
    sentinelRef,
  }
}

export default useInfiniteScroll
