import React, { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import api from '../services/api'
import PostCard from '../components/feed/PostCard'
import SkeletonCard from '../components/ui/SkeletonCard'
import PageTransition from '../components/ui/PageTransition'
import Avatar from '../components/ui/Avatar'
import FollowButton from '../components/ui/FollowButton'
import { useQuery } from '@tanstack/react-query'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch trending hashtags
  const { data: trendingHashtags } = useQuery({
    queryKey: ['trendingHashtags'],
    queryFn: async () => {
      const res = await api.get('/api/hashtags/trending')
      return res.data.data
    }
  })

  // Search users if query exists
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['searchUsers', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return []
      const res = await api.get('/api/users/search', { params: { q: debouncedSearch } })
      return res.data.data
    },
    enabled: !!debouncedSearch
  })

  // Infinite scroll for explore feed
  const fetchExplorePosts = async ({ pageParam = null }) => {
    const res = await api.get('/api/posts/explore', {
      params: { cursor: pageParam, limit: 10 }
    })
    return res.data.data
  }

  const {
    data: exploreData,
    isLoading: isExploreLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteScroll('explore', fetchExplorePosts)

  const loadMoreRef = useRef(null)

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || debouncedSearch) return
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, debouncedSearch])

  const posts = exploreData?.pages.flatMap(page => page.items) || []

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto pb-24 pt-6 px-4 sm:px-0">
        
        {/* Search Bar */}
        <div className="mb-8 relative">
          <svg className="w-5 h-5 absolute left-4 top-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search users or #hashtags" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-elevated border border-border rounded-full py-3 pl-12 pr-4 text-primary focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
          />
        </div>

        {debouncedSearch ? (
          /* Search Results */
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-primary mb-4">Users</h3>
            {isSearchLoading ? (
              <div className="text-center py-4 text-secondary">Searching...</div>
            ) : searchResults?.length > 0 ? (
              searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-surface rounded-card border border-border">
                  <Link to={`/profile/${user.username}`} className="flex items-center gap-3">
                    <Avatar src={user.avatarUrl} username={user.username} size="md" />
                    <div>
                      <p className="font-heading font-bold text-primary">{user.displayName}</p>
                      <p className="text-secondary text-sm">@{user.username}</p>
                    </div>
                  </Link>
                  <FollowButton userId={user.id} isFollowing={false} /> {/* Need real follow state here but keeping it simple for now */}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-secondary">No users found for "{debouncedSearch}"</div>
            )}
            
            <h3 className="font-heading font-bold text-lg text-primary mt-8 mb-4">Hashtags</h3>
            <Link to={`/hashtag/${debouncedSearch.replace('#', '')}`} className="flex items-center gap-3 p-4 bg-surface rounded-card border border-border hover:bg-elevated transition-colors">
              <div className="w-10 h-10 rounded-full bg-accent-subtle flex items-center justify-center text-accent font-bold text-lg">#</div>
              <div>
                <p className="font-heading font-bold text-primary">#{debouncedSearch.replace('#', '')}</p>
                <p className="text-secondary text-sm">View posts</p>
              </div>
            </Link>
          </div>
        ) : (
          <>
            {/* Trending Hashtags */}
            {trendingHashtags && trendingHashtags.length > 0 && (
              <div className="mb-8">
                <h3 className="font-heading font-bold text-lg text-primary mb-4">Trending</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.map(tag => (
                    <Link key={tag.id} to={`/hashtag/${tag.name}`} className="px-4 py-2 bg-surface border border-border hover:bg-elevated hover:border-accent/50 rounded-pill text-primary text-sm font-medium transition-colors">
                      #{tag.name} <span className="text-muted ml-1 text-xs">{tag.postCount}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Explore Feed */}
            <h3 className="font-heading font-bold text-lg text-primary mb-4">Discover</h3>
            <div className="mt-4 flex flex-col gap-6">
              {isExploreLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : posts.length === 0 ? (
                <div className="text-center py-10 text-secondary">No posts found to discover.</div>
              ) : (
                <>
                  {posts.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i} />
                  ))}
                  <div ref={loadMoreRef} className="py-4 text-center">
                    {isFetchingNextPage && <div className="text-secondary text-sm">Loading more...</div>}
                    {!hasNextPage && posts.length > 0 && <div className="text-muted text-sm pb-10">You've seen everything!</div>}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
