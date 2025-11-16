'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let channel: any = null

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        fetchNotifications()
        fetchUnreadCount()

        // Set up real-time subscription
        channel = supabase
          .channel('notifications')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
            },
            () => {
              fetchNotifications()
              fetchUnreadCount()
            }
          )
          .subscribe()
      }
    }

    checkUser()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/community/notifications?limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const response = await fetch('/api/community/notifications?unread_only=true&limit=1')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/community/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId }),
      })
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/community/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all_read: true }),
      })
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const formatNotificationMessage = (notification: any) => {
    const username = notification.related_user?.username || 'Someone'
    const postTitle = notification.related_post?.title || 'a post'

    switch (notification.type) {
      case 'post_reply':
        return `${username} commented on your post "${postTitle}"`
      case 'comment_reply':
        return `${username} replied to your comment`
      case 'post_upvote':
        return `${username} upvoted your post "${postTitle}"`
      case 'comment_upvote':
        return `${username} upvoted your comment`
      case 'new_follower':
        return `${username} started following you`
      default:
        return notification.message || 'New notification'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[var(--card-bg)] rounded transition-colors"
      >
        <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-5 h-5 bg-[var(--danger)] text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col"
            >
              <div className="p-3 border-b border-[var(--card-border)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                {isLoading ? (
                  <div className="p-4 text-center text-[var(--text-secondary)]">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-[var(--text-secondary)]">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                        setIsOpen(false)
                        // Navigate to related post if available
                        if (notification.related_post_id) {
                          window.location.href = `/community/thread/${notification.related_post_id}`
                        }
                      }}
                      className={`p-3 border-b border-[var(--card-border)] cursor-pointer hover:bg-[var(--background)] transition-colors ${
                        !notification.is_read ? 'bg-[var(--accent)]/10' : ''
                      }`}
                    >
                      <p className="text-sm text-[var(--text-primary)]">
                        {formatNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

