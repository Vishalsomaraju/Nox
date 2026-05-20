import React, { useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import api from '../services/api'
import PageTransition from '../components/ui/PageTransition'
import PhotoGrid from '../components/profile/PhotoGrid'

export default function HashtagPage() {
  const { tag } = useParams()
  const navigate = useNavigate()

  const fetchHashtagPosts = async ({ pageParam = null }) => {
    const res = await api.get(`/api/hashtags/${tag}/posts`, {
      params: { cursor: pageParam, limit: 15 }
    })
    return res.data.data
  }

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteScroll(`hashtag_${tag}`, fetchHashtagPosts)

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

  const hashtagData = data?.pages[0]?.hashtag
  const posts = data?.pages.flatMap(page => page.items) || []

  if (isError) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto pt-20 px-4 text-center">
          <h2 className="text-2xl font-bold font-heading text-primary mb-2">Hashtag not found</h2>
          <p className="text-secondary mb-6">No posts found with #{tag}.</p>
          <button onClick={() => navigate(-1)} className="text-accent hover:underline">Go Back</button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto pb-24 pt-6 px-4 sm:px-0">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-accent-subtle flex items-center justify-center text-accent font-bold text-3xl">
            #
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-primary">#{tag}</h1>
            {!isLoading && hashtagData && (
              <p className="text-secondary font-medium">{hashtagData.postCount} posts</p>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center py-10 text-secondary">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-secondary">No posts found for this hashtag.</div>
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
