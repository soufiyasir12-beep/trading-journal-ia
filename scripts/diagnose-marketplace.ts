/**
 * Diagnostic script for marketplace issues
 * Run: npx tsx scripts/diagnose-marketplace.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnose() {
  console.log('🔍 Diagnosing Marketplace Issues...\n')

  // 1. Check total strategies
  console.log('1. Checking total strategies in database...')
  const { data: allStrategies, error: allError } = await supabase
    .from('strategies_marketplace')
    .select('id, title, is_published, is_private, created_at')
    .order('created_at', { ascending: false })

  if (allError) {
    console.error('❌ Error fetching all strategies:', allError)
  } else {
    console.log(`✅ Total strategies in DB: ${allStrategies?.length || 0}`)
    if (allStrategies && allStrategies.length > 0) {
      console.log('   Sample strategies:')
      allStrategies.slice(0, 5).forEach((s: any) => {
        console.log(`   - ${s.title} (published: ${s.is_published}, private: ${s.is_private})`)
      })
    }
  }

  // 2. Check published strategies
  console.log('\n2. Checking published, non-private strategies...')
  const { data: publishedStrategies, error: publishedError } = await supabase
    .from('strategies_marketplace')
    .select('*')
    .eq('is_published', true)
    .eq('is_private', false)

  if (publishedError) {
    console.error('❌ Error fetching published strategies:', publishedError)
    console.error('   This is likely an RLS policy issue!')
  } else {
    console.log(`✅ Published strategies: ${publishedStrategies?.length || 0}`)
    if (publishedStrategies && publishedStrategies.length > 0) {
      console.log('   Published strategies:')
      publishedStrategies.forEach((s: any) => {
        console.log(`   - ${s.title} (ID: ${s.id})`)
        console.log(`     Price: $${s.price}, Rating: ${s.rating || 0}`)
      })
    } else {
      console.log('   ⚠️  No published strategies found!')
      console.log('   Check that strategies have:')
      console.log('     - is_published = true')
      console.log('     - is_private = false')
    }
  }

  // 3. Test public query (simulating anonymous user)
  console.log('\n3. Testing public query (anonymous access)...')
  const { data: publicStrategies, error: publicError } = await supabase
    .from('strategies_marketplace')
    .select('id, title, is_published, is_private')
    .eq('is_published', true)
    .eq('is_private', false)
    .limit(5)

  if (publicError) {
    console.error('❌ Public query failed:', publicError)
    console.error('   This indicates an RLS policy problem!')
    console.error('   Run migration 009_fix_marketplace_rls_final.sql')
  } else {
    console.log(`✅ Public query works! Found ${publicStrategies?.length || 0} strategies`)
  }

  // 4. Check storage bucket
  console.log('\n4. Checking storage bucket...')
  const { data: files, error: filesError } = await supabase.storage
    .from('strategy-files')
    .list('', { limit: 10 })

  if (filesError) {
    console.error('❌ Error accessing storage bucket:', filesError)
    console.error('   Make sure bucket "strategy-files" exists and is public')
  } else {
    console.log(`✅ Storage bucket accessible. Files: ${files?.length || 0}`)
  }

  // 5. Summary
  console.log('\n📊 Summary:')
  console.log(`   Total strategies: ${allStrategies?.length || 0}`)
  console.log(`   Published strategies: ${publishedStrategies?.length || 0}`)
  console.log(`   Public query works: ${!publicError ? '✅' : '❌'}`)
  console.log(`   Storage accessible: ${!filesError ? '✅' : '❌'}`)

  if (publishedStrategies && publishedStrategies.length === 0) {
    console.log('\n⚠️  ISSUE: No published strategies found!')
    console.log('   Solutions:')
    console.log('   1. Check that strategies have is_published = true')
    console.log('   2. Check that strategies have is_private = false')
    console.log('   3. Update strategies in Supabase dashboard:')
    console.log('      UPDATE strategies_marketplace SET is_published = true, is_private = false WHERE id = \'your-strategy-id\';')
  }

  if (publicError) {
    console.log('\n⚠️  ISSUE: RLS policies blocking public access!')
    console.log('   Solution: Run migration 009_fix_marketplace_rls_final.sql')
  }
}

diagnose().catch(console.error)

