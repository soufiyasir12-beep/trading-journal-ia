'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, PlayCircle } from 'lucide-react'

export default function ModernHero() {
    const router = useRouter()

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="container mx-auto px-4 relative z-10 text-center">


                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6"
                >
                    Tu Trading <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700">
                        Científicamente Perfecto
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed"
                >
                    Deja de operar por intuición. NeuroStrat utiliza IA avanzada para auditar tu psicología,
                    detectar patrones ocultos y convertir tu journal en una máquina de rentabilidad.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => router.push('/auth/register')}
                        className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        Comenzar Gratis
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
                    </button>

                    <button className="group px-8 py-4 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-all w-full sm:w-auto flex items-center justify-center gap-2 border border-white/10 cursor-pointer">
                        <PlayCircle className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                        Ver Demo en Vivo
                    </button>
                </motion.div>

                {/* Dashboard Preview Mockup with 3D Tilt Effect */}
                <motion.div
                    initial={{ opacity: 0, y: 50, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.5, type: "spring" }}
                    className="mt-20 relative mx-auto max-w-5xl"
                    style={{ perspective: "1000px" }}
                >
                    <div className="relative rounded-xl bg-[#0a0a0a] border border-white/10 p-2 shadow-2xl shadow-amber-500/10 transform transition-transform hover:scale-[1.01] duration-500">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-xl" />
                        {/* Placeholder image that uses the uploaded verification image as mock */}
                        <img
                            src="/landing_verification.png"
                            alt="Dashboard Preview"
                            className="rounded-lg w-full h-auto object-cover opacity-90 border border-white/5"
                        />

                        {/* Floating Elements on top of image */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -top-10 -right-10 bg-[#111] border border-green-500/30 p-4 rounded-xl shadow-xl backdrop-blur-md hidden md:block"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-green-400 font-mono text-sm font-bold">+15% Winrate</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Detectado por IA esta semana</div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            className="absolute -bottom-5 -left-5 bg-[#111] border border-amber-500/30 p-4 rounded-xl shadow-xl backdrop-blur-md hidden md:block"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span className="text-amber-400 font-mono text-sm font-bold">Patrón Identificado</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Fomo en apertura NY</div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
