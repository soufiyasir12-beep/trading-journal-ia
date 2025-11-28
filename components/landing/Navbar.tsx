'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function LandingNavbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 z-50 w-full glass-nav"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(112,66,248,0.5)]">
              NeuroStrat
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Características', 'IA', 'Precios'].map((item, index) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-gray-300 transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-300 transition-all hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            >
              Iniciar Sesión
            </Link>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(112, 66, 248, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/register')}
              className="rounded-lg bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] px-6 py-2 text-sm font-bold text-white shadow-lg transition-all cursor-pointer border border-white/10"
            >
              Empieza Gratis
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors cursor-pointer"
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
            className="md:hidden border-t border-white/10 py-4 space-y-4 bg-[#030014]/95 backdrop-blur-xl"
          >
            {['Características', 'IA', 'Precios'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-gray-300 hover:text-white px-4"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-gray-300 hover:text-white px-4"
            >
              Iniciar Sesión
            </Link>
            <div className="px-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push('/auth/register')
                }}
                className="w-full rounded-lg bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] px-6 py-2 text-sm font-bold text-white cursor-pointer shadow-[0_0_15px_rgba(112,66,248,0.3)]"
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

