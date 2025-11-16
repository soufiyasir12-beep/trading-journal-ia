'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, DollarSign, Eye, EyeOff } from 'lucide-react'

interface UploadStrategyModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function UploadStrategyModal({ onClose, onSuccess }: UploadStrategyModalProps) {
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '0',
    is_published: false,
    is_private: true,
    pair: '',
    timeframe: '',
    strategy_type: '',
    winrate: '',
    complexity: '',
    tags: '',
    preview_text: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title || !formData.description) {
      setError('Title and description are required')
      return
    }

    setUploading(true)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('price', formData.price)
      data.append('is_published', formData.is_published.toString())
      data.append('is_private', formData.is_private.toString())
      if (formData.pair) data.append('pair', formData.pair)
      if (formData.timeframe) data.append('timeframe', formData.timeframe)
      if (formData.strategy_type) data.append('strategy_type', formData.strategy_type)
      if (formData.winrate) data.append('winrate', formData.winrate)
      if (formData.complexity) data.append('complexity', formData.complexity)
      if (formData.tags) data.append('tags', formData.tags)
      if (formData.preview_text) data.append('preview_text', formData.preview_text)
      if (file) data.append('file', file)

      const response = await fetch('/api/marketplace', {
        method: 'POST',
        body: data,
      })

      const result = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(result.error || 'Error uploading strategy')
      }
    } catch (error) {
      console.error('Error uploading strategy:', error)
      setError('Error uploading strategy')
    } finally {
      setUploading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl"
        >
          <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--card-border)] p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Upload Strategy</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors"
            >
              <X className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Strategy File (PDF or Text)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 px-4 py-3 border-2 border-dashed border-[var(--card-border)] rounded-lg cursor-pointer hover:border-amber-500 transition-colors flex items-center justify-center gap-2">
                  <Upload className="h-5 w-5 text-[var(--text-secondary)]" />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {file ? file.name : 'Choose file...'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Price (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Grid of filters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Trading Pair
                </label>
                <input
                  type="text"
                  value={formData.pair}
                  onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                  placeholder="e.g., EUR/USD"
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Timeframe
                </label>
                <input
                  type="text"
                  value={formData.timeframe}
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                  placeholder="e.g., 1h, 4h, 1d"
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Strategy Type
                </label>
                <select
                  value={formData.strategy_type}
                  onChange={(e) => setFormData({ ...formData, strategy_type: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select type</option>
                  <option value="scalping">Scalping</option>
                  <option value="intraday">Intraday</option>
                  <option value="swing">Swing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Complexity
                </label>
                <select
                  value={formData.complexity}
                  onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Winrate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.winrate}
                  onChange={(e) => setFormData({ ...formData, winrate: e.target.value })}
                  placeholder="e.g., 65"
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., trend following, breakout, momentum"
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Preview Text */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Preview Text (shown to non-buyers)
              </label>
              <textarea
                value={formData.preview_text}
                onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                rows={4}
                placeholder="A preview of your strategy that users can see before purchasing..."
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Publish Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--card-border)] text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-[var(--text-primary)]">Publish to marketplace</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_private}
                  onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--card-border)] text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-[var(--text-primary)]">Keep private (only you can see)</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload Strategy
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--card-bg)] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

