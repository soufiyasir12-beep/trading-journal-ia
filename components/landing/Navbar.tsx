'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LandingNavbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'glass-nav py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <Link href="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold text-lg">
                N
              </span>
              <span>NeuroStrat</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Características', 'IA', 'Precios'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-[var(--text-secondary)] transition-all hover:text-[var(--primary)]"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="text-sm font-medium text-white transition-all hover:text-[var(--secondary)]"
            >
              Iniciar Sesión
            </Link>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/register')}
              className="rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all cursor-pointer border border-white/10"
            >
              Empieza Gratis
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 mt-4 py-4 space-y-4 bg-[#05080f]/95 backdrop-blur-xl rounded-xl border border-white/5"
          >
            {['Características', 'IA', 'Precios'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-[var(--text-secondary)] hover:text-white px-4 py-2 hover:bg-white/5"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-white hover:text-[var(--secondary)] px-4 py-2"
            >
              Iniciar Sesión
            </Link>
            <div className="px-4 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push('/auth/register')
                }}
                className="w-full rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-6 py-3 text-sm font-bold text-white cursor-pointer shadow-lg"
              >
                Empieza Gratis
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
