'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Reply, ArrowUp, ArrowDown, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import VoteButton from './VoteButton'

interface Profile {
  id: string
  username: string
  avatar_url?: string
  role?: string
  trading_style_tags?: string[]
}

interface Comment {
  id: string
  user_id: string
  content: string
  upvotes: number
  downvotes: number
  created_at: string
  profiles?: Profile | null
  replies?: Comment[]
}

interface CommentTreeProps {
  comment: Comment
  currentUserId?: string
  postId: string
  onReply?: (parentId: string, content: string) => void
  depth?: number
}

export default function CommentTree({
  comment,
  currentUserId,
  postId,
  onReply,
  depth = 0,
}: CommentTreeProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [upvotes, setUpvotes] = useState(comment.upvotes)
  const [downvotes, setDownvotes] = useState(comment.downvotes)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          comment_id: comment.id,
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

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onReply) return

    setIsSubmitting(true)
    try {
      await onReply(comment.id, replyContent)
      setReplyContent('')
      setShowReplyForm(false)
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const profile = comment.profiles
  const score = upvotes - downvotes
  const maxDepth = 3

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-[var(--card-border)] pl-4' : ''}`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 mb-3"
      >
        <div className="flex gap-3">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-1">
            <VoteButton
              type="upvote"
              active={userVote === 'upvote'}
              onClick={() => handleVote('upvote')}
              disabled={!currentUserId}
            />
            <span className={`text-xs font-semibold ${score >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
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
            <div className="flex items-center gap-2 mb-2">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs text-white">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="font-medium text-[var(--text-primary)]">
                {profile?.username || 'Anonymous'}
              </span>
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
              <span className="text-xs text-[var(--text-secondary)]">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>

            <p className="text-sm text-[var(--text-primary)] mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>

            {currentUserId && depth < maxDepth && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-[var(--card-border)]"
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 bg-[var(--background)] border border-[var(--card-border)] rounded text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="px-3 py-1.5 bg-[var(--accent)] text-white rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  onClick={() => {
                    setShowReplyForm(false)
                    setReplyContent('')
                  }}
                  className="px-3 py-1.5 bg-[var(--card-bg)] text-[var(--text-secondary)] rounded text-sm font-medium hover:bg-[var(--card-border)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentTree
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              postId={postId}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

