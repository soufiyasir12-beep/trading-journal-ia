/**
 * Cliente genérico de IA que soporta múltiples proveedores
 * Soporta: Gemini (actual) y OpenAI (futuro)
 */

import { createGeminiClient, GeminiClient } from './geminiClient'

// Tipos para diferentes proveedores de IA
export type AIProvider = 'gemini' | 'openai'

interface AnalyzeTradesInput {
  trades: any[]
  strategy: { name: string; description?: string; rules: string } | null
  imageUrls?: string[]
}

interface AnalyzeTradesOutput {
  analysis: string
  errors_detected?: string
  strengths?: string
  recommendations?: string
}

/**
 * Cliente de OpenAI (preparado para futuro uso)
 */
class OpenAIClient {
  // Esta clase se implementará cuando se migre a OpenAI
  async analyzeTrades(input: AnalyzeTradesInput): Promise<string> {
    throw new Error('OpenAI client not implemented yet. Set AI_PROVIDER=gemini')
  }
}

/**
 * Obtiene el proveedor de IA desde las variables de entorno
 */
function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase() as AIProvider

  if (provider !== 'gemini' && provider !== 'openai') {
    console.warn(`Unknown AI provider: ${provider}. Defaulting to gemini.`)
    return 'gemini'
  }

  return provider
}

/**
 * Analiza trades usando el proveedor de IA configurado
 */
export async function analyzeTradesWithAI(
  input: AnalyzeTradesInput
): Promise<AnalyzeTradesOutput> {
  const provider = getAIProvider()

  try {
    let analysisText: string

    switch (provider) {
      case 'gemini': {
        const geminiClient = createGeminiClient()
        analysisText = await geminiClient.analyzeTrades(
          input.trades,
          input.strategy,
          input.imageUrls
        )
        break
      }

      case 'openai': {
        // TODO: Implementar cuando se migre a OpenAI
        const openAIClient = new OpenAIClient()
        analysisText = await openAIClient.analyzeTrades(input)
        break
      }

      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }

    // Extraer secciones del análisis usando regex
    const errorsMatch = analysisText.match(/##?\s*Errores\s+detectados:?\s*\n([\s\S]*?)(?=##?\s*Puntos\s+fuertes:|##?\s*Recomendaciones:|$)/i)
    const strengthsMatch = analysisText.match(/##?\s*Puntos\s+fuertes:?\s*\n([\s\S]*?)(?=##?\s*Recomendaciones:|$)/i)
    const recommendationsMatch = analysisText.match(/##?\s*Recomendaciones:?\s*\n([\s\S]*?)$/i)

    return {
      analysis: analysisText,
      errors_detected: errorsMatch ? errorsMatch[1].trim() : undefined,
      strengths: strengthsMatch ? strengthsMatch[1].trim() : undefined,
      recommendations: recommendationsMatch ? recommendationsMatch[1].trim() : undefined,
    }
  } catch (error: any) {
    console.error('Error analyzing trades with AI:', error)
    throw new Error(`Failed to analyze trades: ${error.message}`)
  }
}

/**
 * Analiza una imagen de trade usando el proveedor de IA configurado
 */
export async function analyzeTradeImage(
  imageUrl: string,
  tradeData: any
): Promise<string> {
  const provider = getAIProvider()

  try {
    switch (provider) {
      case 'gemini': {
        // Para Gemini, necesitamos convertir la imagen a base64
        // Por ahora, simplemente incluimos la URL en el análisis
        const geminiClient = createGeminiClient()
        const prompt = `
Analiza esta imagen de un trade de trading. La imagen muestra un gráfico o captura de pantalla de una operación.

Información del trade:
- Par: ${tradeData.pair}
- Dirección: ${tradeData.direction || 'N/A'}
- Setup: ${tradeData.setup}
- Resultado: ${tradeData.result}

Proporciona un análisis técnico de la imagen, incluyendo:
1. Niveles de entrada y salida identificados
2. Patrones técnicos visibles
3. Calidad de la ejecución
4. Áreas de mejora

Responde en español.
`
        // TODO: Implementar análisis de imagen real cuando se tenga acceso a la imagen
        return await geminiClient.generateText(prompt)
      }

      case 'openai': {
        // TODO: Implementar cuando se migre a OpenAI
        throw new Error('OpenAI image analysis not implemented yet')
      }

      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  } catch (error: any) {
    console.error('Error analyzing trade image:', error)
    throw new Error(`Failed to analyze trade image: ${error.message}`)
  }
}

