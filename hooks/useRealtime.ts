'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimePosts(category?: string, onUpdate?: () => void) {
  useEffect(() => {
    let channel: RealtimeChannel

    if (category) {
      channel = supabase
        .channel(`posts-${category}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
            filter: `category=eq.${category}`,
          },
          () => {
            if (onUpdate) onUpdate()
          }
        )
        .subscribe()
    } else {
      channel = supabase
        .channel('all-posts')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
          },
          () => {
            if (onUpdate) onUpdate()
          }
        )
        .subscribe()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [category, onUpdate])
}

export function useRealtimeComments(postId: string, onUpdate?: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          if (onUpdate) onUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, onUpdate])
}

export function useRealtimeNotifications(userId: string | undefined, onUpdate?: () => void) {
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (onUpdate) onUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onUpdate])
}

