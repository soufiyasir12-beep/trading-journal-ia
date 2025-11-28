'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Upload,
  Calendar,
  BarChart3,
  Store,
  MessageSquare,
  User,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Estrategias', href: '/strategy', icon: Upload },
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Community', href: '/community', icon: MessageSquare },
  { name: 'Trades', href: '/trades', icon: Calendar },
  { name: 'Analíticas', href: '/analysis', icon: BarChart3 },
  { name: 'Perfil', href: '/profile', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 100, damping: 20 }}
      className="flex h-full w-64 flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border-r border-[var(--card-border)] shadow-xl"
    >
      <motion.div
        className="flex h-16 items-center border-b border-[var(--card-border)] px-6 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        onClick={() => router.push('/')}
      >
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 bg-clip-text text-transparent animate-gradient">
          NeuroStrat
        </h1>
      </motion.div>
      <nav className="flex-1 space-y-2 px-3 py-4">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <motion.div
              key={item.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.03, type: 'spring' as const, stiffness: 200 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => handleNavigation(item.href)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative w-full text-left cursor-pointer ${isActive || pathname.startsWith(item.href + '/')
                  ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-white shadow-lg shadow-amber-500/50'
                  : 'text-[var(--sidebar-text)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)]'
                  }`}
              >
                <motion.div
                  animate={isActive ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.5, type: 'tween' as const, ease: 'easeInOut' }}
                >
                  <item.icon
                    className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`}
                  />
                </motion.div>
                {item.name}
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key={`activeTab-${item.href}`}
                      layoutId={`activeTab-${item.href}`}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 380, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute right-2 w-2 h-2 rounded-full bg-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                )}
              </button>
            </motion.div>
          )
        })}
      </nav>
    </motion.div>
  )
}

