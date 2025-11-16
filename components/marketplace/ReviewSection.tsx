'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, User, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Review {
  id: string
  rating: number
  comment?: string
  created_at: string
  user_id: string
}

interface ReviewSectionProps {
  strategyId: string
  reviews: Review[]
}

export default function ReviewSection({ strategyId, reviews: initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUser()
    fetchReviews()
  }, [strategyId])

  const fetchUser = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    setUser(currentUser)

    if (currentUser) {
      const userReview = reviews.find((r) => r.user_id === currentUser.id)
      if (userReview) {
        setUserReview(userReview)
        setRating(userReview.rating)
        setComment(userReview.comment || '')
      }
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/marketplace/${strategyId}/reviews`)
      const result = await response.json()
      if (response.ok) {
        setReviews(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/marketplace/${strategyId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      })

      const result = await response.json()

      if (response.ok) {
        await fetchReviews()
        await fetchUser()
        if (!userReview) {
          setComment('')
        }
      } else {
        alert(result.error || 'Error submitting review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error submitting review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !userReview) return
    if (!confirm('Are you sure you want to delete your review?')) return

    try {
      const response = await fetch(`/api/marketplace/${strategyId}/reviews`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchReviews()
        await fetchUser()
        setUserReview(null)
        setRating(5)
        setComment('')
      } else {
        alert('Error deleting review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Error deleting review')
    }
  }

  if (!user) {
    return (
      <div className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]">
        <p className="text-[var(--text-secondary)]">Please log in to view and write reviews.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Reviews</h2>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Your Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-[var(--text-secondary)]'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your thoughts about this strategy..."
            className="w-full px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
          </button>
          {userReview && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg font-medium hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      User
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-[var(--text-secondary)] mt-2">{review.comment}</p>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-center text-[var(--text-secondary)] py-8">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  )
}

