'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayChildren(children)
    }, 30)

    return () => clearTimeout(timer)
  }, [pathname, children])

  const transition = {
    type: 'spring' as const,
    stiffness: 400,
    damping: 35,
    duration: 0.15,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={transition}
        className="h-full"
      >
        {displayChildren}
      </motion.div>
    </AnimatePresence>
  )
}


