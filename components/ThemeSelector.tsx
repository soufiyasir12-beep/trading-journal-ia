'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function ThemeSelector() {
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] transition-all hover:scale-110 hover:shadow-md"
        aria-label="Toggle theme"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, type: 'tween' as const }}
        >
          <Palette className="h-5 w-5" />
        </motion.div>
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div
              key="theme-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, type: 'tween' as const }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              key="theme-menu"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, type: 'tween' as const }}
              className="absolute right-0 top-12 z-50 w-48 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl p-2"
            >
              <button
                onClick={() => {
                  toggleTheme()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="h-5 w-5" />
                    <span>Modo Oscuro</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-5 w-5" />
                    <span>Modo Claro</span>
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}


