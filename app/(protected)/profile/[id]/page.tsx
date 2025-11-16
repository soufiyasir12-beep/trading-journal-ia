'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, TrendingUp, TrendingDown, Award, User, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import FollowButton from '@/components/community/FollowButton'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchUser()
    fetchProfile()
  }, [userId])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/community/profiles/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setStats(data.stats)
        setRecentPosts(data.recentPosts || [])
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-[var(--text-secondary)]">Profile not found</p>
      </div>
    )
  }

  const roleLabels: Record<string, { label: string; color: string }> = {
    user: { label: 'User', color: 'bg-gray-500/20 text-gray-400' },
    pro_trader: { label: 'Pro Trader', color: 'bg-amber-500/20 text-amber-400' },
    moderator: { label: 'Moderator', color: 'bg-purple-500/20 text-purple-400' },
  }

  const roleInfo = roleLabels[profile.role || 'user']

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 mb-6"
      >
        <div className="flex items-start gap-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-24 h-24 rounded-full border-2 border-[var(--card-border)]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center text-3xl text-white font-bold border-2 border-[var(--card-border)]">
              {profile.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                {profile.username}
              </h1>
              <span className={`px-2 py-1 rounded text-xs font-medium ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>

            {profile.bio && (
              <p className="text-[var(--text-secondary)] mb-4">{profile.bio}</p>
            )}

            {profile.trading_style_tags && profile.trading_style_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.trading_style_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="font-medium text-[var(--text-primary)]">
                  {profile.followers_count || 0}
                </span>
                <span>followers</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="font-medium text-[var(--text-primary)]">
                  {profile.following_count || 0}
                </span>
                <span>following</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium text-[var(--text-primary)]">
                  {profile.posts_count || 0}
                </span>
                <span>posts</span>
              </div>
            </div>
          </div>

          {currentUser && currentUser.id !== userId && (
            <FollowButton
              userId={userId}
              currentUserId={currentUser.id}
            />
          )}
        </div>
      </motion.div>

      {/* Stats Section */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-[var(--accent)]" />
              <span className="text-sm text-[var(--text-secondary)]">Total Trades</span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {stats.totalTrades || 0}
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-[var(--success)]" />
              <span className="text-sm text-[var(--text-secondary)]">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-[var(--success)]">
              {stats.winRate?.toFixed(1) || 0}%
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-[var(--success)]" />
              <span className="text-sm text-[var(--text-secondary)]">Wins</span>
            </div>
            <p className="text-2xl font-bold text-[var(--success)]">
              {stats.wins || 0}
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-[var(--danger)]" />
              <span className="text-sm text-[var(--text-secondary)]">Losses</span>
            </div>
            <p className="text-2xl font-bold text-[var(--danger)]">
              {stats.losses || 0}
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Recent Posts
          </h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/community/thread/${post.id}`}
                className="block p-3 bg-[var(--background)] border border-[var(--card-border)] rounded hover:border-[var(--accent)] transition-colors"
              >
                <h3 className="font-medium text-[var(--text-primary)] mb-1 line-clamp-1">
                  {post.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <span>{post.category}</span>
                  <span>↑ {post.upvotes}</span>
                  <span>↓ {post.downvotes}</span>
                  <span>{post.comments_count} comments</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

