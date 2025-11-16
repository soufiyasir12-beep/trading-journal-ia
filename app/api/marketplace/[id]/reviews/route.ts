import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

/**
 * GET /api/marketplace/[id]/reviews
 * Get all reviews for a strategy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get reviews (without JOIN to auth.users - not possible directly)
    const { data: reviews, error } = await supabase
      .from('strategy_reviews')
      .select('*')
      .eq('strategy_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ data: reviews || [] }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: error.message || 'Error fetching reviews' }, { status: 500 })
  }
}

/**
 * POST /api/marketplace/[id]/reviews
 * Create or update a review
 */
export async function POST(
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
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if user has purchased the strategy
    const { data: purchase } = await supabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('strategy_id', id)
      .single()

    if (!purchase) {
      return NextResponse.json(
        { error: 'You must purchase this strategy before reviewing' },
        { status: 403 }
      )
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('strategy_reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('strategy_id', id)
      .single()

    let review
    if (existingReview) {
      // Update existing review
      const { data, error } = await supabase
        .from('strategy_reviews')
        .update({ rating, comment: comment || null })
        .eq('id', existingReview.id)
        .select()
        .single()

      if (error) throw error
      review = data
    } else {
      // Create new review
      const { data, error } = await supabase
        .from('strategy_reviews')
        .insert({
          user_id: user.id,
          strategy_id: id,
          rating,
          comment: comment || null,
        })
        .select()
        .single()

      if (error) throw error
      review = data
    }

    return NextResponse.json({ data: review }, { status: existingReview ? 200 : 201 })
  } catch (error: any) {
    console.error('Error creating/updating review:', error)
    return NextResponse.json(
      { error: error.message || 'Error creating/updating review' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/marketplace/[id]/reviews
 * Delete a review
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

    const { error } = await supabase
      .from('strategy_reviews')
      .delete()
      .eq('user_id', user.id)
      .eq('strategy_id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: error.message || 'Error deleting review' }, { status: 500 })
  }
}

