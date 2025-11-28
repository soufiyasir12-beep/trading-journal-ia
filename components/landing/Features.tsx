'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  BarChart3,
  Target,
  Shield,
  Clock,
  TrendingUp,
} from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Registro Completo',
    description:
      'Documenta todos tus trades con información detallada: entrada, salida, estrategia, emociones y más.',
  },
  {
    icon: BarChart3,
    title: 'Análisis Visual',
    description:
      'Gráficos y estadísticas en tiempo real para entender mejor tu rendimiento y patrones de trading.',
  },
  {
    icon: Target,
    title: 'Gestión de Estrategias',
    description:
      'Define y gestiona múltiples estrategias, compara su efectividad y optimiza tu enfoque.',
  },
  {
    icon: Shield,
    title: 'Datos Seguros',
    description:
      'Tus datos están protegidos con encriptación de extremo a extremo y respaldos automáticos.',
  },
  {
    icon: Clock,
    title: 'Acceso 24/7',
    description:
      'Accede a tu diario desde cualquier dispositivo, en cualquier momento y lugar.',
  },
  {
    icon: TrendingUp,
    title: 'Mejora Continua',
    description:
      'Identifica áreas de mejora con análisis detallados y recomendaciones personalizadas.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Todo lo que necesitas para <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)]">mejorar</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Herramientas profesionales diseñadas para traders serios
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 0 20px rgba(112, 66, 248, 0.2)" }}
              className="glass-card p-8 rounded-2xl group hover:border-[var(--neon-purple)]/50 transition-all"
            >
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] p-3 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white group-hover:text-[var(--neon-blue)] transition-colors">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

