'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Target,
  DollarSign,
  Activity,
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
      // Emerald Green Gradient
      gradient: 'bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]',
      border: 'border-emerald-500/30',
      text: 'text-emerald-300',
      chartColor: '#34d399',
      shadow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
    },
    {
      name: 'Winrate',
      value: `${stats.winrate.toFixed(1)}%`,
      icon: Target,
      // Purple/Violet Gradient
      gradient: 'bg-gradient-to-br from-[#4c1d95] via-[#5b21b6] to-[#6d28d9]',
      border: 'border-purple-500/30',
      text: 'text-purple-300',
      chartColor: '#a855f7',
      shadow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]'
    },
    {
      name: 'Profit Total',
      value: `$${stats.totalProfit.toFixed(2)}`,
      icon: DollarSign,
      // Gold/Amber Gradient
      gradient: 'bg-gradient-to-br from-[#78350f] via-[#92400e] to-[#b45309]',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      chartColor: '#fbbf24',
      shadow: 'shadow-[0_0_20px_-5px_rgba(251,191,36,0.3)]'
    },
    {
      name: 'R:R Promedio',
      value: stats.avgRR.toFixed(2),
      icon: Activity,
      // Red/Rose Gradient
      gradient: 'bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#be123c]',
      border: 'border-rose-500/30',
      text: 'text-rose-300',
      chartColor: '#f43f5e',
      shadow: 'shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]'
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
      className="space-y-8 p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-400 text-sm">
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
            className={`relative overflow-hidden rounded-2xl ${metric.gradient} p-6 border ${metric.border} shadow-lg backdrop-blur-md group ${metric.shadow}`}
          >
            {/* Inner Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-2 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10`}>
                <metric.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-bold text-white/70 tracking-wider uppercase">
                {metric.name}
              </span>
            </div>

            <div className="flex items-end justify-between relative z-10">
              <div>
                <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">
                  {metric.value}
                </h3>
              </div>

              {/* Enhanced SVG Sparkline */}
              <div className="w-28 h-12 opacity-90">
                <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none" className="overflow-visible">
                  <defs>
                    <linearGradient id={`gradient-${metric.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={metric.chartColor} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={metric.chartColor} stopOpacity="0" />
                    </linearGradient>
                    <filter id={`glow-${metric.name}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  {/* Fill area */}
                  <path
                    d="M0,50 L0,35 C20,35 30,15 50,25 C70,35 80,5 100,20 L100,50 Z"
                    fill={`url(#gradient-${metric.name})`}
                    opacity="0.6"
                  />
                  {/* Line stroke with smooth curve (C instead of Q for more control if needed, but simple C works well here) */}
                  <path
                    d="M0,35 C20,35 30,15 50,25 C70,35 80,5 100,20"
                    fill="none"
                    stroke={metric.chartColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#glow-${metric.name})`}
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
        className="rounded-3xl bg-[#0f1120]/60 border border-white/5 overflow-hidden backdrop-blur-xl shadow-2xl relative"
      >
        {/* Subtle grid bg for table */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMDQwdjQwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />

        <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10">
          <h2 className="text-lg font-bold text-white tracking-wide">
            Actividad Reciente
          </h2>
        </div>

        <div className="p-4 relative z-10">
          {stats.recentTrades.length > 0 ? (
            <div className="space-y-2">
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5 gap-4 sm:gap-0"
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Indicator Dot */}
                      <div className={`w-2 h-2 rounded-full ${trade.result === 'win' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' :
                        trade.result === 'loss' ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]' : 'bg-amber-400'
                        }`} />

                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base tracking-tight">
                           {trade.pair}
                        </span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                           {trade.setup}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-sm text-slate-500 font-mono">
                        {new Date(trade.trade_date).toLocaleDateString('es-ES')}
                      </div>

                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${trade.result === 'win' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_-5px_rgba(16,185,129,0.3)]' :
                        trade.result === 'loss' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_-5px_rgba(244,63,94,0.3)]' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                        {trade.result === 'win' ? 'WIN' : trade.result === 'loss' ? 'LOSS' : 'BE'}
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-mono font-bold">
                          <span className={`${trade.result === 'win' ? 'text-emerald-400' :
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
            <div className="text-center py-12 text-slate-500">
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
