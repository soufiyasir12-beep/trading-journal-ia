'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import CommentTree from '@/components/community/CommentTree'
import VoteButton from '@/components/community/VoteButton'
import { supabase } from '@/lib/supabaseClient'

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = params.id as string
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [upvotes, setUpvotes] = useState(0)
  const [downvotes, setDownvotes] = useState(0)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)

  useEffect(() => {
    fetchUser()
    fetchPost()
    fetchComments()
    fetchUserVote()

    // Set up real-time subscriptions
    const postChannel = supabase
      .channel(`post-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${threadId}`,
        },
        () => {
          fetchPost()
        }
      )
      .subscribe()

    const commentsChannel = supabase
      .channel(`comments-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${threadId}`,
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(postChannel)
      supabase.removeChannel(commentsChannel)
    }
  }, [threadId])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/community/posts/${threadId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        setUpvotes(data.post.upvotes || 0)
        setDownvotes(data.post.downvotes || 0)
      } else if (response.status === 404) {
        router.push('/community')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/community/comments?post_id=${threadId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const fetchUserVote = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/community/votes?post_id=${threadId}`)
      if (response.ok) {
        const data = await response.json()
        const vote = data.votes?.[0]
        if (vote) {
          setUserVote(vote.vote_type)
        }
      }
    } catch (error) {
      console.error('Error fetching user vote:', error)
    }
  }

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUser) return

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
          post_id: threadId,
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

  const handleSubmitComment = async (parentId: string | null, content: string) => {
    if (!content.trim()) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: threadId,
          content: content.trim(),
          parent_id: parentId || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      setCommentContent('')
      fetchComments()
      fetchPost() // Update comment count
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Failed to post comment. Please try again.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReply = async (parentId: string, content: string) => {
    await handleSubmitComment(parentId, content)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-[var(--text-secondary)]">Post not found</p>
        <button
          onClick={() => router.push('/community')}
          className="mt-4 px-4 py-2 bg-[var(--accent)] text-white rounded-lg"
        >
          Back to Community
        </button>
      </div>
    )
  }

  const profile = post.profiles
  const score = upvotes - downvotes
  const categoryLabels: Record<string, string> = {
    strategies: 'Strategies',
    psychology: 'Psychology',
    performance: 'Performance',
    funding_challenges: 'Funding Challenges',
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push(`/community/${post.category}`)}
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {categoryLabels[post.category] || post.category}
      </button>

      {/* Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 mb-6"
      >
        <div className="flex gap-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center gap-1">
            <VoteButton
              type="upvote"
              active={userVote === 'upvote'}
              onClick={() => handleVote('upvote')}
              disabled={!currentUser}
            />
            <span className={`text-lg font-semibold ${score >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {score}
            </span>
            <VoteButton
              type="downvote"
              active={userVote === 'downvote'}
              onClick={() => handleVote('downvote')}
              disabled={!currentUser}
            />
          </div>

          {/* Content Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded text-xs font-medium">
                {categoryLabels[post.category] || post.category}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              {post.title}
            </h1>

            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-[var(--card-border)]">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm text-white">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comments Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({post.comments_count || 0})
        </h2>

        {/* Comment Form */}
        {currentUser ? (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 bg-[var(--background)] border border-[var(--card-border)] rounded text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-3"
              rows={4}
            />
            <button
              onClick={() => handleSubmitComment(null, commentContent)}
              disabled={!commentContent.trim() || isSubmittingComment}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isSubmittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        ) : (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 mb-6 text-center">
            <p className="text-[var(--text-secondary)]">
              Please log in to comment
            </p>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentTree
                key={comment.id}
                comment={comment}
                currentUserId={currentUser?.id}
                postId={threadId}
                onReply={handleReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

