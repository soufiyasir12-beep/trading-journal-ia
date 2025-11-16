'use client'

import { ArrowUp, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface VoteButtonProps {
  type: 'upvote' | 'downvote'
  active: boolean
  onClick: () => void
  disabled?: boolean
}

export default function VoteButton({ type, active, onClick, disabled }: VoteButtonProps) {
  const Icon = type === 'upvote' ? ArrowUp : ArrowDown
  const colorClass = active
    ? type === 'upvote'
      ? 'text-[var(--success)] bg-[var(--success)]/20'
      : 'text-[var(--danger)] bg-[var(--danger)]/20'
    : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors ${colorClass} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  )
}

