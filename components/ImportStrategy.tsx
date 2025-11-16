'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface ImportStrategyProps {
  onImportSuccess: () => void
}

export default function ImportStrategy({ onImportSuccess }: ImportStrategyProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
      ]
      const validExtensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.txt']
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
          text: 'Tipo de archivo no válido. Use PDF, DOCX, Excel o archivos de texto.',
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

      const response = await fetch('/api/import/strategy', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: result.message || 'Estrategia importada exitosamente',
        })
        setFile(null)
        setTimeout(() => {
          setIsOpen(false)
          onImportSuccess()
        }, 1500)
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Error al importar la estrategia',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al importar la estrategia. Por favor intenta nuevamente.',
      })
    } finally {
      setUploading(false)
    }
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
        Importar Estrategia
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
                    Importar Estrategia
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
                        accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="strategy-file-input"
                      />
                      <label
                        htmlFor="strategy-file-input"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <FileText className="h-8 w-8 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          PDF, DOCX, Excel o Texto
                        </span>
                        {file && (
                          <span className="text-sm font-medium text-blue-600 mt-2">
                            {file.name}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="text-xs text-[var(--text-secondary)] space-y-1">
                    <p>Formatos soportados:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>PDF (.pdf)</li>
                      <li>Word (.docx, .doc)</li>
                      <li>Excel (.xlsx, .xls, .csv)</li>
                      <li>Texto plano (.txt)</li>
                    </ul>
                  </div>

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

