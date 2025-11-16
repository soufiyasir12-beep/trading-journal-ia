'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react'

interface ImportTradesProps {
  onImportSuccess: () => void
}

export default function ImportTrades({ onImportSuccess }: ImportTradesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [useAI, setUseAI] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ]
      const validExtensions = ['.xlsx', '.xls', '.csv', '.txt', '.pdf', '.docx', '.doc']
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()

      if (
        validTypes.includes(selectedFile.type) ||
        (fileExtension && validExtensions.includes(`.${fileExtension}`))
      ) {
        setFile(selectedFile)
        setMessage(null)
      } else {
        setMessage({
          type: 'error',
          text: 'Tipo de archivo no válido. Use Excel, CSV, PDF, DOCX o TXT.',
        })
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('useAI', useAI.toString())

      const response = await fetch('/api/import/trades', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: result.message || `${result.count || 0} trade(s) importado(s) exitosamente`,
        })
        setFile(null)
        setTimeout(() => {
          setIsOpen(false)
          onImportSuccess()
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Error al importar los trades',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al importar los trades. Por favor intenta nuevamente.',
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Crear un template CSV
    const headers = [
      'pair',
      'trade_date',
      'direction',
      'risk_percentage',
      'risk_reward',
      'result',
      'result_amount',
      'setup',
      'notes',
      'entry_time',
      'exit_time',
    ]
    const exampleRow = [
      'EUR/USD',
      '2024-01-15',
      'Long',
      '2.0',
      '2.5',
      'win',
      '5.0',
      'Breakout',
      'Operación exitosa',
      '09:30',
      '14:45',
    ]

    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_trades.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Importar Trades
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => !uploading && setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[var(--card-bg)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--card-border)]">
                <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Importar Trades
                  </h2>
                  <button
                    onClick={() => !uploading && setIsOpen(false)}
                    disabled={uploading}
                    className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Selecciona un archivo
                    </label>
                    <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.txt"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="trades-file-input"
                      />
                      <label
                        htmlFor="trades-file-input"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <FileSpreadsheet className="h-8 w-8 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          Excel, CSV, PDF, DOCX o TXT
                        </span>
                        {file && (
                          <span className="text-sm font-medium text-blue-600 mt-2">
                            {file.name}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>

                  {(file?.name.toLowerCase().endsWith('.pdf') || 
                    file?.name.toLowerCase().endsWith('.docx') || 
                    file?.name.toLowerCase().endsWith('.txt')) && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useAI}
                          onChange={(e) => setUseAI(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-[var(--text-primary)]">
                          Usar IA para parsing inteligente (recomendado para documentos no estructurados)
                        </span>
                      </label>
                      <p className="text-xs text-[var(--text-secondary)] mt-2 ml-6">
                        La IA puede extraer información incluso de documentos con formato irregular
                      </p>
                    </div>
                  )}

                  {file?.name.toLowerCase().endsWith('.xlsx') || 
                   file?.name.toLowerCase().endsWith('.xls') || 
                   file?.name.toLowerCase().endsWith('.csv') ? (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                        Columnas esperadas (el sistema detectará automáticamente variaciones):
                      </h3>
                      <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                        <li><strong>pair/par/symbol</strong> - Par de trading (ej: EUR/USD)</li>
                        <li><strong>trade_date/fecha/date</strong> - Fecha (cualquier formato)</li>
                        <li><strong>direction/direccion/tipo</strong> - Long o Short</li>
                        <li><strong>risk_percentage/risk/riesgo</strong> - Porcentaje de riesgo</li>
                        <li><strong>risk_reward/rr/r:r</strong> - Ratio R:R</li>
                        <li><strong>result/resultado</strong> - win, loss o breakeven</li>
                        <li><strong>result_amount/cantidad/amount</strong> - Cantidad del resultado</li>
                        <li><strong>setup/configuracion</strong> - Tipo de setup</li>
                        <li><strong>notes/nota/comentario</strong> - Notas adicionales (opcional)</li>
                        <li><strong>entry_time/hora_entrada/entrada</strong> - Hora de entrada (opcional)</li>
                        <li><strong>exit_time/hora_salida/salida</strong> - Hora de salida (opcional)</li>
                      </ul>
                      <p className="text-xs text-[var(--text-secondary)] mt-2 italic">
                        El sistema se adapta automáticamente a diferentes nombres de columnas en español e inglés.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                        Parsing Inteligente Activado
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        El sistema buscará automáticamente información de trades en el documento, incluso si no está en formato estructurado. 
                        Puede detectar pares de divisas, fechas, resultados, y más información relevante.
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadTemplate}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--card-bg)] transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Plantilla CSV
                  </motion.button>

                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg flex items-center gap-2 ${
                        message.type === 'success'
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}
                    >
                      {message.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <span className="text-sm">{message.text}</span>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Importar
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsOpen(false)}
                      disabled={uploading}
                      className="px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-lg font-medium disabled:opacity-50 cursor-pointer"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

