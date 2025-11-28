'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquare, TrendingUp, Brain, Target, Award, Image as ImageIcon } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('hot')

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          NeuroStrat Community
        </h1>
        <p className="text-[var(--text-secondary)]">
          El hub para traders profesionales. Comparte, aprende y crece.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Input Trigger */}
          {currentUser && (
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">
                {currentUser.email?.charAt(0).toUpperCase()}
              </div>
              <input
                type="text"
                placeholder="Crear publicación"
                className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer hover:bg-[var(--background)]/80"
                onClick={() => setIsCreateModalOpen(true)}
                readOnly
              />
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="p-2 text-[var(--text-secondary)] hover:bg-[var(--background)] rounded-full transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Sort Tabs */}
          <div className="flex items-center gap-4 border-b border-[var(--card-border)] pb-2">
            {['hot', 'new', 'top'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${activeTab === tab
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg">
              <MessageSquare className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">No hay publicaciones aún. ¡Sé el primero!</p>
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

        {/* Sidebar (Right Column) */}
        <div className="hidden lg:block space-y-6">
          {/* About Community Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 sticky top-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-12 rounded-t-lg -mx-4 -mt-4 mb-4" />
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Sobre la Comunidad</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Bienvenido a la comunidad oficial de NeuroStrat. Aquí discutimos estrategias, psicología y compartimos análisis de mercado.
            </p>
            <div className="flex flex-col gap-2 border-t border-[var(--card-border)] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Miembros</span>
                <span className="font-semibold text-[var(--text-primary)]">1.2k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Online</span>
                <span className="font-semibold text-[var(--success)] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                  42
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full mt-4 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white font-bold py-2 px-4 rounded-full transition-all shadow-lg shadow-[var(--accent)]/20"
            >
              Crear Publicación
            </button>
          </div>

          {/* Categories/Flairs Widget */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4">
            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Categorías
            </h3>
            <div className="flex flex-col gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Link
                    key={category.id}
                    href={`/community/${category.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--background)] transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {category.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Rules Widget */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4">
            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Reglas
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-secondary)]">
              <li>Sé respetuoso con todos.</li>
              <li>No spam ni autopromoción.</li>
              <li>Comparte análisis con contexto.</li>
              <li>Mantén el tema de trading.</li>
            </ol>
          </div>
        </div>
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

