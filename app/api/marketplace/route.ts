import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

/**
 * GET /api/marketplace
 * Get all published strategies with optional filters
 * Works without authentication for public viewing
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Try to get user, but don't fail if not authenticated
    let user = null
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user = currentUser
    } catch {
      // User not authenticated, continue with public query
    }

    const { searchParams } = new URL(request.url)
    const pair = searchParams.get('pair')
    const timeframe = searchParams.get('timeframe')
    const strategyType = searchParams.get('type')
    const minWinrate = searchParams.get('minWinrate')
    const complexity = searchParams.get('complexity')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Query without JOIN to auth.users (not possible directly)
    let query = supabase
      .from('strategies_marketplace')
      .select('*')
      .eq('is_published', true)
      .eq('is_private', false)

    // Apply filters
    if (pair) {
      query = query.eq('pair', pair)
    }
    if (timeframe) {
      query = query.eq('timeframe', timeframe)
    }
    if (strategyType) {
      query = query.eq('strategy_type', strategyType)
    }
    if (minWinrate) {
      query = query.gte('winrate', parseFloat(minWinrate))
    }
    if (complexity) {
      query = query.eq('complexity', complexity)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    const { data, error } = await query

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    // Check if user has purchased each strategy (only if authenticated)
    if (user && data && data.length > 0) {
      const strategyIds = data.map((s: any) => s.id)
      const { data: purchases } = await supabase
        .from('user_purchases')
        .select('strategy_id')
        .eq('user_id', user.id)
        .in('strategy_id', strategyIds)

      const purchasedIds = new Set(purchases?.map((p: any) => p.strategy_id) || [])

      data.forEach((strategy: any) => {
        strategy.is_purchased = purchasedIds.has(strategy.id)
        strategy.is_owner = strategy.user_id === user.id
      })
    } else if (data) {
      // Set defaults for non-authenticated users
      data.forEach((strategy: any) => {
        strategy.is_purchased = false
        strategy.is_owner = false
      })
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching marketplace strategies:', error)
    return NextResponse.json(
      { error: error.message || 'Error fetching marketplace strategies' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/marketplace
 * Upload a new strategy to marketplace
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const isPublished = formData.get('is_published') === 'true'
    const isPrivate = formData.get('is_private') === 'true'
    const pair = formData.get('pair') as string
    const timeframe = formData.get('timeframe') as string
    const strategyType = formData.get('strategy_type') as string
    const winrate = formData.get('winrate') ? parseFloat(formData.get('winrate') as string) : null
    const complexity = formData.get('complexity') as string
    const tags = formData.get('tags') as string
    const previewText = formData.get('preview_text') as string
    const file = formData.get('file') as File | null

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    let fileUrl: string | null = null
    let fileName: string | null = null
    let fileType: string | null = null

    // Upload file to Supabase Storage if provided
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('strategy-files')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        return NextResponse.json({ error: 'Error uploading file: ' + uploadError.message }, { status: 500 })
      }

      // Get public URL - use the correct Supabase storage URL format
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && uploadData?.path) {
        // Construct public URL: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
        fileUrl = `${supabaseUrl}/storage/v1/object/public/strategy-files/${uploadData.path}`
      } else {
        // Fallback to getPublicUrl method
        const { data: urlData } = supabase.storage.from('strategy-files').getPublicUrl(filePath)
        fileUrl = urlData.publicUrl
      }
      fileName = file.name
      fileType = file.type
    }

    // Parse tags
    const tagsArray = tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : []

    const { data, error } = await supabase
      .from('strategies_marketplace')
      .insert({
        user_id: user.id,
        title,
        description,
        price,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        is_published: isPublished,
        is_private: isPrivate,
        pair: pair || null,
        timeframe: timeframe || null,
        strategy_type: strategyType || null,
        winrate: winrate || null,
        complexity: complexity || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        preview_text: previewText || null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating marketplace strategy:', error)
    return NextResponse.json(
      { error: error.message || 'Error creating marketplace strategy' },
      { status: 500 }
    )
  }
}

