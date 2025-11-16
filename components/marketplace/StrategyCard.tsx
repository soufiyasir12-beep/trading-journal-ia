'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Star, DollarSign, TrendingUp, Clock, FileText } from 'lucide-react'

interface Strategy {
  id: string
  title: string
  description: string
  price: number
  rating: number
  rating_count: number
  purchase_count?: number
  pair?: string
  timeframe?: string
  strategy_type?: string
  winrate?: number
  complexity?: string
  tags?: string[]
  is_purchased?: boolean
  is_owner?: boolean
  created_at: string
}

interface StrategyCardProps {
  strategy: Strategy
  index: number
}

export default function StrategyCard({ strategy, index }: StrategyCardProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/marketplace/${strategy.id}`)}
      className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)] cursor-pointer hover:shadow-xl transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 line-clamp-2">
            {strategy.title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{strategy.description}</p>
        </div>
        {strategy.is_purchased && (
          <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-500 rounded-full">
            Owned
          </span>
        )}
        {strategy.is_owner && (
          <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-500 rounded-full">
            Yours
          </span>
        )}
      </div>

      {/* Tags */}
      {strategy.tags && strategy.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {strategy.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs bg-[var(--background)] border border-[var(--card-border)] rounded-full text-[var(--text-secondary)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {strategy.pair && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <TrendingUp className="h-4 w-4" />
            <span>{strategy.pair}</span>
          </div>
        )}
        {strategy.timeframe && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Clock className="h-4 w-4" />
            <span>{strategy.timeframe}</span>
          </div>
        )}
        {strategy.winrate && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <TrendingUp className="h-4 w-4" />
            <span>{strategy.winrate}% winrate</span>
          </div>
        )}
        {strategy.complexity && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <FileText className="h-4 w-4" />
            <span className="capitalize">{strategy.complexity}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {strategy.rating.toFixed(1)}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            ({strategy.rating_count})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[var(--text-secondary)]" />
          <span className="text-lg font-bold text-[var(--text-primary)]">
            {strategy.price === 0 ? 'Free' : `$${strategy.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

