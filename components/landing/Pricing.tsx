'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Check, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 'Gratis',
    description: 'Perfecto para empezar',
    features: [
      'Registro ilimitado de trades',
      'Análisis básico de rendimiento',
      'Hasta 3 estrategias',
      'Gráficos básicos',
      'Acceso desde cualquier dispositivo',
    ],
    cta: 'Comenzar Gratis',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mes',
    description: 'Para traders serios',
    features: [
      'Todo lo de Free',
      'Análisis automático con IA',
      'Detección de errores recurrentes',
      'Evaluación según estrategia',
      'Estrategias ilimitadas',
      'Análisis avanzados y reportes',
      'Soporte prioritario',
      'Exportación de datos',
    ],
    cta: 'Empezar Prueba Gratis',
    popular: true,
  },
]

export default function Pricing() {
  const router = useRouter()

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Precios Simples y Transparentes
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:max-w-5xl lg:mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all ${
                plan.popular
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 dark:border-blue-400'
                  : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                    <Zap className="h-4 w-4" />
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/auth/register')}
                className={`mt-8 w-full rounded-lg px-6 py-3 font-semibold transition-all cursor-pointer ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                    : 'border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600'
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

