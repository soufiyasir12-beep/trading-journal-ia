import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, ArrowUp, Pin, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import VoteButton from './VoteButton'

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
    } catch {
      // Revert on error
      setUserVote(previousVote)
      setUpvotes(previousUpvotes)
      setDownvotes(previousDownvotes)
    }
  }

  const score = upvotes - downvotes
  const profile = post.profiles
  const preview = post.content.length > 300 ? post.content.substring(0, 300) + '...' : post.content

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg hover:border-[var(--accent)] transition-all flex overflow-hidden ${post.is_pinned ? 'ring-1 ring-amber-500/50' : ''
        }`}
    >
      {/* Vote Column */}
      <div className="w-12 bg-[var(--background)]/50 flex flex-col items-center py-3 gap-1 border-r border-[var(--card-border)]">
        <VoteButton
          type="upvote"
          active={userVote === 'upvote'}
          onClick={() => handleVote('upvote')}
          disabled={!currentUserId}
        />
        <span className={`text-sm font-bold ${userVote === 'upvote' ? 'text-[var(--accent)]' :
          userVote === 'downvote' ? 'text-[var(--danger)]' :
            'text-[var(--text-primary)]'
          }`}>
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
      <div className="flex-1 p-3 min-w-0">
        {/* Header: Author, Time, Category */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full font-medium border ${categoryColors[post.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
            {categoryLabels[post.category] || post.category}
          </span>
          <span>•</span>
          <span>Posted by</span>
          <Link
            href={`/profile/${profile?.id || post.user_id}`}
            className="hover:text-[var(--text-primary)] font-medium transition-colors"
          >
            u/{profile?.username || 'Anonymous'}
          </Link>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
        </div>

        {/* Title & Content */}
        <Link href={`/community/thread/${post.id}`} className="block group">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors flex items-center gap-2">
            {post.title}
            {post.is_locked && <Lock className="h-4 w-4 text-[var(--text-secondary)]" />}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-3">
            {preview}
          </p>
        </Link>

        {/* Footer Actions */}
        <div className="flex items-center gap-4">
          <Link
            href={`/community/thread/${post.id}`}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs font-medium"
          >
            <MessageSquare className="h-4 w-4" />
            {post.comments_count} Comments
          </Link>
          <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs font-medium">
            <ArrowUp className="h-4 w-4 rotate-45" />
            Share
          </button>
        </div>
      </div>
    </motion.div>
  )
}

