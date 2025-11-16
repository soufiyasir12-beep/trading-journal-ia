'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  category?: string
  onSuccess?: () => void
}

const categories = [
  { value: 'strategies', label: 'Strategies' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'performance', label: 'Performance' },
  { value: 'funding_challenges', label: 'Funding Challenges' },
]

export default function CreatePostModal({ isOpen, onClose, category, onSuccess }: CreatePostModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(category || 'strategies')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create post')
      }

      // Reset form
      setTitle('')
      setContent('')
      setSelectedCategory(category || 'strategies')
      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Create New Post</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-[var(--card-border)] rounded transition-colors"
                >
                  <X className="h-5 w-5 text-[var(--text-secondary)]" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {error && (
                  <div className="p-3 bg-[var(--danger)]/20 text-[var(--danger)] rounded text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`p-2 rounded border text-sm transition-colors ${
                          selectedCategory === cat.value
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'bg-[var(--background)] border-[var(--card-border)] text-[var(--text-primary)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title..."
                    className="w-full p-2 bg-[var(--background)] border border-[var(--card-border)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content..."
                    rows={10}
                    className="w-full p-2 bg-[var(--background)] border border-[var(--card-border)] rounded text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-[var(--card-bg)] text-[var(--text-secondary)] rounded font-medium hover:bg-[var(--card-border)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className="px-4 py-2 bg-[var(--accent)] text-white rounded font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Post'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

