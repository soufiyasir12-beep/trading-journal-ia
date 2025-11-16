import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import '@/lib/pdfPolyfill' // Polyfill para DOMMatrix

// Dynamic import for server-side only library
const XLSX = require('xlsx')

/**
 * POST /api/import/strategy
 * Importa una estrategia desde un archivo (PDF, DOCX, Excel, texto)
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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    let extractedText = ''

    // Procesar según el tipo de archivo
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
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })
      
      // Intentar mapear a estrategia
      if (jsonData.length > 0) {
        const firstRow = jsonData[0] as any
        const columns = Object.keys(firstRow)
        
        const nameCol = columns.find(col => 
          col.toLowerCase().includes('nombre') || 
          col.toLowerCase().includes('name') ||
          col.toLowerCase().includes('estrategia')
        )
        const rulesCol = columns.find(col => 
          col.toLowerCase().includes('regla') || 
          col.toLowerCase().includes('rule') ||
          col.toLowerCase().includes('estrategia')
        )

        if (jsonData.length === 1 && rulesCol) {
          extractedText = String(firstRow[rulesCol] || '')
        } else {
          extractedText = jsonData.map((row: any) => 
            Object.values(row).join(' - ')
          ).join('\n')
        }
      } else {
        extractedText = 'Estrategia importada desde Excel'
      }
    } else {
      // Archivo de texto
      extractedText = await file.text()
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No se pudo extraer texto del archivo' },
        { status: 400 }
      )
    }

    // Extraer nombre y reglas del texto
    const lines = extractedText.split('\n').filter(line => line.trim())
    let name = 'Estrategia Importada'
    let description = ''
    let rules = extractedText

    // Intentar detectar estructura común
    const nameMatch = extractedText.match(/(?:nombre|name|estrategia)[:：]\s*(.+)/i)
    if (nameMatch) {
      name = nameMatch[1].trim()
    } else if (lines.length > 0) {
      name = lines[0].substring(0, 100) // Usar primera línea como nombre
    }

    // Buscar sección de reglas
    const rulesStart = extractedText.toLowerCase().indexOf('regla')
    if (rulesStart !== -1) {
      rules = extractedText.substring(rulesStart)
    } else {
      rules = extractedText
    }

    // Crear la estrategia
    const { data, error } = await supabase
      .from('strategies')
      .insert({
        user_id: user.id,
        name: name.substring(0, 255),
        description: description || null,
        rules: rules.substring(0, 10000), // Limitar tamaño
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      data,
      message: 'Estrategia importada exitosamente' 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error importing strategy:', error)
    return NextResponse.json(
      { error: error.message || 'Error al importar estrategia' },
      { status: 500 }
    )
  }
}

