'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, TrendingUp, TrendingDown, DollarSign, Activity, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabaseClient'

interface Trade {
    id: string
    pair: string
    setup: string
    trade_date: string
    result: 'win' | 'loss' | 'breakeven'
    result_amount: number
    result_type: 'percentage' | 'money'
    risk_percentage: number
    risk_reward: number
    direction: 'Long' | 'Short'
    entry_time?: string
    exit_time?: string
    notes?: string
    image_url?: string
}

export default function TradeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [trade, setTrade] = useState<Trade | null>(null)
    const [loading, setLoading] = useState(true)
    const [accountCapital, setAccountCapital] = useState<number>(0)

    useEffect(() => {
        const fetchTradeAndCapital = async () => {
            try {
                // Fetch trade details
                const { data: tradeData, error: tradeError } = await supabase
                    .from('trades')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (tradeError) throw tradeError
                setTrade(tradeData)

                // Fetch account capital
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('account_capital')
                        .eq('id', user.id)
                        .single()

                    if (profile?.account_capital) {
                        setAccountCapital(parseFloat(profile.account_capital))
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTradeAndCapital()
    }, [id])

    const convertResult = (trade: Trade, targetType: 'percentage' | 'money'): number => {
        if (!trade.result_amount) return 0
        const amount = parseFloat(trade.result_amount.toString())

        if (trade.result_type === targetType) return amount
        if (!accountCapital || accountCapital <= 0) return 0

        if (trade.result_type === 'percentage' && targetType === 'money') {
            return (amount / 100) * accountCapital
        } else if (trade.result_type === 'money' && targetType === 'percentage') {
            return (amount / accountCapital) * 100
        }
        return amount
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

    if (!trade) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
                <p className="text-xl mb-4">Trade no encontrado</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg hover:bg-[var(--background)] transition-colors"
                >
                    Volver
                </button>
            </div>
        )
    }

    const dollarAmount = convertResult(trade, 'money')
    const percentageAmount = convertResult(trade, 'percentage')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-6"
        >
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
                Volver
            </button>

            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-xl">
                {/* Header */}
                <div className="p-8 border-b border-[var(--card-border)] bg-gradient-to-r from-[var(--card-bg)] to-[var(--background)]">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                                    {trade.pair}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${trade.direction === 'Long'
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                    }`}>
                                    {trade.direction}
                                </span>
                            </div>
                            <p className="text-[var(--text-secondary)] text-lg">{trade.setup}</p>
                        </div>
                        <div className="text-right">
                            <div className={`text-3xl font-bold mb-1 ${trade.result === 'win' ? 'text-emerald-500' :
                                trade.result === 'loss' ? 'text-rose-500' : 'text-amber-500'
                                }`}>
                                {trade.result === 'win' ? '+' : trade.result === 'loss' ? '-' : ''}
                                ${Math.abs(dollarAmount).toFixed(2)}
                            </div>
                            <p className={`text-sm font-medium ${trade.result === 'win' ? 'text-emerald-500/70' :
                                trade.result === 'loss' ? 'text-rose-500/70' : 'text-amber-500/70'
                                }`}>
                                {trade.result === 'win' ? '+' : trade.result === 'loss' ? '-' : ''}
                                {Math.abs(percentageAmount).toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Fecha</span>
                            </div>
                            <p className="font-semibold text-[var(--text-primary)]">
                                {format(new Date(trade.trade_date), 'dd MMM yyyy', { locale: es })}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Horario</span>
                            </div>
                            <p className="font-semibold text-[var(--text-primary)]">
                                {trade.entry_time || '--:--'} - {trade.exit_time || '--:--'}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
                                <Activity className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">Riesgo</span>
                            </div>
                            <p className="font-semibold text-[var(--text-primary)]">
                                {trade.risk_percentage}%
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs font-medium uppercase tracking-wider">R:R</span>
                            </div>
                            <p className="font-semibold text-[var(--text-primary)]">
                                {trade.risk_reward || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Notes */}
                    {trade.notes && (
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Notas de la Operación</h3>
                            <div className="p-6 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                                {trade.notes}
                            </div>
                        </div>
                    )}

                    {/* Image */}
                    {trade.image_url && (
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Captura del Gráfico
                            </h3>
                            <div className="rounded-xl overflow-hidden border border-[var(--card-border)] shadow-lg">
                                <img
                                    src={trade.image_url}
                                    alt={`Gráfico ${trade.pair}`}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
