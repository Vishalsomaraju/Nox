import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import api from '../services/api'
import PostCard from '../components/feed/PostCard'
import SkeletonCard from '../components/ui/SkeletonCard'
import StoryBar from '../components/story/StoryBar'
import PageTransition from '../components/ui/PageTransition'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function FeedPage() {
  const fetchPosts = async ({ pageParam = null }) => {
    const res = await api.get('/api/posts/feed', {
      params: { cursor: pageParam, limit: 10 }
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
  } = useInfiniteScroll('feed', fetchPosts)

  const loadMoreRef = useRef(null)

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data?.pages.flatMap(page => page.items) || []

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto pb-24 pt-4 px-4 sm:px-0">
        <StoryBar />
        
        <div className="mt-6 flex flex-col gap-6">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : isError ? (
            <div className="text-center py-10 text-secondary">
              <p>Failed to load feed.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-heading font-bold text-primary mb-2">Welcome to NOX</h2>
              <p className="text-secondary mb-6">Follow some people to see their posts here.</p>
              <Link to="/explore">
                <Button variant="primary">Explore NOX</Button>
              </Link>
            </div>
          ) : (
            <>
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
              <div ref={loadMoreRef} className="py-4 text-center">
                {isFetchingNextPage && <div className="text-secondary text-sm">Loading more...</div>}
                {!hasNextPage && posts.length > 0 && <div className="text-muted text-sm pb-10">You're all caught up.</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
