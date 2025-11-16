'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import ThreadCard from '@/components/community/ThreadCard'
import CreatePostModal from '@/components/community/CreatePostModal'
import { supabase } from '@/lib/supabaseClient'

const categoryLabels: Record<string, { name: string; description: string }> = {
  strategies: {
    name: 'Strategies',
    description: 'Share and discuss trading strategies',
  },
  psychology: {
    name: 'Psychology',
    description: 'Trading psychology and mindset',
  },
  performance: {
    name: 'Performance',
    description: 'Performance analysis and improvement',
  },
  funding_challenges: {
    name: 'Funding Challenges',
    description: 'Prop firm challenges and funding',
  },
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const category = params.category as string
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchUser()
    fetchPosts()

    // Set up real-time subscription
    const channel = supabase
      .channel(`category-posts-${category}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `category=eq.${category}`,
        },
        () => {
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [category])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchPosts = async (reset = false) => {
    if (reset) {
      setPage(0)
      setPosts([])
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/community/posts?category=${category}&limit=20&offset=${page * 20}`
      )
      if (response.ok) {
        const data = await response.json()
        const newPosts = data.posts || []
        
        if (reset) {
          setPosts(newPosts)
        } else {
          setPosts((prev) => [...prev, ...newPosts])
        }
        
        setHasMore(newPosts.length === 20)
        if (!reset) setPage((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categoryInfo = categoryLabels[category] || { name: category, description: '' }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push('/community')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              {categoryInfo.name}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {categoryInfo.description}
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
      </div>

      {/* Posts List */}
      {isLoading && posts.length === 0 ? (
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
          <p className="text-[var(--text-secondary)] mb-4">
            No posts in this category yet. Be the first to post!
          </p>
          {currentUser && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create First Post
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ThreadCard post={post} currentUserId={currentUser?.id} />
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchPosts()}
                disabled={isLoading}
                className="px-6 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--card-border)] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        category={category}
        onSuccess={() => {
          fetchPosts(true)
          setIsCreateModalOpen(false)
        }}
      />
    </div>
  )
}

