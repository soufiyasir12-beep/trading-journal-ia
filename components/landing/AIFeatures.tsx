'use client'

import { motion } from 'framer-motion'
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'

const aiFeatures = [
  {
    icon: Sparkles,
    title: 'Análisis Automático de Trades',
    description:
      'Nuestra IA analiza automáticamente cada operación que registras, identificando patrones, fortalezas y áreas de mejora. Obtén insights profundos sin esfuerzo.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: AlertTriangle,
    title: 'Detección de Errores Recurrentes',
    description:
      'La inteligencia artificial detecta errores que cometes repetidamente y te alerta sobre ellos. Aprende de tus fallos y evita cometer los mismos errores.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: CheckCircle2,
    title: 'Evaluación según tu Estrategia',
    description:
      'Cada análisis se personaliza según tu estrategia de trading específica. La IA evalúa si tus trades siguen tus reglas y te ayuda a mantener la disciplina.',
    gradient: 'from-orange-500 to-red-500',
  },
]

export default function AIFeatures() {
  return (
    <section id="ai-features" className="py-24 sm:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg"
          >
            🤖 Potenciado por IA
          </motion.span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Inteligencia Artificial que Transforma tu Trading
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Análisis profundo y personalizado para cada trader
          </p>
        </motion.div>

        <div className="mt-16 space-y-12">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`flex flex-col gap-8 lg:flex-row lg:items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1">
                <div className={`inline-flex rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`h-64 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-20 shadow-xl`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

