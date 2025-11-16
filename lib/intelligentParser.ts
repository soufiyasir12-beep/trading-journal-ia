/**
 * Parser inteligente que extrae información de trades desde documentos no estructurados
 * Usa técnicas de NLP, regex avanzados y heurísticas para adaptarse a diferentes formatos
 */

export interface ParsedTrade {
  pair?: string
  trade_date?: string
  direction?: 'Long' | 'Short'
  risk_percentage?: number
  risk_reward?: number | null
  result?: 'win' | 'loss' | 'breakeven'
  result_amount?: number
  setup?: string
  notes?: string
  entry_time?: string | null
  exit_time?: string | null
}

/**
 * Extrae información de trades desde texto no estructurado usando regex y heurísticas
 */
export function parseTradesFromText(text: string): ParsedTrade[] {
  const trades: ParsedTrade[] = []
  const lines = text.split('\n').filter(line => line.trim())

  // Patrones comunes para detectar trades
  const pairPatterns = [
    /([A-Z]{3}\/[A-Z]{3})/g, // EUR/USD, GBP/JPY, etc.
    /([A-Z]{3}-[A-Z]{3})/g, // EUR-USD
    /(par|pair|symbol|activo)[:：\s]+([A-Z]{3}\/?[A-Z]{3})/gi,
  ]

  const datePatterns = [
    /(\d{4}[-/]\d{2}[-/]\d{2})/g, // YYYY-MM-DD, YYYY/MM/DD
    /(\d{2}[-/]\d{2}[-/]\d{4})/g, // DD-MM-YYYY, DD/MM/YYYY
    /(fecha|date)[:：\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/gi,
    /(hoy|today|ayer|yesterday)/gi,
  ]

  const directionPatterns = [
    /(long|compra|buy|alcista)/gi,
    /(short|venta|sell|bajista)/gi,
  ]

  const resultPatterns = [
    /(win|ganancia|profit|gané|ganado|exitoso)/gi,
    /(loss|pérdida|perdida|perdí|perdido|fallido)/gi,
    /(breakeven|empate|neutro|cero)/gi,
  ]

  const amountPatterns = [
    /([+-]?\d+\.?\d*)\s*%/g, // Porcentajes
    /([+-]?\$\d+\.?\d*)/g, // Dinero
    /(resultado|result|amount|cantidad|ganancia|pérdida|perdida)[:：\s]+([+-]?\d+\.?\d*)/gi,
  ]

  const riskPatterns = [
    /(risk|riesgo)[:：\s]+(\d+\.?\d*)\s*%/gi,
    /(riesgo|risk)[:：\s]+(\d+\.?\d*)/gi,
  ]

  const rrPatterns = [
    /(r:r|rr|risk[\s-]?reward|risk[\s-]?reward)[:：\s]+(\d+\.?\d*)/gi,
    /(\d+\.?\d*)[:：](\d+\.?\d*)/g, // Formato 1:2
  ]

  const setupPatterns = [
    /(setup|configuración|estrategia|tipo)[:：\s]+([a-záéíóúñ\s]+)/gi,
  ]

  // Intentar agrupar líneas relacionadas (heurística: líneas cercanas con información relacionada)
  let currentTrade: ParsedTrade = {}
  let lineIndex = 0

  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    // Detectar inicio de un nuevo trade (línea con par de divisas)
    const pairMatch = line.match(/([A-Z]{3}\/?[A-Z]{3})/)
    if (pairMatch && Object.keys(currentTrade).length > 0) {
      // Guardar trade anterior y empezar uno nuevo
      if (currentTrade.pair || currentTrade.trade_date) {
        trades.push({ ...currentTrade })
      }
      currentTrade = {}
    }

    // Extraer par
    if (!currentTrade.pair) {
      for (const pattern of pairPatterns) {
        const match = line.match(pattern)
        if (match) {
          currentTrade.pair = match[1]?.replace('-', '/') || match[0]
          break
        }
      }
    }

    // Extraer fecha
    if (!currentTrade.trade_date) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match) {
          let dateStr = match[1] || match[2] || match[0]
          
          // Manejar "hoy" o "ayer"
          if (dateStr.toLowerCase().includes('hoy') || dateStr.toLowerCase().includes('today')) {
            dateStr = new Date().toISOString().split('T')[0]
          } else if (dateStr.toLowerCase().includes('ayer') || dateStr.toLowerCase().includes('yesterday')) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            dateStr = yesterday.toISOString().split('T')[0]
          } else {
            // Parsear fecha
            try {
              if (dateStr.includes('/')) {
                const parts = dateStr.split('/')
                if (parts.length === 3) {
                  if (parts[0].length === 4) {
                    // YYYY/MM/DD
                    dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
                  } else {
                    // DD/MM/YYYY
                    dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
                  }
                }
              } else if (dateStr.includes('-')) {
                const parts = dateStr.split('-')
                if (parts.length === 3 && parts[0].length === 2) {
                  // DD-MM-YYYY
                  dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
                }
              }
            } catch (e) {
              // Si falla, usar fecha actual
              dateStr = new Date().toISOString().split('T')[0]
            }
          }
          
          currentTrade.trade_date = dateStr
          break
        }
      }
    }

    // Extraer dirección
    if (!currentTrade.direction) {
      if (directionPatterns[0].test(lowerLine)) {
        currentTrade.direction = 'Long'
      } else if (directionPatterns[1].test(lowerLine)) {
        currentTrade.direction = 'Short'
      }
    }

    // Extraer resultado
    if (!currentTrade.result) {
      if (resultPatterns[0].test(lowerLine)) {
        currentTrade.result = 'win'
      } else if (resultPatterns[1].test(lowerLine)) {
        currentTrade.result = 'loss'
      } else if (resultPatterns[2].test(lowerLine)) {
        currentTrade.result = 'breakeven'
      }
    }

    // Extraer cantidad
    if (currentTrade.result_amount === undefined) {
      for (const pattern of amountPatterns) {
        const match = line.match(pattern)
        if (match) {
          const amount = parseFloat(match[1] || match[2] || match[0].replace(/[^0-9.-]/g, ''))
          if (!isNaN(amount)) {
            currentTrade.result_amount = Math.abs(amount)
            break
          }
        }
      }
    }

    // Extraer riesgo
    if (currentTrade.risk_percentage === undefined) {
      for (const pattern of riskPatterns) {
        const match = line.match(pattern)
        if (match) {
          const risk = parseFloat(match[2] || match[1])
          if (!isNaN(risk)) {
            currentTrade.risk_percentage = risk
            break
          }
        }
      }
    }

    // Extraer R:R
    if (currentTrade.risk_reward === undefined) {
      for (const pattern of rrPatterns) {
        const match = line.match(pattern)
        if (match) {
          const rr = parseFloat(match[2] || match[1])
          if (!isNaN(rr)) {
            currentTrade.risk_reward = rr
            break
          }
        }
      }
    }

    // Extraer setup
    if (!currentTrade.setup) {
      for (const pattern of setupPatterns) {
        const match = line.match(pattern)
        if (match) {
          currentTrade.setup = match[2]?.trim() || match[0]
          break
        }
      }
    }

    // Agregar notas (todo el texto que no se pudo categorizar)
    if (!currentTrade.notes) {
      const hasKnownInfo = pairMatch || datePatterns.some(p => p.test(line))
      if (!hasKnownInfo && line.length > 10) {
        currentTrade.notes = line.trim()
      }
    }

    lineIndex++
  }

  // Agregar último trade si existe
  if (Object.keys(currentTrade).length > 0 && (currentTrade.pair || currentTrade.trade_date)) {
    trades.push(currentTrade)
  }

  return trades
}

/**
 * Usa IA para extraer información de trades desde texto no estructurado
 */
export async function parseTradesWithAI(text: string, geminiClient: any): Promise<ParsedTrade[]> {
  const prompt = `
Eres un experto en extraer información de trades desde documentos de texto no estructurados.

Analiza el siguiente texto y extrae TODA la información de trades que encuentres. Para cada trade, identifica:

1. Par de divisas (ej: EUR/USD, GBP/JPY)
2. Fecha de la operación (en formato YYYY-MM-DD)
3. Dirección (Long o Short)
4. Porcentaje de riesgo (risk_percentage)
5. Ratio Risk/Reward (risk_reward)
6. Resultado (win, loss, o breakeven)
7. Cantidad del resultado (result_amount)
8. Tipo de setup utilizado
9. Notas adicionales
10. Hora de entrada (entry_time) si está disponible
11. Hora de salida (exit_time) si está disponible

Texto a analizar:
${text}

Responde SOLO con un JSON array válido, donde cada objeto representa un trade. Usa este formato exacto:

[
  {
    "pair": "EUR/USD",
    "trade_date": "2024-01-15",
    "direction": "Long",
    "risk_percentage": 2.0,
    "risk_reward": 2.5,
    "result": "win",
    "result_amount": 5.0,
    "setup": "Breakout",
    "notes": "Operación exitosa",
    "entry_time": "09:30",
    "exit_time": "14:45"
  }
]

Si no encuentras información completa para algún campo, usa null o omítelo. Si no encuentras ningún trade, devuelve un array vacío [].

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional antes o después.
`

  try {
    const response = await geminiClient.generateText(prompt)
    
    // Intentar extraer JSON de la respuesta
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const trades = JSON.parse(jsonMatch[0])
      return trades.filter((trade: ParsedTrade) => trade.pair || trade.trade_date)
    }
    
    return []
  } catch (error) {
    console.error('Error parsing with AI:', error)
    // Fallback a parsing con regex
    return parseTradesFromText(text)
  }
}

/**
 * Normaliza y valida un trade parseado
 * Retorna un ParsedTrade normalizado o null si no tiene datos mínimos válidos
 */
export function normalizeTrade(trade: ParsedTrade): ParsedTrade | null {
  // Validar que tenga al menos par o fecha
  if (!trade.pair && !trade.trade_date) {
    return null
  }

  // Valores por defecto
  const normalized: ParsedTrade = {
    pair: trade.pair || 'UNKNOWN',
    trade_date: trade.trade_date || new Date().toISOString().split('T')[0],
    direction: trade.direction || 'Long',
    risk_percentage: trade.risk_percentage || 0,
    risk_reward: trade.risk_reward || null,
    result: trade.result || 'win',
    result_amount: trade.result_amount || 0,
    setup: trade.setup || 'Importado',
    notes: trade.notes || '',
    entry_time: trade.entry_time || null,
    exit_time: trade.exit_time || null,
  }

  return normalized
}

/**
 * Type guard para verificar si un trade es válido (no null)
 */
export function isValidParsedTrade(trade: ParsedTrade | null): trade is ParsedTrade {
  return trade !== null && (trade.pair !== undefined || trade.trade_date !== undefined)
}

