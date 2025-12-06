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
    <section id="pricing" className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030014] to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
            Precios Simples y Transparentes
          </h2>
          <p className="text-lg text-gray-400">
            Elige el plan que mejor se adapte a tus necesidades. Sin sorpresas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:max-w-5xl lg:mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative rounded-3xl border p-8 shadow-2xl transition-all ${plan.popular
                  ? 'border-amber-500/50 bg-[#0a0a0a] shadow-amber-500/10'
                  : 'border-white/5 bg-[#0a0a0a]/50 hover:border-white/10'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1 text-sm font-bold text-black shadow-lg shadow-amber-500/20">
                    <Zap className="h-4 w-4" />
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-lg text-gray-400">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {plan.description}
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className={`mt-1 p-0.5 rounded-full ${plan.popular ? 'bg-amber-500/20' : 'bg-white/10'}`}>
                      <Check className={`h-4 w-4 ${plan.popular ? 'text-amber-500' : 'text-gray-400'}`} />
                    </div>
                    <span className="text-gray-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/auth/register')}
                className={`mt-8 w-full rounded-xl px-6 py-4 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${plan.popular
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:shadow-lg hover:shadow-amber-500/20'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
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
