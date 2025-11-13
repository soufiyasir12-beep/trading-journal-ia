import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { analyzeTradesWithAI } from '@/lib/aiClient'

/**
 * POST /api/analyze-trades
 * Analiza los trades del usuario usando IA
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

    // Verificar si ya existe un análisis reciente (últimas 24 horas)
    const { data: recentAnalysis } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Si hay un análisis reciente, devolverlo sin llamar a la IA
    if (recentAnalysis) {
      return NextResponse.json(
        {
          data: recentAnalysis,
          cached: true,
          message: 'Análisis reciente encontrado. Para generar uno nuevo, espera 24 horas o elimina el análisis anterior.',
        },
        { status: 200 }
      )
    }

    // Obtener todos los trades del usuario
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false })

    if (tradesError) {
      throw tradesError
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json({ error: 'No trades found. Please add some trades first.' }, { status: 400 })
    }

    // Obtener la estrategia del usuario (la más reciente)
    const { data: strategies } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const strategy = strategies || null

    // Extraer URLs de imágenes de los trades
    const imageUrls = trades.filter((trade) => trade.image_url).map((trade) => trade.image_url)

    // Analizar con IA
    const analysisResult = await analyzeTradesWithAI({
      trades,
      strategy,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    })

    // Guardar el análisis en la base de datos
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_analysis')
      .insert({
        user_id: user.id,
        analysis: analysisResult.analysis,
        errors_detected: analysisResult.errors_detected || null,
        strengths: analysisResult.strengths || null,
        recommendations: analysisResult.recommendations || null,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving analysis:', saveError)
      // Aún devolvemos el análisis aunque falle el guardado
      return NextResponse.json(
        {
          data: {
            analysis: analysisResult.analysis,
            errors_detected: analysisResult.errors_detected,
            strengths: analysisResult.strengths,
            recommendations: analysisResult.recommendations,
            created_at: new Date().toISOString(),
          },
          warning: 'Analysis generated but could not be saved to database',
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ data: savedAnalysis, cached: false }, { status: 200 })
  } catch (error: any) {
    console.error('Error analyzing trades:', error)
    return NextResponse.json(
      {
        error: error.message || 'Error analyzing trades',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analyze-trades
 * Obtiene el análisis más reciente del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: analysis, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 es "no rows returned", que es válido si no hay análisis
      throw error
    }

    return NextResponse.json({ data: analysis || null }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching analysis:', error)
    return NextResponse.json({ error: error.message || 'Error fetching analysis' }, { status: 500 })
  }
}

