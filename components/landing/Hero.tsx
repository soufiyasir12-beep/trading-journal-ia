'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, TrendingUp, BarChart3, Zap } from 'lucide-react'

export default function Hero() {
  const router = useRouter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32 min-h-screen flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[var(--neon-purple)] opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-[var(--neon-blue)] opacity-10 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] rounded-full blur opacity-75 animate-pulse" />
              <span className="relative inline-flex items-center gap-2 rounded-full bg-[#030014] border border-white/10 px-4 py-1.5 text-sm font-medium text-white">
                <Zap className="w-4 h-4 text-[var(--neon-blue)]" />
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Potenciado por IA v2.0
                </span>
              </span>
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-4 text-6xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl"
          >
            <span className="block drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Domina el Mercado
            </span>
            <span className="block mt-2 bg-gradient-to-r from-[var(--neon-blue)] via-[var(--neon-purple)] to-[var(--neon-pink)] bg-clip-text text-transparent animate-gradient drop-shadow-[0_0_30px_rgba(112,66,248,0.3)]">
              Con Inteligencia
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-400 sm:text-xl"
          >
            El journal de trading definitivo. Analiza tus operaciones, detecta patrones ocultos y maximiza tu rentabilidad con nuestra IA avanzada.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(112, 66, 248, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/register')}
              className="group relative flex items-center gap-3 rounded-xl bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] px-8 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(112,66,248,0.4)] transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">Empieza Gratis</span>
              <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:border-[var(--neon-blue)]/50 cursor-pointer"
            >
              Ver Demo
            </motion.button>
          </motion.div>

          {/* Floating Cards / Visuals */}
          <motion.div
            variants={itemVariants}
            className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl mx-auto"
          >
            {[
              { icon: TrendingUp, title: 'Win Rate', value: '+15%', color: 'text-[var(--success)]' },
              { icon: BarChart3, title: 'Profit Factor', value: '2.4', color: 'text-[var(--neon-blue)]' },
              { icon: Zap, title: 'Errores', value: '-40%', color: 'text-[var(--danger)]' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="glass-card p-6 rounded-2xl flex flex-col items-center gap-3 hover:border-[var(--neon-purple)]/50 transition-colors group"
              >
                <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-gray-400 text-sm font-medium">{stat.title}</div>
                <div className={`text-2xl font-bold ${stat.color} drop-shadow-lg`}>{stat.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

