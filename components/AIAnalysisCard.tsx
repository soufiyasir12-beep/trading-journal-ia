'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, AlertCircle, TrendingUp, Lightbulb, Loader2 } from 'lucide-react'

interface AIAnalysis {
  id: string
  analysis: string
  errors_detected?: string
  strengths?: string
  recommendations?: string
  created_at: string
}

export default function AIAnalysisCard() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analyze-trades')
      const result = await response.json()

      if (response.ok && result.data) {
        setAnalysis(result.data)
      } else {
        setAnalysis(null)
      }
    } catch (err: any) {
      console.error('Error fetching analysis:', err)
      setError(err.message || 'Error loading analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true)
      setError(null)

      const response = await fetch('/api/analyze-trades', {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error analyzing trades')
      }

      if (result.cached) {
        // Si es un análisis cacheado, recargar
        await fetchAnalysis()
      } else {
        setAnalysis(result.data)
      }
    } catch (err: any) {
      console.error('Error analyzing trades:', err)
      setError(err.message || 'Error analyzing trades. Make sure you have trades and GOOGLE_API_KEY is set.')
    } finally {
      setAnalyzing(false)
    }
  }

  const parseMarkdown = (text: string) => {
    // Simple markdown parser for headings and lists
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('## ')) {
          return (
            <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-[var(--text-primary)]">
              {line.replace('## ', '')}
            </h3>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-[var(--text-primary)]">
              {line.replace('### ', '')}
            </h4>
          )
        }
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={index} className="ml-4 mb-2 text-[var(--text-secondary)]">
              {line.replace(/^[-*] /, '')}
            </li>
          )
        }
        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
          return (
            <li key={index} className="ml-4 mb-2 text-[var(--text-secondary)] list-decimal">
              {line.replace(/^\d+\.\s/, '')}
            </li>
          )
        }
        // Bold text
        if (line.includes('**')) {
          const parts = line.split('**')
          return (
            <p key={index} className="mb-3 text-[var(--text-secondary)]">
              {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
            </p>
          )
        }
        // Regular paragraphs
        if (line.trim()) {
          return (
            <p key={index} className="mb-3 text-[var(--text-secondary)]">
              {line}
            </p>
          )
        }
        return <br key={index} />
      })
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-[var(--card-bg)] p-6 shadow-lg border border-[var(--card-border)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Análisis con IA</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Análisis inteligente de tus operaciones
            </p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analizar Operaciones
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-500">Error</p>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {analysis ? (
        <div className="space-y-6">
          <div className="text-xs text-[var(--text-secondary)] mb-4">
            Análisis generado el{' '}
            {new Date(analysis.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>

          <div className="prose prose-invert max-w-none">
            {analysis.errors_detected && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-500">Errores Detectados</h3>
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {parseMarkdown(analysis.errors_detected)}
                </div>
              </div>
            )}

            {analysis.strengths && (
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-500">Puntos Fuertes</h3>
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {parseMarkdown(analysis.strengths)}
                </div>
              </div>
            )}

            {analysis.recommendations && (
              <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-amber-500">Recomendaciones</h3>
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {parseMarkdown(analysis.recommendations)}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                Análisis Completo
              </h3>
              <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                {parseMarkdown(analysis.analysis)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
          <p className="text-[var(--text-secondary)] mb-4">
            No hay análisis disponible. Haz clic en "Analizar Operaciones" para generar un análisis
            de tus trades.
          </p>
          <p className="text-xs text-[var(--text-secondary)] opacity-75">
            Asegúrate de tener trades registrados y una estrategia definida (opcional) para obtener
            el mejor análisis.
          </p>
        </div>
      )}
    </motion.div>
  )
}

