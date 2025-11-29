'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Calendar as CalendarIcon,
  BarChart3,
  DollarSign,
  Percent,
  Award,
  Activity,
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, parseISO, getDay, getHours } from 'date-fns'

interface Trade {
  id: string
  pair: string
  risk_percentage: number
  risk_reward?: number
  direction?: 'Long' | 'Short'
  result: 'win' | 'loss' | 'breakeven'
  result_amount?: number
  result_type?: 'percentage' | 'money'
  setup: string
  trade_date: string
  entry_time?: string
  exit_time?: string
  created_at: string
}

interface Analytics {
  winrate: number
  avgRR: number
  totalTrades: number
  totalProfit: number
  bestHour: number
  bestDay: number
  balanceData: Array<{ date: string; balance: number }>
  hourlyData: Array<{ hour: number; profit: number; trades: number }>
  dailyData: Array<{ day: string; profit: number; trades: number }>
  setupData: Array<{ setup: string; winrate: number; trades: number }>
  directionData: Array<{ direction: string; winrate: number; profit: number }>
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function AnalysisPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [resultType, setResultType] = useState<'percentage' | 'money'>('percentage')

  useEffect(() => {
    fetchTrades()
    const savedResultType = localStorage.getItem('resultType') as 'percentage' | 'money'
    if (savedResultType) setResultType(savedResultType)
  }, [])

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades')
      const { data } = await response.json()
      if (data) {
        setTrades(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching trades:', error)
      setLoading(false)
    }
  }

  const analytics = useMemo<Analytics>(() => {
    if (trades.length === 0) {
      return {
        winrate: 0,
        avgRR: 0,
        totalTrades: 0,
        totalProfit: 0,
        bestHour: 0,
        bestDay: 0,
        balanceData: [],
        hourlyData: [],
        dailyData: [],
        setupData: [],
        directionData: [],
      }
    }

    const wins = trades.filter(t => t.result === 'win').length
    const winrate = (wins / trades.length) * 100

    const avgRR = trades.reduce((sum, t) => sum + (parseFloat(t.risk_reward?.toString() || '0') || 0), 0) / trades.length

    const totalProfit = trades.reduce((sum, t) => {
      const amount = t.result_amount || 0
      if (t.result === 'win') return sum + amount
      if (t.result === 'loss') return sum - Math.abs(amount)
      return sum
    }, 0)

    // Análisis por hora (usando entry_time si está disponible, sino created_at)
    const hourlyMap = new Map<number, { profit: number; trades: number }>()
    trades.forEach(trade => {
      let hour = 0
      if (trade.entry_time) {
        // Parsear hora en formato HH:MM:SS o HH:MM
        const timeParts = trade.entry_time.split(':')
        hour = parseInt(timeParts[0], 10)
      } else if (trade.created_at) {
        hour = getHours(parseISO(trade.created_at))
      }
      const current = hourlyMap.get(hour) || { profit: 0, trades: 0 }
      const amount = trade.result_amount || 0
      const profit = trade.result === 'win' ? amount : trade.result === 'loss' ? -Math.abs(amount) : 0
      hourlyMap.set(hour, {
        profit: current.profit + profit,
        trades: current.trades + 1,
      })
    })
    const hourlyData = Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => a.hour - b.hour)
    const bestHour = hourlyData.length > 0
      ? hourlyData.reduce((best, current) => current.profit > best.profit ? current : best).hour
      : 0

    // Análisis por día de la semana
    const dailyMap = new Map<number, { profit: number; trades: number }>()
    trades.forEach(trade => {
      const day = getDay(parseISO(trade.trade_date))
      const current = dailyMap.get(day) || { profit: 0, trades: 0 }
      const amount = trade.result_amount || 0
      const profit = trade.result === 'win' ? amount : trade.result === 'loss' ? -Math.abs(amount) : 0
      dailyMap.set(day, {
        profit: current.profit + profit,
        trades: current.trades + 1,
      })
    })
    const dailyData = Array.from(dailyMap.entries())
      .map(([day, data]) => ({
        day: dayNames[day],
        ...data,
      }))
      .sort((a, b) => b.profit - a.profit)
    const bestDay = dailyData.length > 0
      ? dailyMap.entries().next().value?.[0] || 0
      : 0

    // Balance acumulado
    const sortedTrades = [...trades].sort((a, b) =>
      new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    )
    let balance = 0
    const balanceData = sortedTrades.map(trade => {
      const amount = trade.result_amount || 0
      if (trade.result === 'win') balance += amount
      if (trade.result === 'loss') balance -= Math.abs(amount)
      return {
        date: format(parseISO(trade.trade_date), 'dd/MM'),
        balance,
      }
    })

    // Análisis por setup
    const setupMap = new Map<string, { wins: number; total: number }>()
    trades.forEach(trade => {
      const current = setupMap.get(trade.setup) || { wins: 0, total: 0 }
      setupMap.set(trade.setup, {
        wins: current.wins + (trade.result === 'win' ? 1 : 0),
        total: current.total + 1,
      })
    })
    const setupData = Array.from(setupMap.entries())
      .map(([setup, data]) => ({
        setup,
        winrate: (data.wins / data.total) * 100,
        trades: data.total,
      }))
      .sort((a, b) => b.winrate - a.winrate)

    // Análisis por dirección
    const directionMap = new Map<string, { wins: number; total: number; profit: number }>()
    trades.forEach(trade => {
      const dir = trade.direction || 'Unknown'
      const current = directionMap.get(dir) || { wins: 0, total: 0, profit: 0 }
      const amount = trade.result_amount || 0
      const profit = trade.result === 'win' ? amount : trade.result === 'loss' ? -Math.abs(amount) : 0
      directionMap.set(dir, {
        wins: current.wins + (trade.result === 'win' ? 1 : 0),
        total: current.total + 1,
        profit: current.profit + profit,
      })
    })
    const directionData = Array.from(directionMap.entries())
      .map(([direction, data]) => ({
        direction,
        winrate: (data.wins / data.total) * 100,
        profit: data.profit,
      }))

    return {
      winrate,
      avgRR,
      totalTrades: trades.length,
      totalProfit,
      bestHour,
      bestDay,
      balanceData,
      hourlyData,
      dailyData,
      setupData,
      directionData,
    }
  }, [trades])

  const metrics = [
    {
      name: 'Winrate',
      value: `${analytics.winrate.toFixed(1)}%`,
      icon: Target,
      gradient: 'from-emerald-900/50 to-emerald-800/30',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      change: analytics.winrate > 50 ? '+5%' : '-2%',
    },
    {
      name: 'R:R Promedio',
      value: analytics.avgRR.toFixed(2),
      icon: TrendingUp,
      gradient: 'from-purple-900/50 to-purple-800/30',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      change: analytics.avgRR > 1 ? '+0.3' : '-0.2',
    },
    {
      name: 'Total Trades',
      value: analytics.totalTrades,
      icon: Activity,
      gradient: 'from-amber-900/50 to-amber-800/30',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      change: '+12',
    },
    {
      name: 'Profit Total',
      value: resultType === 'money'
        ? `$${analytics.totalProfit.toFixed(2)}`
        : `${analytics.totalProfit > 0 ? '+' : ''}${analytics.totalProfit.toFixed(2)}%`,
      icon: DollarSign,
      gradient: 'from-red-900/50 to-red-800/30',
      border: 'border-red-500/30',
      text: 'text-red-400',
      change: analytics.totalProfit > 0 ? '+12%' : '-5%',
    },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
          Analíticas
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Análisis detallado de tu operativa de trading
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'tween' as const }}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${metric.gradient} p-6 border ${metric.border} shadow-lg`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-white/5`}>
                <metric.icon className={`h-6 w-6 ${metric.text}`} />
              </div>
              <span className={`text-xs font-medium ${metric.text} bg-white/5 px-2 py-1 rounded`}>
                {metric.change}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                {metric.name}
              </p>
              <h3 className="text-3xl font-bold text-white">
                {metric.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
        >
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolución del Balance
          </h2>
          {analytics.balanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.balanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[var(--text-secondary)]">
              No hay datos suficientes
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
        >
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Mejor Hora para Operar
          </h2>
          {analytics.hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="hour" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="profit" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[var(--text-secondary)]">
              No hay datos suficientes
            </div>
          )}
          {analytics.bestHour !== 0 && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
              <p className="text-sm text-[var(--text-secondary)]">
                Mejor hora: <span className="font-semibold text-[var(--text-primary)]">{analytics.bestHour}:00</span>
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
        >
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Mejores Días de la Semana
          </h2>
          {analytics.dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="profit" fill="#eab308" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[var(--text-secondary)]">
              No hay datos suficientes
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
        >
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Winrate por Set Up
          </h2>
          {analytics.setupData.length > 0 ? (
            <div className="space-y-3">
              {analytics.setupData.slice(0, 5).map((setup, index) => (
                <div key={setup.setup} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {setup.setup}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-secondary)]">
                      {setup.winrate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--background)] rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${setup.winrate}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5, type: 'tween' as const }}
                      className={`h-2 rounded-full ${setup.winrate > 50
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-red-500 to-orange-500'
                        }`}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {setup.trades} trades
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[var(--text-secondary)]">
              No hay datos suficientes
            </div>
          )}
        </motion.div>
      </div>

      {analytics.directionData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
        >
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análisis por Dirección
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.directionData.map((dir) => (
              <div
                key={dir.direction}
                className="p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {dir.direction}
                  </span>
                  <span
                    className={`text-sm font-semibold ${dir.profit > 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                  >
                    {resultType === 'money'
                      ? `$${dir.profit.toFixed(2)}`
                      : `${dir.profit > 0 ? '+' : ''}${dir.profit.toFixed(2)}%`}
                  </span>
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Winrate: <span className="font-medium">{dir.winrate.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
