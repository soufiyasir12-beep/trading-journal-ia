/**
 * Cliente para Google Gemini AI
 * Usa Gemini 1.5 Flash (API gratuita)
 */

interface GeminiMessage {
  role: 'user' | 'model'
  parts: Array<{
    text?: string
    inline_data?: {
      mime_type: string
      data: string
    }
  }>
}

interface GeminiResponse {
  text: string
}

export class GeminiClient {
  private apiKey: string
  // Modelos a probar en orden de preferencia
  // Modelo principal: gemini-2.5-flash-lite (recomendado por el usuario)
  private modelConfigs = [
    // Modelo principal solicitado - probar diferentes versiones de API
    { model: 'gemini-2.5-flash-lite', version: 'v1beta' },
    { model: 'gemini-2.5-flash-lite', version: 'v1' },
    // Variaciones del nombre del modelo
    { model: 'gemini-2.5-flash-latest', version: 'v1beta' },
    { model: 'gemini-2.5-flash', version: 'v1beta' },
    // Fallbacks en caso de que el modelo principal no esté disponible
    { model: 'gemini-1.5-flash', version: 'v1beta' },
    { model: 'gemini-pro', version: 'v1' },
    { model: 'gemini-1.5-pro', version: 'v1beta' },
  ]

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is required')
    }
    this.apiKey = apiKey
  }

  /**
   * Obtiene la URL del endpoint para un modelo y versión específicos
   */
  private getModelUrl(model: string, version: string): string {
    return `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent`
  }

  /**
   * Genera contenido de texto usando Gemini
   * Intenta varios modelos hasta que uno funcione
   */
  async generateText(prompt: string, imageData?: { mimeType: string; data: string }): Promise<string> {
    // Construir el contenido directamente
    const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = []
    
    // Agregar imagen si existe
    if (imageData) {
      parts.push({
        inline_data: {
          mime_type: imageData.mimeType,
          data: imageData.data,
        },
      })
    }
    
    // Agregar texto
    parts.push({ text: prompt })

    const requestBody: any = {
      contents: [
        {
          parts: parts,
        },
      ],
      // Configuración de generación (opcional pero recomendado)
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }

    let lastError: Error | null = null

    // Intentar cada configuración de modelo hasta que una funcione
    for (const config of this.modelConfigs) {
      try {
        const url = `${this.getModelUrl(config.model, config.version)}?key=${this.apiKey}`
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          let errorMessage = response.statusText
          try {
            const errorData = await response.json()
            errorMessage = errorData.error?.message || errorData.message || errorMessage
            
            // Si es un error de autenticación o API key, no intentar otros modelos
            if (
              response.status === 401 || 
              response.status === 403 ||
              errorMessage.toLowerCase().includes('api key') ||
              errorMessage.toLowerCase().includes('unauthorized') ||
              errorMessage.toLowerCase().includes('permission')
            ) {
              throw new Error(`Authentication error: ${errorMessage}. Please check your GOOGLE_API_KEY.`)
            }
          } catch (jsonError) {
            // Si no se puede parsear el JSON, usar el status text
            if (response.status === 401 || response.status === 403) {
              throw new Error(`Authentication error (${response.status}): ${errorMessage}. Please check your GOOGLE_API_KEY.`)
            }
          }
          
          // Si el modelo no existe, intentar el siguiente
          if (
            response.status === 404 ||
            errorMessage.includes('not found') || 
            errorMessage.includes('not supported') ||
            errorMessage.toLowerCase().includes('404')
          ) {
            console.warn(`Model ${config.model} (${config.version}) not available, trying next...`)
            lastError = new Error(`Model ${config.model} (${config.version}): ${errorMessage}`)
            continue
          }
          
          // Para otros errores, lanzar inmediatamente
          throw new Error(`Gemini API error (${response.status}): ${errorMessage}`)
        }

        const data = await response.json()

        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('No response from Gemini API')
        }

        const text = data.candidates[0].content.parts
          .map((part: any) => part.text || '')
          .filter((text: string) => text.length > 0)
          .join('')

        if (!text) {
          throw new Error('Empty response from Gemini API')
        }

        console.log(`Successfully used model: ${config.model} (${config.version})`)
        return text
      } catch (error: any) {
        // Si es un error de modelo no encontrado, continuar con el siguiente
        if (
          error.message?.includes('not found') || 
          error.message?.includes('not supported') ||
          error.message?.includes('404')
        ) {
          lastError = error
          continue
        }
        
        // Para otros errores, lanzar inmediatamente
        console.error(`Error with model ${config.model} (${config.version}):`, error)
        throw new Error(`Failed to generate text with Gemini (model: ${config.model}, version: ${config.version}): ${error.message}`)
      }
    }

    // Si todos los modelos fallaron
    const triedModels = this.modelConfigs.map(c => `${c.model} (${c.version})`).join(', ')
    throw new Error(
      `Failed to generate text with Gemini. Tried: ${triedModels}. Last error: ${lastError?.message || 'Unknown error'}. Please check your API key and ensure it has access to Gemini models.`
    )
  }

  /**
   * Analiza trades y estrategias
   */
  async analyzeTrades(
    trades: any[],
    strategy: { name: string; description?: string; rules: string } | null,
    imageUrls?: string[]
  ): Promise<string> {
    const tradesSummary = trades
      .map(
        (trade, index) => `
Trade ${index + 1}:
- Par: ${trade.pair}
- Dirección: ${trade.direction || 'N/A'}
- Setup: ${trade.setup}
- Resultado: ${trade.result}
- Cantidad: ${trade.result_amount || 0}
- Risk/Reward: ${trade.risk_reward || 'N/A'}
- Fecha: ${trade.trade_date}
- Notas: ${trade.notes || 'N/A'}
${trade.image_url ? `- Imagen: ${trade.image_url}` : ''}
`
      )
      .join('\n')

    const strategyText = strategy
      ? `
Estrategia del usuario: ${strategy.name}
Descripción: ${strategy.description || 'N/A'}
Reglas: ${strategy.rules}
`
      : `
El usuario no ha definido una estrategia específica. Analiza los trades basándote en mejores prácticas de trading.
`

    const prompt = `
Eres un experto analista de trading. Analiza las siguientes operaciones de trading y proporciona un informe detallado en español.

${strategyText}

Operaciones realizadas:
${tradesSummary}

Por favor, proporciona un análisis completo que incluya:

1. **Errores detectados**: Identifica los errores o desviaciones respecto a la estrategia (si existe) o respecto a las mejores prácticas de trading.

2. **Puntos fuertes**: Destaca los aspectos positivos de la operativa del trader.

3. **Recomendaciones personalizadas**: Ofrece recomendaciones específicas y accionables para mejorar el rendimiento.

Formato la respuesta en markdown con secciones claras. Sé específico, constructivo y profesional.

${imageUrls && imageUrls.length > 0
  ? `
NOTA: El usuario ha subido imágenes de algunos trades. Si es posible analizar estas imágenes, proporciona insights adicionales sobre la ejecución técnica, niveles de entrada/salida, y cualquier patrón visual que observes.
`
  : ''}
`

    return await this.generateText(prompt)
  }
}

/**
 * Crea una instancia del cliente Gemini
 */
export function createGeminiClient(): GeminiClient {
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable is not set')
  }

  return new GeminiClient(apiKey)
}

