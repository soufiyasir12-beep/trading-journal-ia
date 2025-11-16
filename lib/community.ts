import { createClient } from './auth'

/**
 * Ensures a user profile exists in the profiles table
 * Called automatically when users interact with community features
 * This version works in server-side contexts (API routes)
 */
export async function ensureProfile(userId: string, email?: string) {
  try {
    const supabase = await createClient()
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return existingProfile
    }

    // Create profile if it doesn't exist
    const username = email?.split('@')[0] || `user_${userId.slice(0, 8)}`
    
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        role: 'user',
      })
      .select()
      .single()

    if (error) {
      // If error is due to username conflict, try with a number
      if (error.code === '23505') {
        const { data: retryProfile } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: `${username}_${Date.now()}`,
            role: 'user',
          })
          .select()
          .single()
        
        return retryProfile
      }
      throw error
    }

    return newProfile
  } catch (error) {
    console.error('Error ensuring profile:', error)
    return null
  }
}

