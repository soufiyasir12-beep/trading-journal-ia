'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { X, Save, Settings, DollarSign, Percent, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import ImportTrades from '@/components/ImportTrades'

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
  }, [])

  const loadSettings = () => {
    const savedResultType = localStorage.getItem('resultType') as 'percentage' | 'money'
    const savedProfitColor = localStorage.getItem('profitColor')
    const savedLossColor = localStorage.getItem('lossColor')
    
    if (savedResultType) setResultType(savedResultType)
    if (savedProfitColor) setProfitColor(savedProfitColor)
    if (savedLossColor) setLossColor(savedLossColor)
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
    } catch (error: any) {
      console.error('Error saving trade:', error)
      alert(error.message || 'Error al guardar el trade. Por favor verifica los datos e intenta nuevamente.')
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
    } catch (error: any) {
      console.error('Error deleting trade:', error)
      alert(error.message || 'Error al eliminar el trade. Por favor intenta nuevamente.')
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
      const amount = parseFloat(trade.result_amount?.toString() || '0')
      if (trade.result === 'win') return sum + amount
      if (trade.result === 'loss') return sum - Math.abs(amount)
      return sum
    }, 0)

    const displayValue = resultType === 'money' 
      ? `$${Math.abs(totalResult).toFixed(2)}`
      : `${totalResult > 0 ? '+' : ''}${totalResult.toFixed(2)}%`

    return (
      <div className="text-xs font-semibold mt-1">
        {displayValue}
      </div>
    )
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
                          className={`flex-1 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                            resultType === 'percentage'
                              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                              : 'bg-[var(--background)] text-[var(--text-primary)]'
                          }`}
                        >
                          <Percent className="h-4 w-4 inline mr-1" />
                          Porcentaje
                        </button>
                        <button
                          onClick={() => {
                            setResultType('money')
                            saveSettings()
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                            resultType === 'money'
                              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                              : 'bg-[var(--background)] text-[var(--text-primary)]'
                          }`}
                        >
                          <DollarSign className="h-4 w-4 inline mr-1" />
                          Dinero
                        </button>
                      </div>
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

      {/* Calendario ocupando la mayor parte de la pantalla */}
      <div className="flex-1 min-h-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
        >
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) {
                handleDateClick(value)
              }
            }}
            value={selectedDate}
            className="w-full h-full border-0 bg-transparent"
            tileClassName={getDayClassName}
            tileContent={tileContent}
            locale="es"
            formatShortWeekday={(locale, date) => format(date, 'EEE', { locale: es }).charAt(0)}
          />
          <style jsx global>{`
            .react-calendar {
              background: transparent;
              border: none;
              font-family: inherit;
              width: 100%;
              height: 100%;
            }
            .react-calendar__navigation {
              margin-bottom: 1rem;
            }
            .react-calendar__month-view__weekdays {
              margin-bottom: 0.5rem;
            }
            .react-calendar__tile {
              padding: 1rem;
              border-radius: 8px;
              transition: all 0.2s;
              min-height: 80px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .react-calendar__tile:hover {
              background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%) !important;
              color: white;
              transform: scale(1.05);
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
        </motion.div>
      </div>

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
                        Trades del día
                      </h3>
                      <div className="space-y-2">
                        {dayTrades.map((trade, index) => (
                          <div
                            key={trade.id || index}
                            className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-[var(--text-primary)]">
                                  {trade.pair} - {trade.setup}
                                </p>
                                <p className="text-sm text-[var(--text-secondary)]">
                                  {trade.direction} | R:R {trade.risk_reward || 'N/A'}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`font-semibold ${
                                    trade.result === 'win'
                                      ? 'text-green-500'
                                      : trade.result === 'loss'
                                      ? 'text-red-500'
                                      : 'text-yellow-500'
                                  }`}
                                >
                                  {trade.result === 'win' ? '+' : trade.result === 'loss' ? '-' : ''}
                                  {trade.result_amount
                                    ? resultType === 'money'
                                      ? `$${Math.abs(parseFloat(trade.result_amount.toString()) || 0).toFixed(2)}`
                                      : `${Math.abs(parseFloat(trade.result_amount.toString()) || 0).toFixed(2)}%`
                                    : 'Breakeven'}
                                </span>
                                {trade.id && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteTrade(trade.id!)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar trade"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
    </motion.div>
  )
}
