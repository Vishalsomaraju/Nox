import React, { useRef, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useAuth from '../hooks/useAuth'
import api from '../services/api'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import PageTransition from '../components/ui/PageTransition'
import ProfileHeader from '../components/profile/ProfileHeader'
import PhotoGrid from '../components/profile/PhotoGrid'
import Button from '../components/ui/Button'

export default function ProfilePage() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  
  const isOwnProfile = currentUser?.username === username

  const { data: profile, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const res = await api.get(`/api/users/${username}`)
      return res.data.data
    },
    retry: false
  })

  const fetchUserPosts = async ({ pageParam = null }) => {
    const res = await api.get(`/api/posts/user/${username}`, {
      params: { cursor: pageParam, limit: 12 }
    })
    return res.data.data
  }

  const {
    data: postsData,
    isLoading: isPostsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteScroll(`userPosts_${username}`, fetchUserPosts)

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

  const posts = postsData?.pages.flatMap(page => page.items) || []

  if (isProfileLoading) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto pt-10 px-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-24 h-24 bg-elevated rounded-full mb-4"></div>
            <div className="w-48 h-6 bg-elevated rounded mb-2"></div>
            <div className="w-32 h-4 bg-elevated rounded"></div>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (isProfileError || !profile) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto pt-20 px-4 text-center">
          <h2 className="text-2xl font-bold font-heading text-primary mb-2">User not found</h2>
          <p className="text-secondary mb-6">The profile you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto pb-24">
        <ProfileHeader 
          profile={profile} 
          isOwnProfile={isOwnProfile} 
          onEditClick={() => navigate('/settings')} 
        />
        
        <div className="mt-8">
          {/* Tab bar simple version */}
          <div className="flex justify-center border-b border-border mb-6">
            <button className="px-8 py-3 font-heading font-bold text-primary border-b-2 border-accent">
              POSTS
            </button>
          </div>

          <div className="px-2 md:px-0">
            {isPostsLoading ? (
              <div className="text-center py-10 text-secondary">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-bold text-primary mb-1">No Posts Yet</h3>
                <p className="text-secondary">{isOwnProfile ? "You haven't posted anything." : `@${profile.username} hasn't posted anything.`}</p>
              </div>
            ) : (
              <PhotoGrid posts={posts} />
            )}
            
            <div ref={loadMoreRef} className="py-8 text-center">
              {isFetchingNextPage && <div className="text-secondary text-sm">Loading more...</div>}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
