import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (profileError) throw profileError

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get trading stats from trades table
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('result, result_amount, result_type')
      .eq('user_id', id)

    if (tradesError) {
      console.error('Error fetching trades:', tradesError)
    }

    // Calculate stats
    const totalTrades = trades?.length || 0
    const wins = trades?.filter(t => t.result === 'win').length || 0
    const losses = trades?.filter(t => t.result === 'loss').length || 0
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

    let totalProfit = 0
    trades?.forEach(trade => {
      if (trade.result === 'win' && trade.result_amount) {
        if (trade.result_type === 'percentage') {
          totalProfit += trade.result_amount
        } else {
          totalProfit += trade.result_amount
        }
      } else if (trade.result === 'loss' && trade.result_amount) {
        if (trade.result_type === 'percentage') {
          totalProfit -= trade.result_amount
        } else {
          totalProfit -= trade.result_amount
        }
      }
    })

    // Get recent posts
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, title, category, created_at, upvotes, downvotes, comments_count')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      profile,
      stats: {
        totalTrades,
        wins,
        losses,
        winRate: Math.round(winRate * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
      },
      recentPosts: recentPosts || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params

    if (!user || user.id !== id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { username, bio, avatar_url, trading_style_tags } = body

    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (trading_style_tags !== undefined) updateData.trading_style_tags = trading_style_tags

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile: updatedProfile })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

