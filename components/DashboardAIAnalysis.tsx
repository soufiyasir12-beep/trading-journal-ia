'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertCircle, TrendingUp, Lightbulb, Loader2, X, BrainCircuit } from 'lucide-react'

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
            setError(err.message || 'Error analyzing trades.')
        } finally {
            setAnalyzing(false)
        }
    }

    const parseMarkdown = (text: string) => {
        return text
            .split('\n')
            .map((line, index) => {
                if (line.startsWith('## ')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-white tracking-wide">{line.replace('## ', '')}</h3>
                }
                if (line.startsWith('### ')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-white">{line.replace('### ', '')}</h4>
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <li key={index} className="ml-4 mb-2 text-slate-300 list-disc marker:text-blue-500">{line.replace(/^[-*] /, '')}</li>
                }
                if (/^\d+\.\s/.test(line)) {
                    return <li key={index} className="ml-4 mb-2 text-slate-300 list-decimal marker:text-blue-500 font-medium">{line.replace(/^\d+\.\s/, '')}</li>
                }
                if (line.includes('**')) {
                    const parts = line.split('**')
                    return (
                        <p key={index} className="mb-3 text-slate-300">
                            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part))}
                        </p>
                    )
                }
                if (line.trim()) {
                    return <p key={index} className="mb-3 text-slate-300">{line}</p>
                }
                return <br key={index} />
            })
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mt-8 group"
            >
                {/* Floating Glass Container */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.3)] transition-all duration-500 hover:shadow-[0_20px_60px_-12px_rgba(59,130,246,0.5)]">

                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

                    {/* Background Glows */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-8">

                        {/* Brain Icon Placeholder / Hero Icon */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
                            <div className="relative bg-slate-950 p-4 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                <BrainCircuit className="h-10 w-10 text-blue-400" />
                            </div>
                        </div>

                        <div className="space-y-2 max-w-2xl">
                            <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                ANÁLISIS CON IA
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                {analysis
                                    ? "Tu análisis más reciente está listo. Descubre patrones ocultos en tu trading."
                                    : "Utiliza nuestra inteligencia artificial para analizar tus operaciones, detectar errores y optimizar tu rentabilidad."}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="relative group/btn overflow-hidden px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.6)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />

                                {analyzing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Procesando Datos...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        <span>{analysis ? 'Generar Nuevo Análisis' : 'Analizar Operaciones'}</span>
                                    </>
                                )}
                            </button>

                            {analysis && (
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-8 py-4 bg-slate-800/50 border border-white/10 text-white font-semibold rounded-xl hover:bg-slate-800/80 hover:border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                                >
                                    <span>Ver Último Análisis</span>
                                </button>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-rose-400 text-sm font-medium bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20"
                            >
                                {error}
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Analysis Modal - Styling Refined */}
            <AnimatePresence>
                {showModal && analysis && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0f1120] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
                        >
                             {/* Modal Glows */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f1120]/80 backdrop-blur-xl sticky top-0 z-20">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-wide">Resultados del Análisis</h2>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                                            {new Date(analysis.created_at).toLocaleDateString('es-ES', {
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
                                    className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar relative z-10 bg-[#0f1120]/50">
                                <div className="space-y-8">
                                    {analysis.errors_detected && (
                                        <div className="group p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 transition-colors">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-rose-500/10 rounded-lg">
                                                    <AlertCircle className="h-5 w-5 text-rose-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-rose-400">Errores Detectados</h3>
                                            </div>
                                            <div className="text-sm text-slate-300 pl-2">
                                                {parseMarkdown(analysis.errors_detected)}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.strengths && (
                                        <div className="group p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-emerald-400">Puntos Fuertes</h3>
                                            </div>
                                            <div className="text-sm text-slate-300 pl-2">
                                                {parseMarkdown(analysis.strengths)}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.recommendations && (
                                        <div className="group p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                                    <Lightbulb className="h-5 w-5 text-amber-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-amber-400">Recomendaciones</h3>
                                            </div>
                                            <div className="text-sm text-slate-300 pl-2">
                                                {parseMarkdown(analysis.recommendations)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <BrainCircuit className="h-5 w-5 text-blue-400" />
                                            Análisis Detallado
                                        </h3>
                                        <div className="text-slate-300 leading-relaxed text-base">
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
