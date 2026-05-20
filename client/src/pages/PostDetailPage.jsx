import React, { useRef, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import useAuth from '../hooks/useAuth'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import PageTransition from '../components/ui/PageTransition'
import PostCard from '../components/feed/PostCard'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { timeAgo } from '../utils/formatters'

export default function PostDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')

  // Fetch Post
  const { data: post, isLoading: isPostLoading, isError: isPostError } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await api.get(`/api/posts/${id}`)
      return res.data.data
    },
    retry: false
  })

  // Fetch Comments
  const fetchComments = async ({ pageParam = null }) => {
    const res = await api.get(`/api/posts/${id}/comments`, {
      params: { cursor: pageParam, limit: 15 }
    })
    return res.data.data
  }

  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteScroll(`comments_${id}`, fetchComments)

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

  const comments = commentsData?.pages.flatMap(page => page.items) || []

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content) => {
      const res = await api.post(`/api/posts/${id}/comments`, { content })
      return res.data.data
    },
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: [`comments_${id}`] })
      queryClient.invalidateQueries({ queryKey: ['post', id] }) // Update count
      toast.success('Comment added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add comment')
    }
  })

  // Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      await api.delete(`/api/comments/${commentId}`)
      return commentId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`comments_${id}`] })
      queryClient.invalidateQueries({ queryKey: ['post', id] })
      toast.success('Comment deleted')
    }
  })

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    addCommentMutation.mutate(commentText)
  }

  if (isPostLoading) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto pt-10 px-4">
          <div className="animate-pulse w-full h-96 bg-elevated rounded-card"></div>
        </div>
      </PageTransition>
    )
  }

  if (isPostError || !post) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto pt-20 px-4 text-center">
          <h2 className="text-2xl font-bold font-heading text-primary mb-2">Post not found</h2>
          <p className="text-secondary mb-6">This post may have been deleted or doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto pb-32 pt-4 px-4 sm:px-0">
        
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        {/* The Post itself */}
        <div className="mb-8 border-b border-border pb-6">
          <PostCard post={post} index={0} />
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <h3 className="font-heading font-bold text-xl text-primary mb-6">
            Comments <span className="text-muted text-base font-medium ml-1">({post._count?.comments || 0})</span>
          </h3>
          
          <div className="space-y-6">
            {isCommentsLoading ? (
              <div className="text-center py-4 text-secondary">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-secondary">
                No comments yet. Be the first to reply!
              </div>
            ) : (
              <AnimatePresence>
                {comments.map(comment => (
                  <motion.div 
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 group"
                  >
                    <Avatar src={comment.author.avatarUrl} username={comment.author.username} size="md" />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading font-bold text-primary">{comment.author.displayName}</span>
                          <span className="text-xs text-muted">@{comment.author.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{timeAgo(new Date(comment.createdAt))}</span>
                          {user?.id === comment.author.id && (
                            <button 
                              onClick={() => {
                                if (window.confirm('Delete comment?')) deleteCommentMutation.mutate(comment.id)
                              }}
                              className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-primary mt-1 whitespace-pre-wrap text-[15px]">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            <div ref={loadMoreRef} className="py-2 text-center">
              {isFetchingNextPage && <div className="text-secondary text-sm">Loading more...</div>}
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Comment Input */}
      <div className="fixed bottom-[72px] md:bottom-0 left-0 w-full bg-surface/80 backdrop-blur-xl border-t border-border z-10 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {user && <Avatar src={user.avatarUrl} username={user.username} size="md" />}
          <form onSubmit={handleSubmitComment} className="flex-1 flex gap-2">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="flex-1 bg-elevated border border-border rounded-full py-2.5 px-4 text-primary focus:outline-none focus:border-accent transition-colors"
            />
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!commentText.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? '...' : 'Post'}
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}
