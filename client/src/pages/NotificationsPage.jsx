import React, { useEffect, useRef } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import api from '../services/api'
import PageTransition from '../components/ui/PageTransition'
import NotificationItem from '../components/notifications/NotificationItem'
import Button from '../components/ui/Button'
import useNotificationStore from '../store/notificationStore'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { markAllRead: markAllReadStore } = useNotificationStore()

  const fetchNotifications = async ({ pageParam = null }) => {
    const res = await api.get('/api/notifications', {
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
  } = useInfiniteScroll('notifications', fetchNotifications)

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

  const notifications = data?.pages.flatMap(page => page.items) || []

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/api/notifications/read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      markAllReadStore()
      toast.success('All marked as read')
    }
  })

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto pb-24 pt-6 px-4 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-primary">Notifications</h2>
          {notifications.some(n => !n.read) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="flex flex-col">
          {isLoading ? (
            <div className="text-center py-10 text-secondary">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-bold text-primary mb-1">All caught up</h3>
              <p className="text-secondary">You don't have any notifications right now.</p>
            </div>
          ) : (
            <>
              {notifications.map(notif => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
              <div ref={loadMoreRef} className="py-8 text-center">
                {isFetchingNextPage && <div className="text-secondary text-sm">Loading more...</div>}
                {!hasNextPage && notifications.length > 0 && <div className="text-muted text-sm pb-10">End of notifications.</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
