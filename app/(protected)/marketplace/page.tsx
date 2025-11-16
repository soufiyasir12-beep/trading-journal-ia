'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Upload, Star, TrendingUp, Clock, DollarSign } from 'lucide-react'
import StrategyCard from '@/components/marketplace/StrategyCard'
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters'
import UploadStrategyModal from '@/components/marketplace/UploadStrategyModal'

interface Strategy {
  id: string
  title: string
  description: string
  price: number
  rating: number
  rating_count: number
  pair?: string
  timeframe?: string
  strategy_type?: string
  winrate?: number
  complexity?: string
  tags?: string[]
  preview_text?: string
  is_purchased?: boolean
  is_owner?: boolean
  user?: {
    id: string
    email: string
    raw_user_meta_data?: any
  }
  created_at: string
}

export default function MarketplacePage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [filters, setFilters] = useState({
    pair: '',
    timeframe: '',
    type: '',
    minWinrate: '',
    complexity: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  useEffect(() => {
    fetchStrategies()
  }, [filters, searchQuery])

  const fetchStrategies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.pair) params.append('pair', filters.pair)
      if (filters.timeframe) params.append('timeframe', filters.timeframe)
      if (filters.type) params.append('type', filters.type)
      if (filters.minWinrate) params.append('minWinrate', filters.minWinrate)
      if (filters.complexity) params.append('complexity', filters.complexity)
      if (searchQuery) params.append('search', searchQuery)
      params.append('sortBy', filters.sortBy)
      params.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/marketplace?${params.toString()}`)
      const result = await response.json()

      if (response.ok) {
        setStrategies(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching strategies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters })
  }

  const clearFilters = () => {
    setFilters({
      pair: '',
      timeframe: '',
      type: '',
      minWinrate: '',
      complexity: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    })
    setSearchQuery('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent">
            Strategies Marketplace
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Discover, buy, and share trading strategies from the community
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Strategy
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search strategies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--background)] transition-all flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filters Sidebar */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
        >
          <MarketplaceFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--card-border)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Strategies</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{strategies.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--card-border)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Avg Rating</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {strategies.length > 0
                  ? (strategies.reduce((acc, s) => acc + (s.rating || 0), 0) / strategies.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--card-border)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Free Strategies</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {strategies.filter((s) => s.price === 0).length}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--card-border)]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">New This Week</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {strategies.filter(
                  (s) => new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Strategies Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
          />
        </div>
      ) : strategies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy, index) => (
            <StrategyCard key={strategy.id} strategy={strategy} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
          <p className="text-[var(--text-secondary)]">No strategies found. Try adjusting your filters.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadStrategyModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false)
            fetchStrategies()
          }}
        />
      )}
    </motion.div>
  )
}

