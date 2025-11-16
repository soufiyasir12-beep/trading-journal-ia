-- Seed data for marketplace (example strategies)
-- Note: This requires existing users in auth.users table
-- Replace the user_id values with actual user IDs from your auth.users table

-- Example: Get the first user ID (you should replace this with actual user IDs)
-- DO $$
-- DECLARE
--   first_user_id UUID;
-- BEGIN
--   SELECT id INTO first_user_id FROM auth.users LIMIT 1;
--   
--   IF first_user_id IS NOT NULL THEN
--     -- Insert example strategies
--     INSERT INTO public.strategies_marketplace (
--       user_id,
--       title,
--       description,
--       price,
--       is_published,
--       is_private,
--       pair,
--       timeframe,
--       strategy_type,
--       winrate,
--       complexity,
--       tags,
--       preview_text
--     ) VALUES
--     (
--       first_user_id,
--       'Scalping Master: 1-Minute Breakout Strategy',
--       'A proven scalping strategy for 1-minute timeframes focusing on breakouts with high win rate. Perfect for EUR/USD and GBP/USD pairs during high volatility periods.',
--       29.99,
--       true,
--       false,
--       'EUR/USD',
--       '1m',
--       'scalping',
--       72.5,
--       'intermediate',
--       ARRAY['scalping', 'breakout', 'high-frequency'],
--       'This strategy focuses on identifying key support and resistance levels on 1-minute charts. Entry signals occur when price breaks above resistance with volume confirmation. Risk management is crucial with tight stop losses at 5-10 pips.'
--     ),
--     (
--       first_user_id,
--       'Swing Trading System: Weekly Trend Following',
--       'A comprehensive swing trading system designed for weekly timeframes. Captures major trends with excellent risk-reward ratios. Best for intermediate to advanced traders.',
--       49.99,
--       true,
--       false,
--       'BTC/USD',
--       '1w',
--       'swing',
--       68.0,
--       'advanced',
--       ARRAY['swing', 'trend-following', 'crypto'],
--       'This system uses multiple timeframe analysis to identify major trends. Entry points are confirmed using RSI divergence and moving average crossovers. Position sizing is based on ATR calculations for optimal risk management.'
--     ),
--     (
--       first_user_id,
--       'Free: Beginner''s Guide to Intraday Trading',
--       'A free comprehensive guide for beginners starting their intraday trading journey. Includes basic concepts, risk management, and entry/exit strategies.',
--       0.00,
--       true,
--       false,
--       'EUR/USD',
--       '1h',
--       'intraday',
--       55.0,
--       'beginner',
--       ARRAY['beginner', 'intraday', 'education'],
--       'This guide covers the fundamentals of intraday trading including: understanding market sessions, reading candlestick patterns, basic technical indicators, and developing a trading plan. Perfect for those just starting out.'
--     ),
--     (
--       first_user_id,
--       'Advanced Momentum Trading: 4-Hour Strategy',
--       'An advanced momentum trading strategy optimized for 4-hour timeframes. Uses multiple confirmation signals and advanced risk management techniques.',
--       79.99,
--       true,
--       false,
--       'GBP/USD',
--       '4h',
--       'intraday',
--       75.0,
--       'advanced',
--       ARRAY['momentum', 'intraday', 'advanced'],
--       'This strategy identifies strong momentum moves using MACD, Stochastic, and Volume analysis. Entry signals require confluence from all three indicators. Stop losses are placed using ATR-based calculations, and profit targets use Fibonacci extensions.'
--     ),
--     (
--       first_user_id,
--       'Crypto Scalping: 5-Minute Strategy',
--       'A fast-paced scalping strategy specifically designed for cryptocurrency markets. Works best with BTC/USD and ETH/USD during active trading hours.',
--       39.99,
--       true,
--       false,
--       'BTC/USD',
--       '5m',
--       'scalping',
--       70.0,
--       'intermediate',
--       ARRAY['crypto', 'scalping', '5-minute'],
--       'This strategy leverages the high volatility of crypto markets. Uses Bollinger Bands and RSI to identify overbought/oversold conditions. Entry signals occur when price touches band extremes with RSI confirmation. Quick in and out trades with 1:2 risk-reward ratio.'
--     );
--   END IF;
-- END $$;

-- Alternative: Manual seed script (run this after creating users)
-- Replace 'USER_ID_HERE' with actual user IDs

-- Example strategies (uncomment and replace USER_ID_HERE with actual user IDs)
/*
INSERT INTO public.strategies_marketplace (
  user_id,
  title,
  description,
  price,
  is_published,
  is_private,
  pair,
  timeframe,
  strategy_type,
  winrate,
  complexity,
  tags,
  preview_text
) VALUES
(
  'USER_ID_HERE',
  'Scalping Master: 1-Minute Breakout Strategy',
  'A proven scalping strategy for 1-minute timeframes focusing on breakouts with high win rate. Perfect for EUR/USD and GBP/USD pairs during high volatility periods.',
  29.99,
  true,
  false,
  'EUR/USD',
  '1m',
  'scalping',
  72.5,
  'intermediate',
  ARRAY['scalping', 'breakout', 'high-frequency'],
  'This strategy focuses on identifying key support and resistance levels on 1-minute charts. Entry signals occur when price breaks above resistance with volume confirmation. Risk management is crucial with tight stop losses at 5-10 pips.'
),
(
  'USER_ID_HERE',
  'Swing Trading System: Weekly Trend Following',
  'A comprehensive swing trading system designed for weekly timeframes. Captures major trends with excellent risk-reward ratios. Best for intermediate to advanced traders.',
  49.99,
  true,
  false,
  'BTC/USD',
  '1w',
  'swing',
  68.0,
  'advanced',
  ARRAY['swing', 'trend-following', 'crypto'],
  'This system uses multiple timeframe analysis to identify major trends. Entry points are confirmed using RSI divergence and moving average crossovers. Position sizing is based on ATR calculations for optimal risk management.'
),
(
  'USER_ID_HERE',
  'Free: Beginner''s Guide to Intraday Trading',
  'A free comprehensive guide for beginners starting their intraday trading journey. Includes basic concepts, risk management, and entry/exit strategies.',
  0.00,
  true,
  false,
  'EUR/USD',
  '1h',
  'intraday',
  55.0,
  'beginner',
  ARRAY['beginner', 'intraday', 'education'],
  'This guide covers the fundamentals of intraday trading including: understanding market sessions, reading candlestick patterns, basic technical indicators, and developing a trading plan. Perfect for those just starting out.'
),
(
  'USER_ID_HERE',
  'Advanced Momentum Trading: 4-Hour Strategy',
  'An advanced momentum trading strategy optimized for 4-hour timeframes. Uses multiple confirmation signals and advanced risk management techniques.',
  79.99,
  true,
  false,
  'GBP/USD',
  '4h',
  'intraday',
  75.0,
  'advanced',
  ARRAY['momentum', 'intraday', 'advanced'],
  'This strategy identifies strong momentum moves using MACD, Stochastic, and Volume analysis. Entry signals require confluence from all three indicators. Stop losses are placed using ATR-based calculations, and profit targets use Fibonacci extensions.'
),
(
  'USER_ID_HERE',
  'Crypto Scalping: 5-Minute Strategy',
  'A fast-paced scalping strategy specifically designed for cryptocurrency markets. Works best with BTC/USD and ETH/USD during active trading hours.',
  39.99,
  true,
  false,
  'BTC/USD',
  '5m',
  'scalping',
  70.0,
  'intermediate',
  ARRAY['crypto', 'scalping', '5-minute'],
  'This strategy leverages the high volatility of crypto markets. Uses Bollinger Bands and RSI to identify overbought/oversold conditions. Entry signals occur when price touches band extremes with RSI confirmation. Quick in and out trades with 1:2 risk-reward ratio.'
);
*/

-- Note: To seed data, you can:
-- 1. Run this migration file
-- 2. Or manually insert strategies through the UI
-- 3. Or create a script that uses the API endpoints

