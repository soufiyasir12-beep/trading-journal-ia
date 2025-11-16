import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

/**
 * POST /api/marketplace/[id]/purchase
 * Purchase a strategy (placeholder for Stripe integration)
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

    // Get strategy
    const { data: strategy, error: strategyError } = await supabase
      .from('strategies_marketplace')
      .select('*')
      .eq('id', id)
      .single()

    if (strategyError || !strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 })
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('strategy_id', id)
      .single()

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
    }

    // Check if user is the owner
    if (strategy.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot purchase your own strategy' }, { status: 400 })
    }

    // For free strategies, directly add to purchases
    if (strategy.price === 0) {
      const { data: purchase, error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          user_id: user.id,
          strategy_id: id,
        })
        .select()
        .single()

      if (purchaseError) {
        throw purchaseError
      }

      return NextResponse.json(
        {
          data: {
            purchase,
            message: 'Strategy added to your library',
          },
        },
        { status: 201 }
      )
    }

    // For paid strategies, create payment log (Stripe integration placeholder)
    const { data: paymentLog, error: paymentError } = await supabase
      .from('payment_logs')
      .insert({
        user_id: user.id,
        strategy_id: id,
        amount: strategy.price,
        currency: 'USD',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (paymentError) {
      throw paymentError
    }

    // TODO: Integrate with Stripe here
    // For now, we'll mark as completed (in production, this should only happen after Stripe confirms)
    const { error: updateError } = await supabase
      .from('payment_logs')
      .update({ payment_status: 'completed' })
      .eq('id', paymentLog.id)

    if (updateError) {
      throw updateError
    }

    // Add to purchases
    const { data: purchase, error: purchaseError } = await supabase
      .from('user_purchases')
      .insert({
        user_id: user.id,
        strategy_id: id,
        payment_log_id: paymentLog.id,
      })
      .select()
      .single()

    if (purchaseError) {
      throw purchaseError
    }

    return NextResponse.json(
      {
        data: {
          purchase,
          payment_log: paymentLog,
          message: 'Strategy purchased successfully',
          // In production, return Stripe checkout URL here
          stripe_checkout_url: null,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error purchasing strategy:', error)
    return NextResponse.json({ error: error.message || 'Error purchasing strategy' }, { status: 500 })
  }
}

