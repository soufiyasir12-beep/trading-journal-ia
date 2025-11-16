'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Download,
  ShoppingCart,
  User,
  Calendar,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  Eye,
} from 'lucide-react'
import ReviewSection from '@/components/marketplace/ReviewSection'

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
  file_url?: string
  file_name?: string
  file_type?: string
  is_purchased?: boolean
  is_owner?: boolean
  user_id?: string
  created_at: string
  reviews?: any[]
}

export default function StrategyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchStrategy()
    }
  }, [params.id])

  const fetchStrategy = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/marketplace/${params.id}`)
      const result = await response.json()

      if (response.ok) {
        setStrategy(result.data)
      } else {
        router.push('/marketplace')
      }
    } catch (error) {
      console.error('Error fetching strategy:', error)
      router.push('/marketplace')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!strategy) return

    setPurchasing(true)
    try {
      const response = await fetch(`/api/marketplace/${strategy.id}/purchase`, {
        method: 'POST',
      })

      const result = await response.json()

      if (response.ok) {
        alert('Strategy purchased successfully!')
        fetchStrategy() // Refresh to show download button
      } else {
        alert(result.error || 'Error purchasing strategy')
      }
    } catch (error) {
      console.error('Error purchasing strategy:', error)
      alert('Error purchasing strategy')
    } finally {
      setPurchasing(false)
    }
  }

  const handleDownload = () => {
    if (strategy?.file_url) {
      window.open(strategy.file_url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!strategy) {
    return null
  }

  const canViewContent = strategy.is_purchased || strategy.is_owner || strategy.price === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={() => router.push('/marketplace')}
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy Header */}
          <div className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{strategy.title}</h1>
                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Author</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(strategy.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  {strategy.rating.toFixed(1)}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  ({strategy.rating_count} reviews)
                </span>
              </div>
            </div>

            <p className="text-[var(--text-primary)] mb-6">{strategy.description}</p>

            {/* Tags */}
            {strategy.tags && strategy.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {strategy.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[var(--background)] border border-[var(--card-border)] rounded-full text-sm text-[var(--text-secondary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Strategy Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {strategy.pair && (
                <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Pair</p>
                  <p className="font-semibold text-[var(--text-primary)]">{strategy.pair}</p>
                </div>
              )}
              {strategy.timeframe && (
                <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Timeframe</p>
                  <p className="font-semibold text-[var(--text-primary)]">{strategy.timeframe}</p>
                </div>
              )}
              {strategy.strategy_type && (
                <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Type</p>
                  <p className="font-semibold text-[var(--text-primary)] capitalize">
                    {strategy.strategy_type}
                  </p>
                </div>
              )}
              {strategy.complexity && (
                <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Complexity</p>
                  <p className="font-semibold text-[var(--text-primary)] capitalize">
                    {strategy.complexity}
                  </p>
                </div>
              )}
              {strategy.winrate && (
                <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Winrate</p>
                  <p className="font-semibold text-[var(--text-primary)]">{strategy.winrate}%</p>
                </div>
              )}
            </div>

            {/* Preview or Content */}
            {canViewContent ? (
              <div className="space-y-4">
                {strategy.file_url && (
                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download Strategy File
                  </button>
                )}
                {strategy.preview_text && (
                  <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-2">Strategy Preview</h3>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                      {strategy.preview_text}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {strategy.preview_text && (
                  <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-[var(--text-secondary)]" />
                      <h3 className="font-semibold text-[var(--text-primary)]">Preview</h3>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap line-clamp-6">
                      {strategy.preview_text}
                    </p>
                  </div>
                )}
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {purchasing ? 'Processing...' : strategy.price === 0 ? 'Get Free Strategy' : `Purchase for $${strategy.price.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <ReviewSection strategyId={strategy.id} reviews={strategy.reviews || []} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">
                {strategy.price === 0 ? 'Free' : `$${strategy.price.toFixed(2)}`}
              </div>
              <p className="text-sm text-[var(--text-secondary)]">One-time purchase</p>
            </div>
            {!canViewContent && (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? 'Processing...' : 'Purchase Now'}
              </button>
            )}
            {canViewContent && strategy.file_url && (
              <button
                onClick={handleDownload}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)] space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Rating</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {strategy.rating.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Reviews</span>
                <span className="font-semibold text-[var(--text-primary)]">{strategy.rating_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Purchases</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {strategy.purchase_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

