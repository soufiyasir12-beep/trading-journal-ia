'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertCircle, TrendingUp, Lightbulb, Loader2, X } from 'lucide-react'

interface AIAnalysis {
    id: string
    analysis: string
    errors_detected?: string
    strengths?: string
    recommendations?: string
    created_at: string
}

export default function DashboardAIAnalysis() {
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchAnalysis()
    }, [])

    const fetchAnalysis = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/analyze-trades')
            const result = await response.json()

            if (response.ok && result.data) {
                setAnalysis(result.data)
            } else {
                setAnalysis(null)
            }
        } catch (err: any) {
            console.error('Error fetching analysis:', err)
            // Don't show error on initial load to keep dashboard clean
        } finally {
            setLoading(false)
        }
    }

    const handleAnalyze = async () => {
        try {
            setAnalyzing(true)
            setError(null)

            const response = await fetch('/api/analyze-trades', {
                method: 'POST',
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Error analyzing trades')
            }

            if (result.cached) {
                await fetchAnalysis()
            } else {
                setAnalysis(result.data)
            }
            setShowModal(true)
        } catch (err: any) {
            console.error('Error analyzing trades:', err)
            setError(err.message || 'Error analyzing trades. Make sure you have trades and GOOGLE_API_KEY is set.')
        } finally {
            setAnalyzing(false)
        }
    }

    const parseMarkdown = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('## ')) {
                    return <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-white">{line.replace('## ', '')}</h3>
                }
                if (line.startsWith('### ')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-white">{line.replace('### ', '')}</h4>
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <li key={index} className="ml-4 mb-2 text-gray-300">{line.replace(/^[-*] /, '')}</li>
                }
                if (/^\d+\.\s/.test(line)) {
                    return <li key={index} className="ml-4 mb-2 text-gray-300 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>
                }
                if (line.includes('**')) {
                    const parts = line.split('**')
                    return (
                        <p key={index} className="mb-3 text-gray-300">
                            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part))}
                        </p>
                    )
                }
                if (line.trim()) {
                    return <p key={index} className="mb-3 text-gray-300">{line}</p>
                }
                return <br key={index} />
            })
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl p-[1px] group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-50 blur-sm group-hover:opacity-75 transition-opacity duration-1000" />
                <div className="relative bg-[#080c14] rounded-[23px] p-8 overflow-hidden">
                    {/* Futuristic Glows */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center justify-center text-center gap-6">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-blue-400 animate-pulse" />
                            <h2 className="text-2xl font-bold text-white tracking-wide">
                                ANÁLISIS CON IA
                            </h2>
                        </div>

                        <p className="text-gray-400 max-w-lg text-base">
                            {analysis
                                ? "Tu análisis más reciente está listo. Haz clic para ver los detalles o genera uno nuevo."
                                : "Análisis inteligente de tus operaciones para detectar patrones y optimizar tu rentabilidad."}
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Analizando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        {analysis ? 'Generar Nuevo Análisis' : 'Analizar Operaciones'}
                                    </>
                                )}
                            </button>

                            {analysis && (
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Ver Último Análisis
                                </button>
                            )}
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm mt-2">{error}</p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {showModal && analysis && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0a0e17] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0e17]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Resultados del Análisis</h2>
                                        <p className="text-sm text-gray-400">
                                            Generado el {new Date(analysis.created_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-6">
                                    {analysis.errors_detected && (
                                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                                <h3 className="text-lg font-bold text-red-500">Errores Detectados</h3>
                                            </div>
                                            <div className="text-sm text-gray-300 pl-7">
                                                {parseMarkdown(analysis.errors_detected)}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.strengths && (
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                                                <h3 className="text-lg font-bold text-emerald-500">Puntos Fuertes</h3>
                                            </div>
                                            <div className="text-sm text-gray-300 pl-7">
                                                {parseMarkdown(analysis.strengths)}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.recommendations && (
                                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                                <h3 className="text-lg font-bold text-amber-500">Recomendaciones</h3>
                                            </div>
                                            <div className="text-sm text-gray-300 pl-7">
                                                {parseMarkdown(analysis.recommendations)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                        <h3 className="text-lg font-bold text-white mb-4">
                                            Análisis Detallado
                                        </h3>
                                        <div className="text-sm text-gray-300 leading-relaxed">
                                            {parseMarkdown(analysis.analysis)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
