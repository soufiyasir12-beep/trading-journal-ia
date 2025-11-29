'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import ThemeSelector from './ThemeSelector'
import NotificationBell from './community/NotificationBell'

export default function Navbar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 100, damping: 20 }}
      className="flex h-16 items-center justify-between border-b border-[var(--navbar-border)] bg-[var(--navbar-bg)]/80 backdrop-blur-md px-6 shadow-sm sticky top-0 z-40"
    >
      <div className="flex items-center gap-4">
        <motion.h2
          className="text-xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          NeuroStrat
        </motion.h2>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <ThemeSelector />
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/50 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

