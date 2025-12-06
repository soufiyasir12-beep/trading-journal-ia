'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, AlertTriangle, Search } from 'lucide-react'

const analysisSteps = [
    { text: "Escaneando estructura de mercado...", icon: Search, color: "text-blue-400" },
    { text: "Verificando reglas de estrategia 'Breakout'...", icon: Check, color: "text-green-400" },
    { text: "Analizando riesgo/beneficio (1:3)...", icon: Check, color: "text-green-400" },
    { text: "Detectando anomalías emocionales...", icon: AlertTriangle, color: "text-amber-400" },
    { text: "Generando reporte final...", icon: Sparkles, color: "text-purple-400" },
]

export default function LiveAnalysisDemo() {
    const [step, setStep] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % (analysisSteps.length + 2)) // +2 para dar pausa al final
        }, 1500)
        return () => clearInterval(interval)
    }, [])

    return (
        <section id="ai" className="py-24 bg-black/30 border-y border-white/5 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    <div className="lg:w-1/2">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Tu Analista Personal <br />
                            <span className="text-amber-500">Disponible 24/7</span>
                        </h2>
                        <p className="text-lg text-gray-400 mb-8">
                            No esperes a revisar tus trades el fin de semana. NeuroStrat analiza cada operación al instante,
                            diciéndote exactamente qué hiciste bien y dónde te traicionó tu mente.
                        </p>

                        <div className="space-y-4">
                            {analysisSteps.map((s, i) => (
                                <div key={i} className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${step > i ? 'bg-white/5 opacity-100' : 'opacity-30'}`}>
                                    <div className={`p-2 rounded-full ${step > i ? 'bg-white/10' : 'bg-transparent'}`}>
                                        <s.icon className={`w-5 h-5 ${s.color}`} />
                                    </div>
                                    <span className={`text-sm md:text-base ${step > i ? 'text-white' : 'text-gray-500'}`}>{s.text}</span>
                                    {step > i && (
                                        <motion.div layoutId="check" className="ml-auto">
                                            <div className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2 w-full relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-500/20 blur-[100px] pointer-events-none" />

                        <motion.div
                            className="relative bg-[#0F1115] border border-white/10 rounded-2xl p-6 shadow-2xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Mock Chat Interface */}
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="ml-auto text-xs text-gray-500 font-mono">AI Analysis v2.0</span>
                            </div>

                            <div className="space-y-4 font-mono text-sm">
                                <div className="bg-white/5 p-3 rounded-lg rounded-tl-none border border-white/5 text-gray-300">
                                    Analizando trade #1402: EURUSD Short @ 1.0850...
                                </div>

                                <AnimatePresence mode="wait">
                                    {step >= 4 ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Sparkles className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                                                <div className="space-y-2">
                                                    <p className="text-white font-bold">Análisis Completado:</p>
                                                    <p className="text-gray-300">
                                                        Buen respeto de la estructura bajista. Sin embargo, <span className="text-red-400">cerraste la operación prematuramente</span> antes de que el precio tocara tu TP1.
                                                    </p>
                                                    <p className="text-gray-300">
                                                        <strong>Detección Psicológica:</strong> Miedo a perder ganancias (Aversión a la pérdida).
                                                    </p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Error de Disciplina</span>
                                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Entrada Técnica: A+</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <LoaderDot delay={0} />
                                            <LoaderDot delay={0.2} />
                                            <LoaderDot delay={0.4} />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    )
}

const LoaderDot = ({ delay }: { delay: number }) => (
    <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay }}
        className="w-2 h-2 bg-gray-500 rounded-full"
    />
)
