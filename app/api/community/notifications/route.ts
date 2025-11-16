import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) throw error

    // Get unique user IDs and post IDs
    const userIds = [...new Set((notifications || []).map((n: any) => n.related_user_id).filter(Boolean))]
    const postIds = [...new Set((notifications || []).map((n: any) => n.related_post_id).filter(Boolean))]

    // Fetch profiles and posts
    const [profilesResult, postsResult] = await Promise.all([
      userIds.length > 0
        ? supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds)
        : Promise.resolve({ data: [] }),
      postIds.length > 0
        ? supabase
            .from('posts')
            .select('id, title')
            .in('id', postIds)
        : Promise.resolve({ data: [] }),
    ])

    // Create maps
    const profileMap = new Map((profilesResult.data || []).map((p: any) => [p.id, p]))
    const postMap = new Map((postsResult.data || []).map((p: any) => [p.id, p]))

    // Combine notifications with related data
    const notificationsWithData = (notifications || []).map((notification: any) => ({
      ...notification,
      related_user: notification.related_user_id ? profileMap.get(notification.related_user_id) || null : null,
      related_post: notification.related_post_id ? postMap.get(notification.related_post_id) || null : null,
    }))

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({
      notifications: notificationsWithData,
      unreadCount: unreadCount || 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { notification_id, mark_all_read } = body

    if (mark_all_read) {
      // Mark all notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      return NextResponse.json({ success: true })
    } else if (notification_id) {
      // Mark single notification as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id)
        .eq('user_id', user.id)

      if (error) throw error

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'notification_id or mark_all_read is required' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    )
  }
}

