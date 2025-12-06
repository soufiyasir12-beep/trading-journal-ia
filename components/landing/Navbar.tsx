'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Brain } from 'lucide-react'
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
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-[#030014]/80 backdrop-blur-md border-b border-white/10 py-4 shadow-lg' : 'bg-transparent py-6'
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <Link href="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-lg opacity-20" />
                <div className="relative z-10 h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg border border-amber-400/20">
                  <Brain className="text-white w-6 h-6" />
                </div>
              </div>
              <span className="text-xl md:text-2xl">NeuroStrat</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {['Características', 'IA', 'Precios'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-bold text-gray-300 transition-all hover:text-amber-500 hover:scale-105"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="text-sm font-bold text-white transition-all hover:text-amber-500"
            >
              Iniciar Sesión
            </Link>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(245, 158, 11, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/register')}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-black shadow-lg transition-all cursor-pointer border border-white/10 hover:brightness-110"
            >
              Empieza Gratis
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-amber-500 transition-colors cursor-pointer"
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
                className="block text-sm font-medium text-gray-300 hover:text-white px-4 py-2 hover:bg-white/5"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-white hover:text-amber-500 px-4 py-2"
            >
              Iniciar Sesión
            </Link>
            <div className="px-4 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push('/auth/register')
                }}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-black cursor-pointer shadow-lg"
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
