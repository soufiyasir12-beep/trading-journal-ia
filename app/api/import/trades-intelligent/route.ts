import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { createGeminiClient } from '@/lib/geminiClient'
import { parseTradesFromText, parseTradesWithAI, normalizeTrade } from '@/lib/intelligentParser'

const XLSX = require('xlsx')

/**
 * POST /api/import/trades-intelligent
 * Importa trades usando parsing inteligente que se adapta a diferentes formatos
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

    // Procesar según el tipo de archivo
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      // Procesar Excel/CSV con mapeo inteligente
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

      // Mapeo inteligente de columnas
      const columns = Object.keys(jsonData[0] as any)
      const columnMap: Record<string, string> = {}

      // Crear mapeo flexible de columnas
      const columnMappings = {
        pair: ['pair', 'par', 'symbol', 'activo', 'instrumento', 'instrument', 'símbolo'],
        trade_date: ['fecha', 'date', 'trade_date', 'fecha_trade', 'día', 'day'],
        direction: ['direction', 'direccion', 'tipo', 'tipo_operacion', 'operación', 'operation', 'side'],
        risk_percentage: ['risk', 'riesgo', 'risk_percentage', 'porcentaje_riesgo', '% riesgo', 'risk %'],
        risk_reward: ['risk_reward', 'rr', 'r:r', 'risk:reward', 'risk/reward', 'ratio'],
        result: ['result', 'resultado', 'outcome', 'ganancia', 'pérdida', 'perdida', 'win', 'loss'],
        result_amount: ['result_amount', 'amount', 'cantidad', 'ganancia', 'pérdida', 'perdida', 'profit', 'loss', 'resultado_cantidad'],
        setup: ['setup', 'configuracion', 'estrategia', 'strategy', 'tipo_setup', 'setup_type'],
        notes: ['notes', 'nota', 'notas', 'comentario', 'comentarios', 'comment', 'observaciones'],
        entry_time: ['entry_time', 'hora_entrada', 'entrada', 'entry', 'hora entrada', 'time entry'],
        exit_time: ['exit_time', 'hora_salida', 'salida', 'exit', 'hora salida', 'time exit'],
      }

      // Mapear columnas
      for (const [key, possibleNames] of Object.entries(columnMappings)) {
        const found = columns.find(col => {
          const colLower = col.toLowerCase().trim()
          return possibleNames.some(name => colLower.includes(name.toLowerCase()))
        })
        if (found) {
          columnMap[key] = found
        }
      }

      // Procesar cada fila
      for (const row of jsonData) {
        const rowData = row as any
        const trade: any = {
          user_id: user.id,
        }

        // Mapear cada campo
        for (const [key, columnName] of Object.entries(columnMap)) {
          const value = rowData[columnName]
          if (value !== undefined && value !== null && value !== '') {
            switch (key) {
              case 'pair':
                trade.pair = String(value).trim().toUpperCase()
                break
              case 'trade_date':
                let dateStr = String(value).trim()
                // Intentar parsear diferentes formatos de fecha
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
                trade.entry_time = String(value).trim() || null
                break
              case 'exit_time':
                trade.exit_time = String(value).trim() || null
                break
            }
          }
        }

        // Validar campos requeridos
        if (trade.pair && trade.trade_date) {
          // Valores por defecto
          trade.direction = trade.direction || 'Long'
          trade.risk_percentage = trade.risk_percentage || 0
          trade.result = trade.result || 'win'
          trade.result_amount = trade.result_amount || 0
          trade.result_type = 'percentage'
          trade.setup = trade.setup || 'Importado'
          
          trades.push(trade)
        }
      }
    } else {
      // Procesar archivo de texto (PDF, DOCX, TXT)
      let text = ''
      
      if (fileName.endsWith('.txt')) {
        text = await file.text()
      } else {
        // Para PDF y DOCX, el texto ya debería estar extraído en el cliente
        // pero por si acaso, intentamos leerlo como texto
        text = await file.text()
      }

      if (!text.trim()) {
        return NextResponse.json(
          { error: 'No se pudo extraer texto del archivo' },
          { status: 400 }
        )
      }

      // Usar IA si está disponible y solicitado
      if (useAI && process.env.GOOGLE_API_KEY) {
        try {
          const geminiClient = createGeminiClient()
          const parsedTrades = await parseTradesWithAI(text, geminiClient)
          
          trades = parsedTrades
            .map(trade => normalizeTrade(trade))
            .filter((trade): trade is ParsedTrade => trade !== null)
            .map(trade => ({
              user_id: user.id,
              pair: trade.pair!,
              trade_date: trade.trade_date!,
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
        } catch (aiError) {
          console.warn('Error using AI parsing, falling back to regex:', aiError)
          // Fallback a parsing con regex
          const parsedTrades = parseTradesFromText(text)
          trades = parsedTrades
            .map(trade => normalizeTrade(trade))
            .filter((trade): trade is ParsedTrade => trade !== null)
            .map(trade => ({
              user_id: user.id,
              pair: trade.pair!,
              trade_date: trade.trade_date!,
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
      } else {
        // Usar parsing con regex
        const parsedTrades = parseTradesFromText(text)
        trades = parsedTrades
          .map(trade => normalizeTrade(trade))
          .filter((trade): trade is ParsedTrade => trade !== null)
          .map(trade => ({
            user_id: user.id,
            pair: trade.pair!,
            trade_date: trade.trade_date!,
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
      message: `${trades.length} trade(s) importado(s) exitosamente usando parsing inteligente` 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error importing trades intelligently:', error)
    return NextResponse.json(
      { error: error.message || 'Error al importar trades' },
      { status: 500 }
    )
  }
}

