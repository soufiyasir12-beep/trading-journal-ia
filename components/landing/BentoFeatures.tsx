'use client'

import { motion } from 'framer-motion'
import { Brain, LineChart, ShieldCheck, Users, Trophy } from 'lucide-react'

const features = [
    {
        title: "El Cerebro de la Operación",
        description: "Nuestra IA no solo mira números. Analiza tus notas, tus emociones y el contexto del mercado.",
        icon: Brain,
        colSpan: "col-span-1 md:col-span-2",
        bg: "bg-gradient-to-br from-indigo-900/20 to-purple-900/20"
    },
    {
        title: "Analíticas en Tiempo Real",
        description: "Visualiza tu curva de equidad crecer con gráficos interactivos.",
        icon: LineChart,
        colSpan: "col-span-1",
        bg: "bg-white/5"
    },
    {
        title: "Marketplace de Estrategias",
        description: "Accede a estrategias probadas por la comunidad. Compra, vende o comparte.",
        icon: Users,
        colSpan: "col-span-1",
        bg: "bg-white/5"
    },
    {
        title: "Seguridad Militar",
        description: "Tus datos y estrategias son tuyos. Encriptación de extremo a extremo.",
        icon: ShieldCheck,
        colSpan: "col-span-1",
        bg: "bg-white/5"
    },
    {
        title: "Gamificación del Trading",
        description: "Sube de nivel, consigue insignias y compite en el ranking global de traders disciplinados.",
        icon: Trophy,
        colSpan: "col-span-1 md:col-span-2",
        bg: "bg-gradient-to-br from-amber-900/20 to-orange-900/20"
    }
]

export default function BentoFeatures() {
    return (
        <section id="features" className="py-24 relative container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Todo lo que necesitas. <br /><span className="text-gray-500">Nada que no necesites.</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
                {features.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        whileHover={{ y: -5 }}
                        className={`${feature.colSpan} ${feature.bg} rounded-3xl p-8 border border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-colors`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <feature.icon className="w-24 h-24 text-white/5 -rotate-12 transform group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <div className="p-3 bg-white/10 w-fit rounded-lg mb-4 backdrop-blur-md">
                                <feature.icon className="w-6 h-6 text-amber-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
