import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params
    const body = await request.json()
    const { content } = body

    // Check if user owns the comment or is a moderator
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isModerator = profile?.role === 'moderator'
    const isOwner = comment.user_id === user.id

    if (!isOwner && !isModerator) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    // Fetch profile for the comment author
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, trading_style_tags')
      .eq('id', updatedComment.user_id)
      .single()

    const commentWithProfile = {
      ...updatedComment,
      profiles: profile || null,
    }

    return NextResponse.json({ comment: commentWithProfile })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params

    // Check if user owns the comment or is a moderator
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isModerator = profile?.role === 'moderator'
    const isOwner = comment.user_id === user.id

    if (!isOwner && !isModerator) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

