import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { 
  parseTradesFromText, 
  normalizeTrade, 
  isValidParsedTrade,
  type ParsedTrade 
} from '@/lib/intelligentParser'
import { createGeminiClient } from '@/lib/geminiClient'
import '@/lib/pdfPolyfill' // Polyfill para DOMMatrix

// Dynamic import for server-side only library
const XLSX = require('xlsx')

/**
 * POST /api/import/trades
 * Importa trades desde un archivo Excel (CSV, XLSX)
 * Ahora con parsing inteligente que se adapta a diferentes formatos
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const useAI = formData.get('useAI') === 'true' // Opción para usar IA

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    let trades: any[] = []
    
    // Determinar tipo de archivo y procesar
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      // Procesar archivo Excel/CSV con mapeo inteligente mejorado
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' })

      if (!jsonData || jsonData.length === 0) {
        return NextResponse.json(
          { error: 'El archivo está vacío o no tiene datos' },
          { status: 400 }
        )
      }

      // Mapeo inteligente mejorado de columnas
      const columns = Object.keys(jsonData[0] as any)
      const columnMappings: Record<string, string> = {}

      // Mapeo flexible de columnas (más variaciones)
      const mappings = {
        pair: ['pair', 'par', 'symbol', 'activo', 'instrumento', 'instrument', 'símbolo', 'moneda', 'currency'],
        trade_date: ['fecha', 'date', 'trade_date', 'fecha_trade', 'día', 'day', 'fecha operación'],
        direction: ['direction', 'direccion', 'tipo', 'tipo_operacion', 'operación', 'operation', 'side', 'posición'],
        risk_percentage: ['risk', 'riesgo', 'risk_percentage', 'porcentaje_riesgo', '% riesgo', 'risk %', 'riesgo %'],
        risk_reward: ['risk_reward', 'rr', 'r:r', 'risk:reward', 'risk/reward', 'ratio', 'risk reward'],
        result: ['result', 'resultado', 'outcome', 'ganancia', 'pérdida', 'perdida', 'win', 'loss', 'gané', 'perdí'],
        result_amount: ['result_amount', 'amount', 'cantidad', 'ganancia', 'pérdida', 'perdida', 'profit', 'loss', 'resultado_cantidad', 'monto'],
        setup: ['setup', 'configuracion', 'estrategia', 'strategy', 'tipo_setup', 'setup_type', 'tipo'],
        notes: ['notes', 'nota', 'notas', 'comentario', 'comentarios', 'comment', 'observaciones', 'descripción'],
        entry_time: ['entry_time', 'hora_entrada', 'entrada', 'entry', 'hora entrada', 'time entry', 'hora ent'],
        exit_time: ['exit_time', 'hora_salida', 'salida', 'exit', 'hora salida', 'time exit', 'hora sal'],
      }

      // Crear mapeo de columnas
      for (const [key, possibleNames] of Object.entries(mappings)) {
        const found = columns.find(col => {
          const colLower = col.toLowerCase().trim()
          return possibleNames.some(name => colLower.includes(name.toLowerCase()) || colLower === name.toLowerCase())
        })
        if (found) {
          columnMappings[key] = found
        }
      }

      // Procesar cada fila usando el mapeo inteligente
      for (const row of jsonData) {
        const rowData = row as any
        const trade: any = {
          user_id: user.id,
        }

        // Mapear cada campo usando el mapeo inteligente
        for (const [key, columnName] of Object.entries(columnMappings)) {
          const value = rowData[columnName]
          if (value !== undefined && value !== null && value !== '') {
            switch (key) {
              case 'pair':
                trade.pair = String(value).trim().toUpperCase()
                break
              case 'trade_date':
                let dateStr = String(value).trim()
                try {
                  const dateObj = new Date(dateStr)
                  if (!isNaN(dateObj.getTime())) {
                    dateStr = dateObj.toISOString().split('T')[0]
                  } else if (dateStr.includes('/')) {
                    const parts = dateStr.split('/')
                    if (parts.length === 3) {
                      if (parts[0].length === 4) {
                        dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
                      } else {
                        dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
                      }
                    }
                  }
                } catch (e) {
                  // Mantener formato original
                }
                trade.trade_date = dateStr
                break
              case 'direction':
                const dirStr = String(value).toLowerCase()
                if (dirStr.includes('long') || dirStr.includes('compra') || dirStr === 'l') {
                  trade.direction = 'Long'
                } else if (dirStr.includes('short') || dirStr.includes('venta') || dirStr === 's') {
                  trade.direction = 'Short'
                }
                break
              case 'risk_percentage':
                trade.risk_percentage = parseFloat(String(value)) || 0
                break
              case 'risk_reward':
                trade.risk_reward = parseFloat(String(value)) || null
                break
              case 'result':
                const resultStr = String(value).toLowerCase()
                if (resultStr.includes('loss') || resultStr.includes('perdida') || resultStr === 'l') {
                  trade.result = 'loss'
                } else if (resultStr.includes('breakeven') || resultStr.includes('empate') || resultStr === 'be') {
                  trade.result = 'breakeven'
                } else {
                  trade.result = 'win'
                }
                break
              case 'result_amount':
                trade.result_amount = parseFloat(String(value)) || 0
                break
              case 'setup':
                trade.setup = String(value).trim()
                break
              case 'notes':
                trade.notes = String(value).trim()
                break
              case 'entry_time':
                let entryTime = String(value).trim()
                if (entryTime && !entryTime.includes(':')) {
                  const timeValue = parseFloat(entryTime)
                  if (!isNaN(timeValue) && timeValue < 1) {
                    const hours = Math.floor(timeValue * 24)
                    const minutes = Math.floor((timeValue * 24 - hours) * 60)
                    entryTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
                  }
                }
                trade.entry_time = entryTime || null
                break
              case 'exit_time':
                let exitTime = String(value).trim()
                if (exitTime && !exitTime.includes(':')) {
                  const timeValue = parseFloat(exitTime)
                  if (!isNaN(timeValue) && timeValue < 1) {
                    const hours = Math.floor(timeValue * 24)
                    const minutes = Math.floor((timeValue * 24 - hours) * 60)
                    exitTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
                  }
                }
                trade.exit_time = exitTime || null
                break
            }
          }
        }

        // Validar campos requeridos y agregar valores por defecto
        if (trade.pair && trade.trade_date) {
          trade.direction = trade.direction || 'Long'
          trade.risk_percentage = trade.risk_percentage || 0
          trade.result = trade.result || 'win'
          trade.result_amount = trade.result_amount || 0
          trade.result_type = 'percentage'
          trade.setup = trade.setup || 'Importado'
          
          trades.push(trade)
        }
      }
    } else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.txt')) {
      // Procesar archivos de texto con parsing inteligente
      let extractedText = ''
      
      if (fileName.endsWith('.pdf')) {
        try {
          // pdf-parse v2.4.5 usa una clase PDFParse
          const pdfParse = require('pdf-parse')
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          // Crear instancia de PDFParse y extraer texto
          const pdfInstance = new pdfParse.PDFParse(buffer, {})
          await pdfInstance.load()
          extractedText = await pdfInstance.getText()
        } catch (pdfError: any) {
          console.error('Error parsing PDF:', pdfError)
          return NextResponse.json(
            { error: 'Error al procesar el archivo PDF. Por favor, convierte el PDF a texto o usa otro formato.' },
            { status: 400 }
          )
        }
      } else if (fileName.endsWith('.docx')) {
        try {
          // Dynamic import para mammoth
          const mammothLib = require('mammoth')
          const mammoth = mammothLib.default || mammothLib
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const result = await mammoth.extractRawText({ buffer })
          extractedText = result.value
        } catch (docxError: any) {
          console.error('Error parsing DOCX:', docxError)
          return NextResponse.json(
            { error: 'Error al procesar el archivo DOCX. Por favor, intenta con otro formato.' },
            { status: 400 }
          )
        }
      } else if (fileName.endsWith('.txt')) {
        extractedText = await file.text()
      }

      if (!extractedText.trim()) {
        return NextResponse.json(
          { error: 'No se pudo extraer texto del archivo' },
          { status: 400 }
        )
      }

      try {
        // Intentar usar IA si está disponible
        if (useAI && process.env.GOOGLE_API_KEY) {
          const geminiClient = createGeminiClient()
          const { parseTradesWithAI } = await import('@/lib/intelligentParser')
          const parsedTrades = await parseTradesWithAI(extractedText, geminiClient)
          
          trades = parsedTrades
            .map((trade: ParsedTrade) => normalizeTrade(trade))
            .filter(isValidParsedTrade)
            .map((trade: ParsedTrade) => ({
              user_id: user.id,
              pair: trade.pair || 'UNKNOWN',
              trade_date: trade.trade_date || new Date().toISOString().split('T')[0],
              direction: trade.direction || 'Long',
              risk_percentage: trade.risk_percentage || 0,
              risk_reward: trade.risk_reward || null,
              result: trade.result || 'win',
              result_amount: trade.result_amount || 0,
              result_type: 'percentage' as const,
              setup: trade.setup || 'Importado',
              notes: trade.notes || '',
              entry_time: trade.entry_time || null,
              exit_time: trade.exit_time || null,
            }))
        } else {
          // Usar parsing con regex
          const parsedTrades = parseTradesFromText(extractedText)
          trades = parsedTrades
            .map((trade: ParsedTrade) => normalizeTrade(trade))
            .filter(isValidParsedTrade)
            .map((trade: ParsedTrade) => ({
              user_id: user.id,
              pair: trade.pair || 'UNKNOWN',
              trade_date: trade.trade_date || new Date().toISOString().split('T')[0],
              direction: trade.direction || 'Long',
              risk_percentage: trade.risk_percentage || 0,
              risk_reward: trade.risk_reward || null,
              result: trade.result || 'win',
              result_amount: trade.result_amount || 0,
              result_type: 'percentage' as const,
              setup: trade.setup || 'Importado',
              notes: trade.notes || '',
              entry_time: trade.entry_time || null,
              exit_time: trade.exit_time || null,
            }))
        }
      } catch (error) {
        console.error('Error in intelligent parsing:', error)
        return NextResponse.json(
          { error: 'Error al procesar el archivo. Asegúrate de que contiene información de trades válida.' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Formato de archivo no soportado. Use Excel, PDF, DOCX o TXT' },
        { status: 400 }
      )
    }

    if (trades.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron trades válidos en el archivo' },
        { status: 400 }
      )
    }

    // Insertar trades en lote
    const { data, error } = await supabase
      .from('trades')
      .insert(trades)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      data,
      count: trades.length,
      message: `${trades.length} trade(s) importado(s) exitosamente` 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error importing trades:', error)
    return NextResponse.json(
      { error: error.message || 'Error al importar trades' },
      { status: 500 }
    )
  }
}

