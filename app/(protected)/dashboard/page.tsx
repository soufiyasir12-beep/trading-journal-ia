'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import DashboardAIAnalysis from '@/components/DashboardAIAnalysis'
import { supabase } from '@/lib/supabaseClient'

interface Trade {
  id: string
  pair: string
  setup: string
  trade_date: string
  result: 'win' | 'loss' | 'be'
  result_amount: string
  result_type?: 'percentage' | 'currency'
  risk_reward: string
}

interface TradeStats {
  totalTrades: number
  winrate: number
  totalProfit: number
  avgRR: number
  recentTrades: Trade[]
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
  const [accountCapital, setAccountCapital] = useState<number>(0)

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/trades')
      const result = await response.json()
      const data = result?.data || []

      // Fetch user profile for account capital
      const { data: { user } } = await supabase.auth.getUser()
      let capital = 0

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_capital')
          .eq('id', user.id)
          .single()

        if (profile?.account_capital) {
          capital = parseFloat(profile.account_capital)
          setAccountCapital(capital)
        }
      }

      if (data && data.length > 0) {
        const wins = data.filter((t: Trade) => t.result === 'win').length
        const totalTrades = data.length
        const winrate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

        const totalProfit = data.reduce((sum: number, t: Trade) => {
          const amount = parseFloat(t.result_amount) || 0
          // Calculate profit based on result type if needed, but for total profit we might need consistent data.
          // For now, assuming result_amount is consistent or we just sum it up. 
          // If we want to be precise, we should convert everything to dollars here too.
          let dollarAmount = amount
          if ((!t.result_type || t.result_type === 'percentage') && capital > 0) {
            dollarAmount = (amount * capital) / 100
          }

          if (t.result === 'win') return sum + dollarAmount
          if (t.result === 'loss') return sum - Math.abs(dollarAmount)
          return sum
        }, 0)

        const avgRR = totalTrades > 0
          ? data.reduce((sum: number, t: Trade) => {
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
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const metrics = [
    {
      name: 'Total Trades',
      value: stats.totalTrades,
      icon: TrendingUp,
      gradient: 'bg-gradient-to-b from-emerald-900/80 to-emerald-950/90',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      chartColor: '#10b981',
      shadow: 'shadow-emerald-500/10'
    },
    {
      name: 'Winrate',
      value: `${stats.winrate.toFixed(1)}%`,
      icon: Target,
      gradient: 'bg-gradient-to-b from-purple-900/80 to-purple-950/90',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      chartColor: '#a855f7',
      shadow: 'shadow-purple-500/10'
    },
    {
      name: 'Profit Total',
      value: `$${stats.totalProfit.toFixed(2)}`,
      icon: DollarSign,
      gradient: 'bg-gradient-to-b from-amber-900/80 to-amber-950/90',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      chartColor: '#fbbf24',
      shadow: 'shadow-amber-500/10'
    },
    {
      name: 'R:R Promedio',
      value: stats.avgRR.toFixed(2),
      icon: Activity,
      gradient: 'bg-gradient-to-b from-rose-900/80 to-rose-950/90',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      chartColor: '#f43f5e',
      shadow: 'shadow-rose-500/10'
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
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-4"
    >
      {/* Header */}
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-400 text-sm">
          Bienvenido a NeuroStrat, tu journal de trading con IA.
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric) => (
          <motion.div
            key={metric.name}
            variants={itemVariants}
            whileHover={{ scale: 1.02, translateY: -5 }}
            className={`relative overflow-hidden rounded-3xl ${metric.gradient} p-6 border ${metric.border} shadow-lg backdrop-blur-md group`}
            style={{
              boxShadow: `0 0 20px -5px ${metric.chartColor}20`
            }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-white/60 tracking-wider uppercase">
                {metric.name}
              </span>
            </div>

            <div className="flex items-end justify-between relative z-10">
              <div>
                <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  {metric.value}
                </h3>
                <p className={`text-xs font-medium ${metric.text} flex items-center gap-1`}>
                  {/* Subtext removed as requested */}
                </p>
              </div>

              {/* SVG Sparkline */}
              <div className="w-24 h-12 opacity-80">
                <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`gradient-${metric.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={metric.chartColor} stopOpacity="0.5" />
                      <stop offset="100%" stopColor={metric.chartColor} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,50 L0,30 Q25,10 50,35 T100,20 L100,50 Z"
                    fill={`url(#gradient-${metric.name})`}
                    opacity="0.3"
                  />
                  <path
                    d="M0,30 Q25,10 50,35 T100,20"
                    fill="none"
                    stroke={metric.chartColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl bg-[#0a0e17]/80 border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">
            Actividad Reciente
          </h2>
        </div>

        <div className="p-2">
          {stats.recentTrades.length > 0 ? (
            <div className="space-y-1">
              {stats.recentTrades.map((trade, index) => (
                <Link
                  key={trade.id}
                  href={`/trades/${trade.id}`}
                  passHref
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-1 h-8 rounded-full ${trade.result === 'win' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                        trade.result === 'loss' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-amber-500'
                        }`} />
                      <div>
                        <p className="font-bold text-white text-sm">
                          {trade.pair} <span className="text-gray-500 font-normal mx-2">|</span> {trade.setup}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 font-mono">
                      {new Date(trade.trade_date).toLocaleDateString('es-ES')}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${trade.result === 'win' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        trade.result === 'loss' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                        {trade.result === 'win' ? 'WIN' : trade.result === 'loss' ? 'LOSS' : 'BE'}
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-mono text-gray-400">
                          <span className={`font-bold ${trade.result === 'win' ? 'text-emerald-400' :
                            trade.result === 'loss' ? 'text-rose-400' : 'text-amber-400'
                            }`}>
                            {(() => {
                              const amount = parseFloat(trade.result_amount) || 0
                              if ((!trade.result_type || trade.result_type === 'percentage') && accountCapital > 0) {
                                const dollarAmount = (amount * accountCapital) / 100
                                return `${trade.result === 'loss' ? '-' : '+'}$${Math.abs(dollarAmount).toFixed(2)}`
                              }
                              return `${trade.result === 'loss' ? '-' : '+'}$${Math.abs(amount).toFixed(2)}`
                            })()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay actividad reciente
            </div>
          )}
        </div>
      </motion.div>

      {/* AI Analysis Banner */}
      <DashboardAIAnalysis />
    </motion.div>
  )
}
