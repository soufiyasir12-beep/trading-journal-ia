import * as XLSX from 'xlsx'

/**
 * Procesa un archivo Excel (XLSX, XLS) o CSV
 */
export async function processExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })
        resolve(jsonData)
      } catch (error) {
        reject(new Error('Error al procesar el archivo Excel: ' + (error as Error).message))
      }
    }
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsBinaryString(file)
  })
}

/**
 * Procesa un archivo de texto plano
 */
export async function processTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        resolve(text)
      } catch (error) {
        reject(new Error('Error al leer el archivo de texto: ' + (error as Error).message))
      }
    }
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsText(file)
  })
}

/**
 * Valida el tipo de archivo
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  return allowedTypes.some(type => 
    file.type.includes(type) || fileExtension === type
  )
}

/**
 * Mapea datos de Excel a formato de estrategia
 */
export function mapExcelToStrategy(data: any[]): { name: string; description: string; rules: string } | null {
  if (!data || data.length === 0) return null

  // Buscar columnas comunes
  const firstRow = data[0]
  const columns = Object.keys(firstRow)
  
  // Intentar encontrar nombre, descripción y reglas
  const nameCol = columns.find(col => 
    col.toLowerCase().includes('nombre') || 
    col.toLowerCase().includes('name') ||
    col.toLowerCase().includes('estrategia')
  )
  const descCol = columns.find(col => 
    col.toLowerCase().includes('descripcion') || 
    col.toLowerCase().includes('description') ||
    col.toLowerCase().includes('desc')
  )
  const rulesCol = columns.find(col => 
    col.toLowerCase().includes('regla') || 
    col.toLowerCase().includes('rule') ||
    col.toLowerCase().includes('estrategia')
  )

  // Si hay una sola fila, intentar extraer todo
  if (data.length === 1) {
    const row = data[0]
    return {
      name: nameCol ? String(row[nameCol] || 'Estrategia Importada') : 'Estrategia Importada',
      description: descCol ? String(row[descCol] || '') : '',
      rules: rulesCol ? String(row[rulesCol] || '') : Object.values(row).join('\n'),
    }
  }

  // Si hay múltiples filas, combinar como reglas
  const rules = data.map(row => {
    if (rulesCol) {
      return String(row[rulesCol] || '')
    }
    return Object.values(row).join(' - ')
  }).filter(r => r.trim()).join('\n')

  return {
    name: nameCol && data[0][nameCol] ? String(data[0][nameCol]) : 'Estrategia Importada',
    description: descCol && data[0][descCol] ? String(data[0][descCol]) : '',
    rules: rules || 'Reglas importadas desde archivo',
  }
}

/**
 * Mapea datos de Excel a formato de trades
 */
export function mapExcelToTrades(data: any[]): any[] {
  if (!data || data.length === 0) return []

  const trades: any[] = []
  const columns = Object.keys(data[0])

  // Buscar columnas comunes
  const pairCol = columns.find(col => 
    col.toLowerCase().includes('pair') || 
    col.toLowerCase().includes('par') ||
    col.toLowerCase().includes('symbol') ||
    col.toLowerCase().includes('activo')
  )
  const dateCol = columns.find(col => 
    col.toLowerCase().includes('fecha') || 
    col.toLowerCase().includes('date') ||
    col.toLowerCase().includes('trade_date')
  )
  const directionCol = columns.find(col => 
    col.toLowerCase().includes('direccion') || 
    col.toLowerCase().includes('direction') ||
    col.toLowerCase().includes('tipo')
  )
  const riskCol = columns.find(col => 
    col.toLowerCase().includes('risk') || 
    col.toLowerCase().includes('riesgo') ||
    col.toLowerCase().includes('risk_percentage')
  )
  const rrCol = columns.find(col => 
    col.toLowerCase().includes('risk_reward') || 
    col.toLowerCase().includes('rr') ||
    col.toLowerCase().includes('r:r')
  )
  const resultCol = columns.find(col => 
    col.toLowerCase().includes('result') || 
    col.toLowerCase().includes('resultado') ||
    col.toLowerCase().includes('win') ||
    col.toLowerCase().includes('loss')
  )
  const resultAmountCol = columns.find(col => 
    col.toLowerCase().includes('result_amount') || 
    col.toLowerCase().includes('cantidad') ||
    col.toLowerCase().includes('amount') ||
    col.toLowerCase().includes('ganancia') ||
    col.toLowerCase().includes('perdida')
  )
  const setupCol = columns.find(col => 
    col.toLowerCase().includes('setup') || 
    col.toLowerCase().includes('configuracion')
  )
  const notesCol = columns.find(col => 
    col.toLowerCase().includes('note') || 
    col.toLowerCase().includes('nota') ||
    col.toLowerCase().includes('comentario')
  )
  const entryTimeCol = columns.find(col => 
    col.toLowerCase().includes('entry_time') || 
    col.toLowerCase().includes('hora_entrada') ||
    col.toLowerCase().includes('entrada')
  )
  const exitTimeCol = columns.find(col => 
    col.toLowerCase().includes('exit_time') || 
    col.toLowerCase().includes('hora_salida') ||
    col.toLowerCase().includes('salida')
  )

  for (const row of data) {
    const pair = pairCol ? String(row[pairCol] || '').trim() : ''
    const date = dateCol ? String(row[dateCol] || '').trim() : ''
    
    if (!pair || !date) continue // Skip rows without required fields

    // Parse date
    let tradeDate = date
    try {
      const dateObj = new Date(date)
      if (!isNaN(dateObj.getTime())) {
        tradeDate = dateObj.toISOString().split('T')[0]
      } else if (date.includes('/')) {
        const [day, month, year] = date.split('/')
        tradeDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    } catch (e) {
      // Keep original date string
    }

    // Parse result
    let result: 'win' | 'loss' | 'breakeven' = 'win'
    const resultStr = resultCol ? String(row[resultCol] || '').toLowerCase() : ''
    if (resultStr.includes('loss') || resultStr.includes('perdida') || resultStr.includes('lose')) {
      result = 'loss'
    } else if (resultStr.includes('breakeven') || resultStr.includes('empate')) {
      result = 'breakeven'
    }

    // Parse direction
    let direction: 'Long' | 'Short' | undefined = undefined
    const directionStr = directionCol ? String(row[directionCol] || '').toLowerCase() : ''
    if (directionStr.includes('long') || directionStr.includes('compra')) {
      direction = 'Long'
    } else if (directionStr.includes('short') || directionStr.includes('venta')) {
      direction = 'Short'
    }

    trades.push({
      pair,
      trade_date: tradeDate,
      direction: direction || 'Long',
      risk_percentage: riskCol ? parseFloat(String(row[riskCol] || 0)) || 0 : 0,
      risk_reward: rrCol ? parseFloat(String(row[rrCol] || 0)) || null : null,
      result,
      result_amount: resultAmountCol ? parseFloat(String(row[resultAmountCol] || 0)) || 0 : 0,
      result_type: 'percentage' as const,
      setup: setupCol ? String(row[setupCol] || '').trim() : '',
      notes: notesCol ? String(row[notesCol] || '').trim() : '',
      entry_time: entryTimeCol ? String(row[entryTimeCol] || '').trim() : '',
      exit_time: exitTimeCol ? String(row[exitTimeCol] || '').trim() : '',
    })
  }

  return trades
}

