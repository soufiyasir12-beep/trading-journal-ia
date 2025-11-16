import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { following_id } = body

    if (!following_id) {
      return NextResponse.json(
        { error: 'following_id is required' },
        { status: 400 }
      )
    }

    if (following_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', following_id)
      .single()

    if (existingFollow) {
      // Unfollow
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('id', existingFollow.id)

      if (deleteError) throw deleteError

      return NextResponse.json({ following: false, action: 'unfollowed' })
    } else {
      // Follow
      const { data: newFollow, error: insertError } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      return NextResponse.json({ following: true, action: 'followed' }, { status: 201 })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to follow/unfollow' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') // 'followers' or 'following'

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    let query
    if (type === 'followers') {
      query = supabase
        .from('follows')
        .select('*')
        .eq('following_id', userId)
    } else {
      query = supabase
        .from('follows')
        .select('*')
        .eq('follower_id', userId)
    }

    const { data: follows, error } = await query

    if (error) throw error

    // Get user IDs from follows
    const userIds = type === 'followers'
      ? [...new Set((follows || []).map((f: any) => f.follower_id).filter(Boolean))]
      : [...new Set((follows || []).map((f: any) => f.following_id).filter(Boolean))]

    // Fetch profiles for all users
    let profiles: any[] = []
    if (userIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, role, trading_style_tags')
        .in('id', userIds)
      profiles = data || []
    }

    // Create a map of user_id -> profile
    const profileMap = new Map(profiles.map((p: any) => [p.id, p]))

    // Combine follows with profiles
    const followsWithProfiles = (follows || []).map((follow: any) => {
      const profileId = type === 'followers' ? follow.follower_id : follow.following_id
      return {
        ...follow,
        [type === 'followers' ? 'follower' : 'following']: profileMap.get(profileId) || null,
      }
    })

    // Check if current user is following
    let isFollowing = false
    if (user && userId !== user.id) {
      const { data: followCheck } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single()

      isFollowing = !!followCheck
    }

    return NextResponse.json({
      follows: followsWithProfiles,
      isFollowing,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch follows' },
      { status: 500 }
    )
  }
}

