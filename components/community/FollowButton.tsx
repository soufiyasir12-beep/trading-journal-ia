'use client'

import { useState, useEffect } from 'react'
import { UserPlus, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface FollowButtonProps {
  userId: string
  currentUserId?: string
  initialFollowing?: boolean
}

export default function FollowButton({ userId, currentUserId, initialFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentUserId && userId !== currentUserId) {
      checkFollowStatus()
    }
  }, [currentUserId, userId])

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/community/follows?user_id=${userId}&type=following`)
      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing || false)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollow = async () => {
    if (!currentUserId || userId === currentUserId) return

    setIsLoading(true)
    const previousState = isFollowing

    // Optimistic update
    setIsFollowing(!isFollowing)

    try {
      const response = await fetch('/api/community/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: userId }),
      })

      if (!response.ok) {
        // Revert on error
        setIsFollowing(previousState)
      } else {
        const data = await response.json()
        setIsFollowing(data.following)
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(previousState)
      console.error('Error following/unfollowing:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUserId || userId === currentUserId) {
    return null
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
        isFollowing
          ? 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] hover:bg-[var(--card-border)]'
          : 'bg-[var(--accent)] text-white hover:opacity-90'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </motion.button>
  )
}

