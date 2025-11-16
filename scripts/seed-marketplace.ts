/**
 * Seed script for marketplace strategies
 * 
 * Usage:
 * 1. Make sure you have users in your Supabase auth.users table
 * 2. Update the USER_EMAIL with an actual user email
 * 3. Run: npx tsx scripts/seed-marketplace.ts
 * 
 * Or use the Supabase SQL Editor to run the SQL migration file directly
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Replace with an actual user email from your database
const USER_EMAIL = 'user@example.com'

const exampleStrategies = [
  {
    title: 'Scalping Master: 1-Minute Breakout Strategy',
    description:
      'A proven scalping strategy for 1-minute timeframes focusing on breakouts with high win rate. Perfect for EUR/USD and GBP/USD pairs during high volatility periods.',
    price: 29.99,
    is_published: true,
    is_private: false,
    pair: 'EUR/USD',
    timeframe: '1m',
    strategy_type: 'scalping',
    winrate: 72.5,
    complexity: 'intermediate',
    tags: ['scalping', 'breakout', 'high-frequency'],
    preview_text:
      'This strategy focuses on identifying key support and resistance levels on 1-minute charts. Entry signals occur when price breaks above resistance with volume confirmation. Risk management is crucial with tight stop losses at 5-10 pips.',
  },
  {
    title: 'Swing Trading System: Weekly Trend Following',
    description:
      'A comprehensive swing trading system designed for weekly timeframes. Captures major trends with excellent risk-reward ratios. Best for intermediate to advanced traders.',
    price: 49.99,
    is_published: true,
    is_private: false,
    pair: 'BTC/USD',
    timeframe: '1w',
    strategy_type: 'swing',
    winrate: 68.0,
    complexity: 'advanced',
    tags: ['swing', 'trend-following', 'crypto'],
    preview_text:
      'This system uses multiple timeframe analysis to identify major trends. Entry points are confirmed using RSI divergence and moving average crossovers. Position sizing is based on ATR calculations for optimal risk management.',
  },
  {
    title: "Free: Beginner's Guide to Intraday Trading",
    description:
      'A free comprehensive guide for beginners starting their intraday trading journey. Includes basic concepts, risk management, and entry/exit strategies.',
    price: 0.0,
    is_published: true,
    is_private: false,
    pair: 'EUR/USD',
    timeframe: '1h',
    strategy_type: 'intraday',
    winrate: 55.0,
    complexity: 'beginner',
    tags: ['beginner', 'intraday', 'education'],
    preview_text:
      'This guide covers the fundamentals of intraday trading including: understanding market sessions, reading candlestick patterns, basic technical indicators, and developing a trading plan. Perfect for those just starting out.',
  },
  {
    title: 'Advanced Momentum Trading: 4-Hour Strategy',
    description:
      'An advanced momentum trading strategy optimized for 4-hour timeframes. Uses multiple confirmation signals and advanced risk management techniques.',
    price: 79.99,
    is_published: true,
    is_private: false,
    pair: 'GBP/USD',
    timeframe: '4h',
    strategy_type: 'intraday',
    winrate: 75.0,
    complexity: 'advanced',
    tags: ['momentum', 'intraday', 'advanced'],
    preview_text:
      'This strategy identifies strong momentum moves using MACD, Stochastic, and Volume analysis. Entry signals require confluence from all three indicators. Stop losses are placed using ATR-based calculations, and profit targets use Fibonacci extensions.',
  },
  {
    title: 'Crypto Scalping: 5-Minute Strategy',
    description:
      'A fast-paced scalping strategy specifically designed for cryptocurrency markets. Works best with BTC/USD and ETH/USD during active trading hours.',
    price: 39.99,
    is_published: true,
    is_private: false,
    pair: 'BTC/USD',
    timeframe: '5m',
    strategy_type: 'scalping',
    winrate: 70.0,
    complexity: 'intermediate',
    tags: ['crypto', 'scalping', '5-minute'],
    preview_text:
      'This strategy leverages the high volatility of crypto markets. Uses Bollinger Bands and RSI to identify overbought/oversold conditions. Entry signals occur when price touches band extremes with RSI confirmation. Quick in and out trades with 1:2 risk-reward ratio.',
  },
]

async function seedMarketplace() {
  try {
    // Get user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()

    if (userError || !users || users.users.length === 0) {
      console.error('No users found. Please create a user first.')
      process.exit(1)
    }

    const user = users.users.find((u) => u.email === USER_EMAIL) || users.users[0]
    console.log(`Using user: ${user.email} (${user.id})`)

    // Insert strategies
    for (const strategy of exampleStrategies) {
      const { data, error } = await supabase.from('strategies_marketplace').insert({
        user_id: user.id,
        ...strategy,
      })

      if (error) {
        console.error(`Error inserting strategy "${strategy.title}":`, error)
      } else {
        console.log(`✓ Inserted: ${strategy.title}`)
      }
    }

    console.log('\n✅ Marketplace seeding completed!')
  } catch (error) {
    console.error('Error seeding marketplace:', error)
    process.exit(1)
  }
}

seedMarketplace()

