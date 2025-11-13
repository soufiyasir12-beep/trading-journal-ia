'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Sparkles,
} from 'lucide-react'
import AIAnalysisCard from '@/components/AIAnalysisCard'

interface TradeStats {
  totalTrades: number
  winrate: number
  totalProfit: number
  avgRR: number
  recentTrades: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<TradeStats>({
    totalTrades: 0,
    winrate: 0,
    totalProfit: 0,
    avgRR: 0,
    recentTrades: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/trades')
      const result = await response.json()
      const data = result?.data || []

      if (data && data.length > 0) {
        const wins = data.filter((t: any) => t.result === 'win').length
        const totalTrades = data.length
        const winrate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

        const totalProfit = data.reduce((sum: number, t: any) => {
          const amount = parseFloat(t.result_amount) || 0
          if (t.result === 'win') return sum + amount
          if (t.result === 'loss') return sum - Math.abs(amount)
          return sum
        }, 0)

        const avgRR = totalTrades > 0
          ? data.reduce((sum: number, t: any) => {
              const rr = parseFloat(t.risk_reward) || 0
              return sum + rr
            }, 0) / totalTrades
          : 0

        setStats({
          totalTrades,
          winrate,
          totalProfit,
          avgRR: avgRR || 0,
          recentTrades: data.slice(0, 5),
        })
      } else {
        setStats({
          totalTrades: 0,
          winrate: 0,
          totalProfit: 0,
          avgRR: 0,
          recentTrades: [],
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setLoading(false)
    }
  }

  const metrics = [
    {
      name: 'Total Trades',
      value: stats.totalTrades,
      icon: Activity,
      color: 'from-amber-500 to-yellow-500',
      change: '+0%',
    },
    {
      name: 'Winrate',
      value: `${stats.winrate.toFixed(1)}%`,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      change: stats.winrate > 50 ? '+5%' : '-2%',
    },
    {
      name: 'Profit Total',
      value: `$${stats.totalProfit.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-yellow-500 to-amber-400',
      change: stats.totalProfit > 0 ? '+12%' : '-5%',
    },
    {
      name: 'R:R Promedio',
      value: stats.avgRR.toFixed(2),
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      change: stats.avgRR > 1 ? '+0.3' : '-0.2',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  } as const

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
          className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, type: 'tween' as const }}
          >
            <Sparkles className="h-8 w-8 text-amber-500" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Bienvenido a tu Trading Journal con IA
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative overflow-hidden rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)] hover:shadow-2xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} shadow-lg`}
                >
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
                {metric.change.startsWith('+') ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                {metric.name}
              </p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {metric.value}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    metric.change.startsWith('+')
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {metric.change}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  vs mes anterior
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Actividad Reciente
        </h2>
        {stats.recentTrades.length > 0 ? (
          <div className="space-y-3">
            {stats.recentTrades.map((trade, index) => (
              <motion.div
                key={trade.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, type: 'tween' as const }}
                className="flex items-center justify-between p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)] hover:border-amber-500 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      trade.result === 'win'
                        ? 'bg-green-500'
                        : trade.result === 'loss'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {trade.pair} - {trade.setup}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {new Date(trade.trade_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      trade.result === 'win'
                        ? 'text-green-500'
                        : trade.result === 'loss'
                        ? 'text-red-500'
                        : 'text-yellow-500'
                    }`}
                  >
                    {trade.result === 'win'
                      ? '+'
                      : trade.result === 'loss'
                      ? '-'
                      : ''}
                    {trade.result_amount
                      ? `$${Math.abs(parseFloat(trade.result_amount.toString()) || 0).toFixed(2)}`
                      : 'Breakeven'}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    R:R {trade.risk_reward || 'N/A'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)]">
              No hay actividad reciente. Comienza registrando tus trades.
            </p>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <AIAnalysisCard />
      </motion.div>
    </motion.div>
  )
}
