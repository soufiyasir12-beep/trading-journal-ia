import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false })

    if (startDate && endDate) {
      query = query.gte('trade_date', startDate).lte('trade_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error fetching trades' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      image_url,
      pair,
      risk_percentage,
      risk_reward,
      direction,
      result,
      result_amount,
      result_type,
      setup,
      notes,
      trade_date,
      entry_time,
      exit_time,
    } = body

    // Validación
    if (!pair || !risk_percentage || !result || !setup || !trade_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        image_url,
        pair,
        risk_percentage: parseFloat(risk_percentage),
        risk_reward: risk_reward ? parseFloat(risk_reward) : null,
        direction: direction || null,
        result,
        result_amount: result_amount ? parseFloat(result_amount) : null,
        result_type: result_type || 'percentage',
        setup,
        notes,
        trade_date,
        entry_time: entry_time || null,
        exit_time: exit_time || null,
      })
      .select()
      .single()

    if (error) {
      // Mensaje más descriptivo si la tabla no existe
      if (error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
        throw new Error('La tabla de trades no existe. Por favor ejecuta el script SQL en Supabase. Ver SETUP_DATABASE.md para más información.')
      }
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error creating trade' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Trade ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('trades')
      .update({
        ...updateData,
        risk_percentage: updateData.risk_percentage ? parseFloat(updateData.risk_percentage) : undefined,
        risk_reward: updateData.risk_reward ? parseFloat(updateData.risk_reward) : undefined,
        result_amount: updateData.result_amount ? parseFloat(updateData.result_amount) : undefined,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error updating trade' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Trade ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error deleting trade' },
      { status: 500 }
    )
  }
}

