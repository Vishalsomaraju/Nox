import React, { useRef, useEffect } from 'react'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import api from '../services/api'
import PageTransition from '../components/ui/PageTransition'
import PhotoGrid from '../components/profile/PhotoGrid'

export default function BookmarksPage() {
  const fetchBookmarks = async ({ pageParam = null }) => {
    const res = await api.get('/api/bookmarks', {
      params: { cursor: pageParam, limit: 15 }
    })
    return res.data.data
  }

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteScroll('bookmarks', fetchBookmarks)

  const loadMoreRef = useRef(null)

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchNextPage()
      },
      { threshold: 0.1 }
    )
    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data?.pages.flatMap(page => page.items) || []

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto pb-24 pt-6 px-4 sm:px-0">
        <h2 className="text-2xl font-heading font-bold text-primary mb-6">Saved Posts</h2>

        {isLoading ? (
          <div className="text-center py-10 text-secondary">Loading bookmarks...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-heading font-bold text-primary mb-1">No saved posts</h3>
            <p className="text-secondary">Posts you bookmark will appear here.</p>
          </div>
        ) : (
          <>
            <PhotoGrid posts={posts} />
            <div ref={loadMoreRef} className="py-8 text-center">
              {isFetchingNextPage && <div className="text-secondary text-sm">Loading more...</div>}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
