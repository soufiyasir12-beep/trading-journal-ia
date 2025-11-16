import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

/**
 * GET /api/marketplace/[id]
 * Get a single strategy by ID
 * Works without authentication for public viewing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Try to get user, but don't fail if not authenticated
    let user = null
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user = currentUser
    } catch {
      // User not authenticated, continue with public query
    }

    const { id } = await params

    // Get strategy (without JOIN to auth.users - not possible directly)
    const { data: strategy, error } = await supabase
      .from('strategies_marketplace')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 })
    }

    // Check if user can view this strategy
    const canView =
      (strategy.is_published && !strategy.is_private) || strategy.user_id === user?.id

    if (!canView) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 })
    }

    // Check if user has purchased or owns the strategy
    let isPurchased = false
    let isOwner = false

    if (user) {
      isOwner = strategy.user_id === user.id

      if (!isOwner && strategy.price > 0) {
        const { data: purchase } = await supabase
          .from('user_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('strategy_id', id)
          .single()

        isPurchased = !!purchase
      } else if (strategy.price === 0) {
        // Free strategies are automatically "purchased"
        isPurchased = true
      }
    }

    // Get reviews (without JOIN to auth.users)
    const { data: reviews } = await supabase
      .from('strategy_reviews')
      .select('*')
      .eq('strategy_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json(
      {
        data: {
          ...strategy,
          is_purchased: isPurchased,
          is_owner: isOwner,
          reviews: reviews || [],
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error fetching strategy:', error)
    return NextResponse.json({ error: error.message || 'Error fetching strategy' }, { status: 500 })
  }
}

/**
 * PUT /api/marketplace/[id]
 * Update a strategy
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const { data: strategy } = await supabase
      .from('strategies_marketplace')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!strategy || strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = body.price
    if (body.is_published !== undefined) updateData.is_published = body.is_published
    if (body.is_private !== undefined) updateData.is_private = body.is_private
    if (body.pair !== undefined) updateData.pair = body.pair
    if (body.timeframe !== undefined) updateData.timeframe = body.timeframe
    if (body.strategy_type !== undefined) updateData.strategy_type = body.strategy_type
    if (body.winrate !== undefined) updateData.winrate = body.winrate
    if (body.complexity !== undefined) updateData.complexity = body.complexity
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    }
    if (body.preview_text !== undefined) updateData.preview_text = body.preview_text

    const { data, error } = await supabase
      .from('strategies_marketplace')
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
 * DELETE /api/marketplace/[id]
 * Delete a strategy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: strategy } = await supabase
      .from('strategies_marketplace')
      .select('user_id, file_url')
      .eq('id', id)
      .single()

    if (!strategy || strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete file from storage if exists
    if (strategy.file_url) {
      const filePath = strategy.file_url.split('/').slice(-2).join('/')
      await supabase.storage.from('strategy-files').remove([filePath])
    }

    // Delete strategy (cascade will handle reviews and purchases)
    const { error } = await supabase.from('strategies_marketplace').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Strategy deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting strategy:', error)
    return NextResponse.json({ error: error.message || 'Error deleting strategy' }, { status: 500 })
  }
}

