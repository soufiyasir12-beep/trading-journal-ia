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
    const { post_id, comment_id, vote_type } = body

    if (!vote_type || (!post_id && !comment_id)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (vote_type !== 'upvote' && vote_type !== 'downvote') {
      return NextResponse.json(
        { error: 'Invalid vote_type' },
        { status: 400 }
      )
    }

    // Check if vote already exists
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq(post_id ? 'post_id' : 'comment_id', post_id || comment_id)
      .single()

    if (existingVote) {
      // Update existing vote
      if (existingVote.vote_type === vote_type) {
        // Remove vote if clicking the same vote type
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id)

        if (deleteError) throw deleteError

        return NextResponse.json({ vote: null, action: 'removed' })
      } else {
        // Change vote type
        const { data: updatedVote, error: updateError } = await supabase
          .from('votes')
          .update({ vote_type })
          .eq('id', existingVote.id)
          .select()
          .single()

        if (updateError) throw updateError

        return NextResponse.json({ vote: updatedVote, action: 'updated' })
      }
    } else {
      // Create new vote
      const { data: newVote, error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          post_id: post_id || null,
          comment_id: comment_id || null,
          vote_type,
        })
        .select()
        .single()

      if (insertError) throw insertError

      return NextResponse.json({ vote: newVote, action: 'created' }, { status: 201 })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to vote' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')
    const commentId = searchParams.get('comment_id')

    if (!user) {
      return NextResponse.json({ votes: [] })
    }

    let query = supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)

    if (postId) {
      query = query.eq('post_id', postId)
    } else if (commentId) {
      query = query.eq('comment_id', commentId)
    } else {
      return NextResponse.json(
        { error: 'post_id or comment_id is required' },
        { status: 400 }
      )
    }

    const { data: votes, error } = await query

    if (error) throw error

    return NextResponse.json({ votes: votes || [] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch votes' },
      { status: 500 }
    )
  }
}

