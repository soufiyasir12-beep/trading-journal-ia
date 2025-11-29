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
  Brain,
} from 'lucide-react'
import { motion } from 'framer-motion'

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
      className="flex h-full w-64 flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border-r border-[var(--card-border)]"
    >
      <motion.div
        className="flex h-20 items-center px-6 cursor-pointer gap-3"
        whileHover={{ scale: 1.02 }}
        onClick={() => router.push('/')}
      >
        <Brain className="h-8 w-8 text-[var(--accent)]" />
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-wide">
          NeuroStrat
        </h1>
      </motion.div>

      <nav className="flex-1 space-y-2 px-4 py-6">
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
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all relative w-full text-left cursor-pointer ${isActive || pathname.startsWith(item.href + '/')
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--sidebar-text)] hover:text-[var(--text-primary)]'
                  }`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <item.icon
                    className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`}
                  />
                  {item.name}
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 380, damping: 30 }}
                  />
                )}

                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--accent)] rounded-r-full"
                    layoutId="activeIndicator"
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

