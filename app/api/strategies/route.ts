import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

/**
 * GET /api/strategies
 * Obtiene todas las estrategias del usuario
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

    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching strategies:', error)
    return NextResponse.json({ error: error.message || 'Error fetching strategies' }, { status: 500 })
  }
}

/**
 * POST /api/strategies
 * Crea una nueva estrategia
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

    const body = await request.json()
    const { name, description, rules } = body

    // Validación
    if (!name || !rules) {
      return NextResponse.json({ error: 'Name and rules are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('strategies')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        rules,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating strategy:', error)
    return NextResponse.json({ error: error.message || 'Error creating strategy' }, { status: 500 })
  }
}

/**
 * PUT /api/strategies
 * Actualiza una estrategia existente
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, rules } = body

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (rules !== undefined) updateData.rules = rules

    const { data, error } = await supabase
      .from('strategies')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating strategy:', error)
    return NextResponse.json({ error: error.message || 'Error updating strategy' }, { status: 500 })
  }
}

/**
 * DELETE /api/strategies
 * Elimina una estrategia
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 })
    }

    const { error } = await supabase.from('strategies').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Strategy deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting strategy:', error)
    return NextResponse.json({ error: error.message || 'Error deleting strategy' }, { status: 500 })
  }
}

