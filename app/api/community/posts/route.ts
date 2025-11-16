import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { ensureProfile } from '@/lib/community'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: posts, error } = await query

    if (error) throw error

    // Get unique user IDs
    const userIds = [...new Set((posts || []).map((post: any) => post.user_id))]

    // Fetch profiles for all users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, trading_style_tags')
      .in('id', userIds)

    // Create a map of user_id -> profile
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    // Combine posts with profiles
    const postsWithProfiles = (posts || []).map((post: any) => ({
      ...post,
      profiles: profileMap.get(post.user_id) || null,
    }))

    return NextResponse.json({ posts: postsWithProfiles })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

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
    const { category, title, content } = body

    if (!category || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ensure profile exists
    await ensureProfile(user.id, user.email)

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        category,
        title,
        content,
      })
      .select('*')
      .single()

    if (error) throw error

    // Fetch profile for the post author
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, trading_style_tags')
      .eq('id', user.id)
      .single()

    const postWithProfile = {
      ...post,
      profiles: profile || null,
    }

    return NextResponse.json({ post: postWithProfile }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}

