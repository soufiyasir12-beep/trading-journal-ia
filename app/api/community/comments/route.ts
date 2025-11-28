import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')

    if (!postId) {
      return NextResponse.json(
        { error: 'post_id is required' },
        { status: 400 }
      )
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .is('parent_id', null) // Get only top-level comments
      .order('created_at', { ascending: true })

    if (error) throw error

    // Get unique user IDs from comments
    const userIds = [...new Set((comments || []).map((c: any) => c.user_id))]

    // Fetch profiles for all users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, trading_style_tags')
      .in('id', userIds)

    // Create a map of user_id -> profile
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    // Fetch nested replies for each comment
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select('*')
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })

        // Get user IDs from replies
        const replyUserIds = [...new Set((replies || []).map((r: any) => r.user_id))]
        
        // Fetch profiles for reply authors
        const { data: replyProfiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, role, trading_style_tags')
          .in('id', replyUserIds)

        const replyProfileMap = new Map((replyProfiles || []).map((p: any) => [p.id, p]))

        return {
          ...comment,
          user_id: comment.user_id, // Explicitly include user_id
          profiles: profileMap.get(comment.user_id) || null,
          replies: (replies || []).map((reply: any) => ({
            ...reply,
            user_id: reply.user_id, // Explicitly include user_id
            profiles: replyProfileMap.get(reply.user_id) || null,
          })),
        }
      })
    )

    return NextResponse.json({ comments: commentsWithReplies })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
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
    const { post_id, content, parent_id } = body

    if (!post_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if post exists and is not locked
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('id, is_locked')
      .eq('id', post_id)
      .single()

    if (postError || !postData) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (postData.is_locked) {
      return NextResponse.json(
        { error: 'This thread is locked. Comments are disabled.' },
        { status: 403 }
      )
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        user_id: user.id,
        content,
        parent_id: parent_id || null,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error inserting comment:', error)
      throw error
    }

    // Fetch profile for the comment author
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, trading_style_tags')
      .eq('id', user.id)
      .single()

    const commentWithProfile = {
      ...comment,
      user_id: comment.user_id, // Explicitly include user_id
      profiles: profile || null,
    }

    return NextResponse.json({ comment: commentWithProfile }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    )
  }
}

