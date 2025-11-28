'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { X, Save, Settings, DollarSign, Percent, ChevronDown, ChevronUp, Trash2, Image as ImageIcon, Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameWeek, isSameMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import ImportTrades from '@/components/ImportTrades'
import { supabase } from '@/lib/supabaseClient'

interface Trade {
  id?: string
  image_url?: string
  pair: string
  risk_percentage: number
  risk_reward?: number
  direction?: 'Long' | 'Short'
  result: 'win' | 'loss' | 'breakeven'
  result_amount?: number
  result_type?: 'percentage' | 'money'
  setup: string
  notes?: string
  trade_date: string
  entry_time?: string
  exit_time?: string
}

export default function TradesPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [trades, setTrades] = useState<Trade[]>([])
  const [dayTrades, setDayTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resultType, setResultType] = useState<'percentage' | 'money'>('percentage')
  const [profitColor, setProfitColor] = useState('#10b981')
  const [lossColor, setLossColor] = useState('#ef4444')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [accountCapital, setAccountCapital] = useState<number | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [isTradeDetailOpen, setIsTradeDetailOpen] = useState(false)
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date())

  const getWeeksInMonth = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const weeks = []

    let current = startOfWeek(start, { weekStartsOn: 1 })

    // Ensure we cover the entire month, matching calendar view roughly
    while (current <= end) {
      weeks.push({
        start: new Date(current), // Clone to avoid reference mutation
        end: endOfWeek(current, { weekStartsOn: 1 })
      })
      // setDate mutates the object, so we must be careful. 
      // Since we cloned above, mutating 'current' here is fine for the next iteration loop,
      // but to be safe and clean, let's create a new object for the next iteration.
      const nextWeek = new Date(current)
      nextWeek.setDate(current.getDate() + 7)
      current = nextWeek
    }

    return weeks
  }

  const getWeeklySummary = (weekStart: Date, weekEnd: Date) => {
    const weekTrades = trades.filter(t => {
      // Parse YYYY-MM-DD string manually to ensure it's treated as local date
      // This avoids timezone issues where '2023-01-01' becomes '2022-12-31T23:00:00'
      const [year, month, day] = t.trade_date.split('-').map(Number)
      const tradeDate = new Date(year, month - 1, day)
      tradeDate.setHours(0, 0, 0, 0)

      const start = new Date(weekStart)
      start.setHours(0, 0, 0, 0)

      const end = new Date(weekEnd)
      end.setHours(23, 59, 59, 999)

      return tradeDate >= start && tradeDate <= end
    })

    const total = weekTrades.reduce((sum, trade) => {
      const amount = resultType === 'money'
        ? convertResult(trade, 'money')
        : convertResult(trade, 'percentage')

      if (trade.result === 'win') return sum + amount
      if (trade.result === 'loss') return sum - Math.abs(amount)
      return sum
    }, 0)

    return {
      total,
      count: weekTrades.length,
      daysTraded: new Set(weekTrades.map(t => t.trade_date)).size
    }
  }

  const [formData, setFormData] = useState<Trade>({
    pair: '',
    risk_percentage: 0,
    risk_reward: 0,
    direction: 'Long',
    result: 'win',
    result_amount: 0,
    result_type: 'percentage',
    setup: '',
    notes: '',
    trade_date: format(new Date(), 'yyyy-MM-dd'),
    image_url: '',
    entry_time: '',
    exit_time: '',
  })

  useEffect(() => {
    fetchTrades()
    loadSettings()
    fetchAccountCapital()
  }, [])

  const loadSettings = () => {
    const savedResultType = localStorage.getItem('resultType') as 'percentage' | 'money'
    const savedProfitColor = localStorage.getItem('profitColor')
    const savedLossColor = localStorage.getItem('lossColor')

    if (savedResultType) setResultType(savedResultType)
    if (savedProfitColor) setProfitColor(savedProfitColor)
    if (savedLossColor) setLossColor(savedLossColor)
  }

  const fetchAccountCapital = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_capital')
        .eq('id', user.id)
        .single()

      if (profile?.account_capital) {
        setAccountCapital(parseFloat(profile.account_capital.toString()))
      }
    } catch (error) {
      console.error('Error fetching account capital:', error)
    }
  }

  const convertResult = (trade: Trade, targetType: 'percentage' | 'money'): number => {
    if (!trade.result_amount) return 0

    const amount = parseFloat(trade.result_amount.toString())

    // If already in target type, return as is
    if (trade.result_type === targetType) {
      return amount
    }

    // Need capital for conversion
    if (!accountCapital || accountCapital <= 0) {
      return 0
    }

    if (trade.result_type === 'percentage' && targetType === 'money') {
      // Convert % to dollars: (percentage / 100) * capital
      return (amount / 100) * accountCapital
    } else if (trade.result_type === 'money' && targetType === 'percentage') {
      // Convert dollars to %: (dollars / capital) * 100
      return (amount / accountCapital) * 100
    }

    return amount
  }

  const calculateWeeklyResult = (date: Date): number => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

    const weekTrades = trades.filter(t => {
      const tradeDate = new Date(t.trade_date)
      return tradeDate >= weekStart && tradeDate <= weekEnd
    })

    return weekTrades.reduce((sum, trade) => {
      const amount = resultType === 'money'
        ? convertResult(trade, 'money')
        : convertResult(trade, 'percentage')

      if (trade.result === 'win') return sum + amount
      if (trade.result === 'loss') return sum - Math.abs(amount)
      return sum
    }, 0)
  }

  const calculateMonthlyResult = (date: Date): number => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const monthTrades = trades.filter(t => {
      const tradeDate = new Date(t.trade_date)
      return tradeDate >= monthStart && tradeDate <= monthEnd
    })

    return monthTrades.reduce((sum, trade) => {
      const amount = resultType === 'money'
        ? convertResult(trade, 'money')
        : convertResult(trade, 'percentage')

      if (trade.result === 'win') return sum + amount
      if (trade.result === 'loss') return sum - Math.abs(amount)
      return sum
    }, 0)
  }

  const saveSettings = () => {
    localStorage.setItem('resultType', resultType)
    localStorage.setItem('profitColor', profitColor)
    localStorage.setItem('lossColor', lossColor)
  }

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades')
      const result = await response.json()
      const data = result?.data || []
      if (data) {
        setTrades(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching trades:', error)
      setLoading(false)
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayTradesList = trades.filter(t => t.trade_date === dateStr)
    setDayTrades(dayTradesList)
    setFormData({
      ...formData,
      trade_date: dateStr,
    })
    setIsModalOpen(true)
  }

  const handleSaveTrade = async () => {
    if (!formData.pair || !formData.setup || formData.risk_percentage <= 0) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          risk_reward: formData.risk_reward || null,
          result_amount: formData.result_amount || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar el trade')
      }

      await fetchTrades()
      setIsModalOpen(false)
      setFormData({
        pair: '',
        risk_percentage: 0,
        risk_reward: 0,
        direction: 'Long',
        result: 'win',
        result_amount: 0,
        result_type: resultType,
        setup: '',
        notes: '',
        trade_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        image_url: '',
        entry_time: '',
        exit_time: '',
      })
    } catch (error) {
      console.error('Error saving trade:', error)
      const message = error instanceof Error ? error.message : 'Error al guardar el trade'
      alert(message || 'Error al guardar el trade. Por favor verifica los datos e intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTrade = async (tradeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este trade?')) {
      return
    }

    try {
      const response = await fetch(`/api/trades?id=${tradeId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar el trade')
      }

      // Actualizar la lista de trades
      const updatedTrades = trades.filter(t => t.id !== tradeId)
      setTrades(updatedTrades)

      // Actualizar los trades del día si hay una fecha seleccionada
      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const dayTradesList = updatedTrades.filter(t => t.trade_date === dateStr)
        setDayTrades(dayTradesList)
      }
    } catch (error) {
      console.error('Error deleting trade:', error)
      const message = error instanceof Error ? error.message : 'Error al eliminar el trade'
      alert(message || 'Error al eliminar el trade. Por favor intenta nuevamente.')
    }
  }

  const getDayClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return ''

    const dateStr = format(date, 'yyyy-MM-dd')
    const dayTradesList = trades.filter(t => t.trade_date === dateStr)

    if (dayTradesList.length === 0) return ''

    const totalResult = dayTradesList.reduce((sum, trade) => {
      const amount = parseFloat(trade.result_amount?.toString() || '0')
      if (trade.result === 'win') return sum + amount
      if (trade.result === 'loss') return sum - Math.abs(amount)
      return sum
    }, 0)

    const isProfit = totalResult > 0

    return `custom-day ${isProfit ? 'profit-day' : 'loss-day'}`
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const dateStr = format(date, 'yyyy-MM-dd')
    const dayTradesList = trades.filter(t => t.trade_date === dateStr)

    if (dayTradesList.length === 0) return null

    const totalResult = dayTradesList.reduce((sum, trade) => {
      const amount = resultType === 'money'
        ? convertResult(trade, 'money')
        : convertResult(trade, 'percentage')
      if (trade.result === 'win') return sum + amount
      if (trade.result === 'loss') return sum - Math.abs(amount)
      return sum
    }, 0)

    const displayValue = resultType === 'money'
      ? `$${Math.abs(totalResult).toFixed(2)}`
      : `${totalResult > 0 ? '+' : ''}${totalResult.toFixed(2)}%`

    // Calculate weekly and monthly results
    // const weeklyResult = calculateWeeklyResult(date)
    // const monthlyResult = calculateMonthlyResult(date)

    return (
      <div className="text-xs font-semibold mt-1 space-y-1">
        <div>{displayValue}</div>
        {dayTradesList.length > 1 && (
          <div className="text-[10px] opacity-75">
            {dayTradesList.length} trades
          </div>
        )}
      </div>
    )
  }

  const getWeekResult = (date: Date): number => {
    return calculateWeeklyResult(date)
  }

  const getMonthResult = (date: Date): number => {
    return calculateMonthlyResult(date)
  }

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
      className="h-full flex flex-col"
    >
      {/* Header con título y configuración */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent">
            Registro de Trades
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Haz clic en un día del calendario para registrar tus operaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ImportTrades onImportSuccess={fetchTrades} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedDate(new Date())
              setIsModalOpen(true)
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            Nuevo Trade
          </motion.button>

          {/* Configuración desplegable */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg font-medium text-[var(--text-primary)] hover:bg-[var(--background)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-5 w-5" />
              Configuración
              {isSettingsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </motion.button>

            <AnimatePresence mode="wait">
              {isSettingsOpen && (
                <motion.div
                  key="settings-panel"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: 'tween' as const }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-[var(--card-bg)] p-6 shadow-2xl border border-[var(--card-border)] z-50"
                >
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Configuración
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Tipo de Resultado
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setResultType('percentage')
                            saveSettings()
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg transition-all cursor-pointer ${resultType === 'percentage'
                            ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                            : 'bg-[var(--background)] text-[var(--text-primary)]'
                            }`}
                        >
                          <Percent className="h-4 w-4 inline mr-1" />
                          Porcentaje
                        </button>
                        <button
                          onClick={() => {
                            if (!accountCapital || accountCapital <= 0) {
                              alert('Por favor configura el capital de tu cuenta en tu perfil para usar la visualización en dólares')
                              return
                            }
                            setResultType('money')
                            saveSettings()
                          }}
                          disabled={!accountCapital || accountCapital <= 0}
                          className={`flex-1 px-3 py-2 rounded-lg transition-all cursor-pointer ${resultType === 'money'
                            ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                            : 'bg-[var(--background)] text-[var(--text-primary)]'
                            } ${(!accountCapital || accountCapital <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <DollarSign className="h-4 w-4 inline mr-1" />
                          Dinero
                        </button>
                      </div>
                      {(!accountCapital || accountCapital <= 0) && (
                        <p className="text-xs text-[var(--text-secondary)] mt-2">
                          Configura el capital de tu cuenta en tu perfil para usar la visualización en dólares
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Capital de Cuenta
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={accountCapital || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || null
                            setAccountCapital(value)
                          }}
                          onBlur={async () => {
                            if (accountCapital === null) return
                            try {
                              const { data: { user } } = await supabase.auth.getUser()
                              if (user) {
                                await supabase
                                  .from('profiles')
                                  .update({ account_capital: accountCapital })
                                  .eq('id', user.id)
                                // Optional: Add a toast here if you have a toast component
                                console.log('Capital saved')
                              }
                            } catch (error) {
                              console.error('Error updating capital:', error)
                            }
                          }}
                          placeholder="Ej: 10000"
                          className="flex-1 px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <DollarSign className="h-5 w-5 text-[var(--text-secondary)] self-center" />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-2">
                        Necesario para convertir entre % y dólares
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Color Ganancias
                      </label>
                      <input
                        type="color"
                        value={profitColor}
                        onChange={(e) => {
                          setProfitColor(e.target.value)
                          saveSettings()
                        }}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Color Pérdidas
                      </label>
                      <input
                        type="color"
                        value={lossColor}
                        onChange={(e) => {
                          setLossColor(e.target.value)
                          saveSettings()
                        }}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Contenedor Principal: Calendario + Sidebar */}
      <div className="flex-1 min-h-0 flex gap-6">
        {/* Calendario */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-[3] h-full rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)] overflow-hidden flex flex-col"
        >
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) {
                handleDateClick(value)
              }
            }}
            value={selectedDate}
            onActiveStartDateChange={({ activeStartDate }) => {
              if (activeStartDate) setActiveStartDate(activeStartDate)
            }}
            className="w-full h-full border-0 bg-transparent"
            tileClassName={getDayClassName}
            tileContent={tileContent}
            locale="es"
            formatShortWeekday={(locale, date) => format(date, 'EEE', { locale: es }).charAt(0)}
          />
        </motion.div>

        {/* Sidebar de Resultados Semanales */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 h-full rounded-xl bg-[var(--card-bg)] p-4 shadow-lg border border-[var(--card-border)] overflow-y-auto"
        >
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 sticky top-0 bg-[var(--card-bg)] pb-2 border-b border-[var(--card-border)]">
            Resumen Semanal
          </h3>
          <div className="space-y-4">
            {getWeeksInMonth(activeStartDate).map((week, index) => {
              const summary = getWeeklySummary(week.start, week.end)
              const isProfit = summary.total > 0
              return (
                <div key={index} className="p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Semana {index + 1}</span>
                    <span className="text-xs text-[var(--text-secondary)] opacity-75">
                      {format(week.start, 'd MMM')} - {format(week.end, 'd MMM')}
                    </span>
                  </div>
                  <div className={`text-2xl font-bold ${isProfit ? 'text-[var(--profit-color)]' : summary.total < 0 ? 'text-[var(--loss-color)]' : 'text-[var(--text-primary)]'}`}>
                    {resultType === 'money' ? '$' : ''}{summary.total > 0 ? '+' : ''}{summary.total.toFixed(2)}{resultType === 'percentage' ? '%' : ''}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-[var(--text-secondary)]">
                    <span>{summary.count} trades</span>
                    <span className="bg-[var(--card-border)] px-2 py-0.5 rounded-full">{summary.daysTraded} días op.</span>
                  </div>
                </div>
              )
            })}

            {/* Resumen Mensual */}
            <div className="mt-8 pt-4 border-t border-[var(--card-border)]">
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Total Mensual</h4>
              {(() => {
                const monthly = calculateMonthlyResult(activeStartDate)
                const isProfit = monthly > 0
                return (
                  <div className={`text-3xl font-bold ${isProfit ? 'text-[var(--profit-color)]' : monthly < 0 ? 'text-[var(--loss-color)]' : 'text-[var(--text-primary)]'}`}>
                    {resultType === 'money' ? '$' : ''}{monthly > 0 ? '+' : ''}{monthly.toFixed(2)}{resultType === 'percentage' ? '%' : ''}
                  </div>
                )
              })()}
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .react-calendar {
          background: transparent;
          border: none;
          font-family: inherit;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .react-calendar__navigation {
          margin-bottom: 1rem;
          flex-shrink: 0;
        }
        .react-calendar__viewContainer {
          flex: 1;
          min-height: 0;
        }
        .react-calendar__month-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .react-calendar__month-view > div {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .react-calendar__month-view > div > div {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .react-calendar__month-view__days {
          flex: 1 !important;
          height: auto !important;
        }
        .react-calendar__month-view__weekdays {
          margin-bottom: 0.5rem;
          flex-shrink: 0;
        }
        .react-calendar__tile {
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: auto !important;
          flex: 1;
        }
        .react-calendar__tile:hover {
          background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%) !important;
          color: white;
          transform: scale(1.05);
          z-index: 10;
        }
        .react-calendar__tile--active {
          background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%) !important;
          color: white;
        }
        .react-calendar__tile--now {
          background: rgba(245, 158, 11, 0.2) !important;
        }
        .custom-day {
          font-weight: bold;
        }
        .profit-day {
          background-color: ${profitColor}20 !important;
          border: 2px solid ${profitColor} !important;
        }
        .loss-day {
          background-color: ${lossColor}20 !important;
          border: 2px solid ${lossColor} !important;
        }
      `}</style>

      {/* Modal para agregar/editar trade */}
      <AnimatePresence mode="wait">
        {isModalOpen && (
          <>
            <motion.div
              key="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, type: 'tween' as const }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: 'spring' as const, stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[var(--card-bg)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--card-border)]">
                <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--card-border)] p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: es }) : 'Nuevo Trade'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Par *
                      </label>
                      <input
                        type="text"
                        value={formData.pair}
                        onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                        placeholder="EUR/USD"
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Dirección *
                      </label>
                      <select
                        value={formData.direction}
                        onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'Long' | 'Short' })}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Long">Long</option>
                        <option value="Short">Short</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        % Riesgo *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.risk_percentage}
                        onChange={(e) => setFormData({ ...formData, risk_percentage: parseFloat(e.target.value) || 0 })}
                        placeholder="1.5"
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        R:R (Risk Reward)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.risk_reward}
                        onChange={(e) => setFormData({ ...formData, risk_reward: parseFloat(e.target.value) || 0 })}
                        placeholder="2.0"
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Resultado *
                      </label>
                      <select
                        value={formData.result}
                        onChange={(e) => setFormData({ ...formData, result: e.target.value as 'win' | 'loss' | 'breakeven' })}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="win">Ganancia</option>
                        <option value="loss">Pérdida</option>
                        <option value="breakeven">Breakeven</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Resultado ({resultType === 'money' ? '$' : '%'})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.result_amount}
                        onChange={(e) => setFormData({ ...formData, result_amount: parseFloat(e.target.value) || 0, result_type: resultType })}
                        placeholder={resultType === 'money' ? '100.00' : '2.5'}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Hora de Entrada
                      </label>
                      <input
                        type="time"
                        value={formData.entry_time}
                        onChange={(e) => setFormData({ ...formData, entry_time: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Hora de Salida
                      </label>
                      <input
                        type="time"
                        value={formData.exit_time}
                        onChange={(e) => setFormData({ ...formData, exit_time: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Set Up Utilizado *
                    </label>
                    <input
                      type="text"
                      value={formData.setup}
                      onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                      placeholder="Breakout, Pullback, etc."
                      className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Imagen o Enlace
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="URL de la imagen"
                        className="flex-1 px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.image_url && (
                        <img
                          src={formData.image_url}
                          alt="Trade"
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Notas Extras
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Información adicional sobre la operación..."
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {dayTrades.length > 0 && (
                    <div className="border-t border-[var(--card-border)] pt-4">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                        Trades del día ({dayTrades.length})
                      </h3>
                      <div className="space-y-2 mb-4">
                        {dayTrades.map((trade, index) => {
                          const convertedAmount = resultType === 'money'
                            ? convertResult(trade, 'money')
                            : convertResult(trade, 'percentage')

                          return (
                            <div
                              key={trade.id || index}
                              className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedTrade(trade)
                                setIsTradeDetailOpen(true)
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-[var(--text-primary)]">
                                    {trade.pair} - {trade.setup}
                                  </p>
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    {trade.direction} | R:R {trade.risk_reward || 'N/A'} | Riesgo: {trade.risk_percentage}%
                                  </p>
                                  {trade.entry_time && trade.exit_time && (
                                    <p className="text-xs text-[var(--text-secondary)]">
                                      {trade.entry_time} - {trade.exit_time}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`font-semibold ${trade.result === 'win'
                                      ? 'text-green-500'
                                      : trade.result === 'loss'
                                        ? 'text-red-500'
                                        : 'text-yellow-500'
                                      }`}
                                  >
                                    {trade.result === 'win' ? '+' : trade.result === 'loss' ? '-' : ''}
                                    {trade.result_amount
                                      ? resultType === 'money'
                                        ? `$${Math.abs(convertedAmount).toFixed(2)}`
                                        : `${convertedAmount > 0 ? '+' : ''}${convertedAmount.toFixed(2)}%`
                                      : 'Breakeven'}
                                  </span>
                                  {trade.image_url && (
                                    <ImageIcon className="h-4 w-4 text-[var(--text-secondary)]" />
                                  )}
                                  {trade.id && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteTrade(trade.id!)
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                      title="Eliminar trade"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Weekly and Monthly Results */}
                      {selectedDate && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--card-border)]">
                          <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 mb-1">
                              <CalendarIcon className="h-4 w-4 text-[var(--text-secondary)]" />
                              <span className="text-xs text-[var(--text-secondary)]">Semana</span>
                            </div>
                            <p className={`text-lg font-semibold ${getWeekResult(selectedDate) >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                              {resultType === 'money'
                                ? `$${getWeekResult(selectedDate).toFixed(2)}`
                                : `${getWeekResult(selectedDate) >= 0 ? '+' : ''}${getWeekResult(selectedDate).toFixed(2)}%`
                              }
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="h-4 w-4 text-[var(--text-secondary)]" />
                              <span className="text-xs text-[var(--text-secondary)]">Mes</span>
                            </div>
                            <p className={`text-lg font-semibold ${getMonthResult(selectedDate) >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                              {resultType === 'money'
                                ? `$${getMonthResult(selectedDate).toFixed(2)}`
                                : `${getMonthResult(selectedDate) >= 0 ? '+' : ''}${getMonthResult(selectedDate).toFixed(2)}%`
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveTrade}
                      disabled={saving}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Save className="h-5 w-5" />
                      {saving ? 'Guardando...' : 'Guardar Trade'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--card-bg)] transition-all cursor-pointer"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Trade Detail Modal */}
      <AnimatePresence mode="wait">
        {isTradeDetailOpen && selectedTrade && (
          <>
            <motion.div
              key="trade-detail-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsTradeDetailOpen(false)}
            />
            <motion.div
              key="trade-detail-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[var(--card-bg)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--card-border)]">
                <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--card-border)] p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    Detalles del Trade
                  </h2>
                  <button
                    onClick={() => setIsTradeDetailOpen(false)}
                    className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Image */}
                  {selectedTrade.image_url && (
                    <div>
                      <img
                        src={selectedTrade.image_url}
                        alt="Trade"
                        className="w-full rounded-lg border border-[var(--card-border)]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* Trade Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Par
                      </label>
                      <p className="text-[var(--text-primary)] font-semibold">{selectedTrade.pair}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Dirección
                      </label>
                      <p className="text-[var(--text-primary)] font-semibold">{selectedTrade.direction || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        % Riesgo
                      </label>
                      <p className="text-[var(--text-primary)] font-semibold">{selectedTrade.risk_percentage}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        R:R (Risk Reward)
                      </label>
                      <p className="text-[var(--text-primary)] font-semibold">{selectedTrade.risk_reward || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Resultado
                      </label>
                      <p className={`font-semibold ${selectedTrade.result === 'win'
                        ? 'text-green-500'
                        : selectedTrade.result === 'loss'
                          ? 'text-red-500'
                          : 'text-yellow-500'
                        }`}>
                        {selectedTrade.result === 'win' ? 'Ganancia' : selectedTrade.result === 'loss' ? 'Pérdida' : 'Breakeven'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Resultado ({resultType === 'money' ? 'USD' : '%'})
                      </label>
                      <p className={`font-semibold ${selectedTrade.result === 'win'
                        ? 'text-green-500'
                        : selectedTrade.result === 'loss'
                          ? 'text-red-500'
                          : 'text-yellow-500'
                        }`}>
                        {selectedTrade.result_amount
                          ? resultType === 'money'
                            ? `$${Math.abs(convertResult(selectedTrade, 'money')).toFixed(2)}`
                            : `${convertResult(selectedTrade, 'percentage') >= 0 ? '+' : ''}${convertResult(selectedTrade, 'percentage').toFixed(2)}%`
                          : 'Breakeven'}
                      </p>
                      {selectedTrade.result_type && selectedTrade.result_type !== resultType && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          Original: {selectedTrade.result_type === 'money' ? 'USD' : '%'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Hora Entrada
                      </label>
                      <p className="text-[var(--text-primary)]">{selectedTrade.entry_time || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Hora Salida
                      </label>
                      <p className="text-[var(--text-primary)]">{selectedTrade.exit_time || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Setup Utilizado
                      </label>
                      <p className="text-[var(--text-primary)]">{selectedTrade.setup}</p>
                    </div>
                    {selectedTrade.notes && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                          Notas
                        </label>
                        <p className="text-[var(--text-primary)] whitespace-pre-wrap">{selectedTrade.notes}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Fecha
                      </label>
                      <p className="text-[var(--text-primary)]">{format(new Date(selectedTrade.trade_date), 'dd MMMM yyyy', { locale: es })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
