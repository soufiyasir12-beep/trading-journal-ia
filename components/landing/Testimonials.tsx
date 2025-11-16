'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Carlos M.',
    role: 'Trader Profesional',
    content:
      'El análisis automático con IA ha transformado completamente mi forma de hacer trading. Ahora identifico errores que antes pasaban desapercibidos.',
    rating: 5,
  },
  {
    name: 'Ana R.',
    role: 'Day Trader',
    content:
      'La detección de errores recurrentes es increíble. Me ha ayudado a mantener la disciplina y mejorar mi win rate significativamente.',
    rating: 5,
  },
  {
    name: 'Miguel S.',
    role: 'Swing Trader',
    content:
      'La evaluación según mi estrategia personalizada es exactamente lo que necesitaba. Finalmente tengo un sistema que entiende mi enfoque.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Miles de traders confían en NeuroStrat
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-gray-200 dark:text-gray-800" />
              
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="mb-6 text-gray-700 dark:text-gray-300">
                "{testimonial.content}"
              </p>

              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

