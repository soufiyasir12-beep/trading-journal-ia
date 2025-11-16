'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, ArrowUp, ArrowDown, Pin, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import VoteButton from './VoteButton'
import { supabase } from '@/lib/supabaseClient'

interface Profile {
  id: string
  username: string
  avatar_url?: string
  role?: string
  trading_style_tags?: string[]
}

interface ThreadCardProps {
  post: {
    id: string
    user_id: string
    title: string
    content: string
    category: string
    upvotes: number
    downvotes: number
    comments_count: number
    is_pinned: boolean
    is_locked: boolean
    created_at: string
    profiles?: Profile | null
  }
  currentUserId?: string
}

const categoryLabels: Record<string, string> = {
  strategies: 'Strategies',
  psychology: 'Psychology',
  performance: 'Performance',
  funding_challenges: 'Funding Challenges',
}

const categoryColors: Record<string, string> = {
  strategies: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  psychology: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  performance: 'bg-green-500/20 text-green-400 border-green-500/30',
  funding_challenges: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export default function ThreadCard({ post, currentUserId }: ThreadCardProps) {
  const [upvotes, setUpvotes] = useState(post.upvotes)
  const [downvotes, setDownvotes] = useState(post.downvotes)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUserId) return

    const previousVote = userVote
    const previousUpvotes = upvotes
    const previousDownvotes = downvotes

    // Optimistic update
    if (previousVote === voteType) {
      setUserVote(null)
      if (voteType === 'upvote') {
        setUpvotes(Math.max(0, upvotes - 1))
      } else {
        setDownvotes(Math.max(0, downvotes - 1))
      }
    } else if (previousVote) {
      setUserVote(voteType)
      if (previousVote === 'upvote') {
        setUpvotes(upvotes - 1)
        setDownvotes(downvotes + 1)
      } else {
        setUpvotes(upvotes + 1)
        setDownvotes(downvotes - 1)
      }
    } else {
      setUserVote(voteType)
      if (voteType === 'upvote') {
        setUpvotes(upvotes + 1)
      } else {
        setDownvotes(downvotes + 1)
      }
    }

    try {
      const response = await fetch('/api/community/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          vote_type: voteType,
        }),
      })

      if (!response.ok) {
        // Revert on error
        setUserVote(previousVote)
        setUpvotes(previousUpvotes)
        setDownvotes(previousDownvotes)
      } else {
        const data = await response.json()
        if (data.action === 'removed') {
          setUserVote(null)
        }
      }
    } catch (error) {
      // Revert on error
      setUserVote(previousVote)
      setUpvotes(previousUpvotes)
      setDownvotes(previousDownvotes)
    }
  }

  const score = upvotes - downvotes
  const profile = post.profiles
  const preview = post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 hover:border-[var(--accent)] transition-all ${
        post.is_pinned ? 'ring-2 ring-amber-500/50' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1">
          <VoteButton
            type="upvote"
            active={userVote === 'upvote'}
            onClick={() => handleVote('upvote')}
            disabled={!currentUserId}
          />
          <span className={`text-sm font-semibold ${score >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {score}
          </span>
          <VoteButton
            type="downvote"
            active={userVote === 'downvote'}
            onClick={() => handleVote('downvote')}
            disabled={!currentUserId}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {post.is_pinned && (
              <Pin className="h-4 w-4 text-amber-500 flex-shrink-0" />
            )}
            {post.is_locked && (
              <Lock className="h-4 w-4 text-[var(--text-secondary)] flex-shrink-0" />
            )}
            <Link
              href={`/community/thread/${post.id}`}
              className="flex-1 hover:text-[var(--accent)] transition-colors"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-2">
                {post.title}
              </h3>
            </Link>
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
            {preview}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <span className={`px-2 py-1 rounded text-xs font-medium border ${categoryColors[post.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
              {categoryLabels[post.category] || post.category}
            </span>

            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs text-white">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <Link
                href={`/profile/${profile?.id || post.user_id}`}
                className="hover:text-[var(--accent)] transition-colors"
              >
                {profile?.username || 'Anonymous'}
              </Link>
              {profile?.role === 'pro_trader' && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                  Pro
                </span>
              )}
              {profile?.role === 'moderator' && (
                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                  Mod
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </div>

            <span className="text-xs text-[var(--text-secondary)]">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

