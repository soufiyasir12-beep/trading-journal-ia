'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Strategy {
  id: string
  name: string
  description?: string
  rules: string
  created_at: string
  updated_at: string
}

export default function StrategyPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
  })

  useEffect(() => {
    fetchStrategies()
  }, [])

  const fetchStrategies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/strategies')
      const result = await response.json()

      if (response.ok) {
        setStrategies(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching strategies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        // Actualizar estrategia existente
        const response = await fetch('/api/strategies', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingId,
            ...formData,
          }),
        })

        if (response.ok) {
          await fetchStrategies()
          resetForm()
        }
      } else {
        // Crear nueva estrategia
        const response = await fetch('/api/strategies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          await fetchStrategies()
          resetForm()
        }
      }
    } catch (error) {
      console.error('Error saving strategy:', error)
    }
  }

  const handleEdit = (strategy: Strategy) => {
    setEditingId(strategy.id)
    setFormData({
      name: strategy.name,
      description: strategy.description || '',
      rules: strategy.rules,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta estrategia?')) {
      return
    }

    try {
      const response = await fetch(`/api/strategies?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchStrategies()
      }
    } catch (error) {
      console.error('Error deleting strategy:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rules: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
          className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 bg-clip-text text-transparent">
            Estrategias
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Gestiona tus estrategias de trading para análisis con IA
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancelar' : 'Nueva Estrategia'}
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
        >
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            {editingId ? 'Editar Estrategia' : 'Nueva Estrategia'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Reglas de la Estrategia *
              </label>
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                rows={10}
                required
                placeholder="Ejemplo:&#10;1. Solo operar en dirección de la tendencia principal&#10;2. Risk/Reward mínimo de 1:2&#10;3. Stop loss siempre al 2% del capital&#10;4. Solo operar en horas de alta volatilidad (9:00-11:00, 15:00-17:00)"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--card-bg)] transition-all flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {strategies.length > 0 ? (
          strategies.map((strategy) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                      {strategy.name}
                    </h3>
                    {strategy.description && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {strategy.description}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                      Creada el{' '}
                      {new Date(strategy.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(strategy)}
                    className="p-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(strategy.id)}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Reglas:
                </h4>
                <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-mono">
                  {strategy.rules}
                </pre>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
            <FileText className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)]">
              No hay estrategias guardadas. Crea una nueva estrategia para comenzar.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
