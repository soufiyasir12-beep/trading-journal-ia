'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Rocket } from 'lucide-react'

export default function CallToAction() {
    const router = useRouter()

    return (
        <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-900/10 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto bg-[#0F1115] border border-white/10 rounded-3xl p-12 md:p-20 relative overflow-hidden"
                >
                    {/* Background Glows within card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-[#0F1115] to-[#0F1115] pointer-events-none" />

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            ¿Listo para dejar de <br />
                            <span className="text-gray-500 line-through decoration-red-500 decoration-4">adivinar?</span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                            Únete a miles de traders que usan datos e inteligencia artificial para construir consistencia real.
                        </p>

                        <button
                            onClick={() => router.push('/auth/register')}
                            className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all flex items-center gap-3 mx-auto cursor-pointer"
                        >
                            <Rocket className="w-6 h-6" />
                            Crear Cuenta Gratis
                        </button>

                        <p className="mt-6 text-sm text-gray-500">
                            No requiere tarjeta de crédito • Plan gratuito disponible
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
