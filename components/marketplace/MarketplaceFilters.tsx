'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface Filters {
  pair: string
  timeframe: string
  type: string
  minWinrate: string
  complexity: string
  sortBy: string
  sortOrder: string
}

interface MarketplaceFiltersProps {
  filters: Filters
  onChange: (filters: Partial<Filters>) => void
  onClear: () => void
}

const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'BTC/USD', 'ETH/USD']
const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w']
const types = ['scalping', 'intraday', 'swing']
const complexities = ['beginner', 'intermediate', 'advanced']
const sortOptions = [
  { value: 'created_at', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price', label: 'Price' },
  { value: 'purchase_count', label: 'Most Popular' },
]

export default function MarketplaceFilters({ filters, onChange, onClear }: MarketplaceFiltersProps) {
  const hasActiveFilters =
    filters.pair || filters.timeframe || filters.type || filters.minWinrate || filters.complexity

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pair Filter */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Trading Pair
          </label>
          <select
            value={filters.pair}
            onChange={(e) => onChange({ pair: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Pairs</option>
            {pairs.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Filter */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Timeframe
          </label>
          <select
            value={filters.timeframe}
            onChange={(e) => onChange({ timeframe: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Timeframes</option>
            {timeframes.map((tf) => (
              <option key={tf} value={tf}>
                {tf}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Strategy Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onChange({ type: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Complexity Filter */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Complexity
          </label>
          <select
            value={filters.complexity}
            onChange={(e) => onChange({ complexity: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Levels</option>
            {complexities.map((complexity) => (
              <option key={complexity} value={complexity}>
                {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Min Winrate Filter */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Min Winrate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.minWinrate}
            onChange={(e) => onChange({ minWinrate: e.target.value })}
            placeholder="e.g., 60"
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ sortBy: e.target.value })}
              className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => onChange({ sortOrder: e.target.value })}
              className="px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

