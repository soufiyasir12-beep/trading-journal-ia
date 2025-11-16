import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Fetch profile for the post author
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, trading_style_tags, bio')
      .eq('id', post.user_id)
      .single()

    const postWithProfile = {
      ...post,
      profiles: profile || null,
    }

    return NextResponse.json({ post: postWithProfile })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
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

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { title, content } = body

    // Check if user owns the post or is a moderator
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isModerator = userProfile?.role === 'moderator'
    const isOwner = post.user_id === user.id

    if (!isOwner && !isModerator) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update({
        title: title || post.title,
        content: content || post.content,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    // Fetch profile for the post author
    const { data: authorProfile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, trading_style_tags')
      .eq('id', updatedPost.user_id)
      .single()

    const postWithProfile = {
      ...updatedPost,
      profiles: authorProfile || null,
    }

    return NextResponse.json({ post: postWithProfile })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if user owns the post or is a moderator
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isModerator = profile?.role === 'moderator'
    const isOwner = post.user_id === user.id

    if (!isOwner && !isModerator) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    )
  }
}

