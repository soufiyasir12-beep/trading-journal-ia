'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquare, TrendingUp, Brain, Target, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import ThreadCard from '@/components/community/ThreadCard'
import CreatePostModal from '@/components/community/CreatePostModal'
import { supabase } from '@/lib/supabaseClient'

const categories = [
  {
    id: 'strategies',
    name: 'Strategies',
    icon: Target,
    description: 'Share and discuss trading strategies',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'psychology',
    name: 'Psychology',
    icon: Brain,
    description: 'Trading psychology and mindset',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: TrendingUp,
    description: 'Performance analysis and improvement',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'funding_challenges',
    name: 'Funding Challenges',
    icon: Award,
    description: 'Prop firm challenges and funding',
    color: 'from-orange-500 to-amber-500',
  },
]

export default function CommunityPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchUser()
    fetchPosts()

    // Set up real-time subscription
    const channel = supabase
      .channel('community-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/community/posts?limit=20')
      if (response.ok) {
        const data = await response.json()
        const allPosts = data.posts || []
        // Remove duplicates by ID
        const uniquePosts = Array.from(
          new Map(allPosts.map((post: any) => [post.id, post])).values()
        )
        setPosts(uniquePosts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              NeuroStrat Community
            </h1>
            <p className="text-[var(--text-secondary)]">
              Connect with traders, share strategies, and grow together
            </p>
          </div>
          {currentUser && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              New Post
            </button>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/community/${category.id}`}
                  className="block p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg hover:border-[var(--accent)] transition-all group"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {category.description}
                  </p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
          Recent Posts
        </h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg">
            <MessageSquare className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={`${post.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ThreadCard post={post} currentUserId={currentUser?.id} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchPosts()
          setIsCreateModalOpen(false)
        }}
      />
    </div>
  )
}

