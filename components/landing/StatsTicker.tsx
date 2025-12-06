'use client'

import { motion } from 'framer-motion'

const stats = [
    "BTC/USD Analizado: Win (+2.4R)",
    "IA detectó FOMO en EUR/USD",
    "Estrategia 'Scalping Gold' optimizada",
    "Usuario @AlexTrader subió +12% este mes",
    "Nuevo análisis de psicología completado",
    "XAU/USD Entrada válida según reglas",
    "Stop Loss ajustado por volatilidad",
]

export default function StatsTicker() {
    return (
        <div className="w-full bg-black/50 border-y border-white/5 py-4 overflow-hidden flex relative z-20 backdrop-blur-sm">
            <div className="flex whitespace-nowrap">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                    className="flex gap-16"
                >
                    {[...stats, ...stats, ...stats].map((stat, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                            {stat}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Gradients to fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#030014] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#030014] to-transparent pointer-events-none" />
        </div>
    )
}
