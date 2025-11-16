-- Final fix for marketplace RLS policies
-- This ensures public SELECT access works correctly

-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Anyone can view published strategies" ON public.strategies_marketplace;
DROP POLICY IF EXISTS "Users can view own strategies" ON public.strategies_marketplace;

-- Public SELECT policy for published, non-private strategies
-- This MUST use TO public (not TO authenticated) to allow anonymous access
CREATE POLICY "Anyone can view published strategies"
  ON public.strategies_marketplace FOR SELECT
  TO public
  USING (is_published = true AND is_private = false);

-- Users can view their own strategies (even if private)
CREATE POLICY "Users can view own strategies"
  ON public.strategies_marketplace FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE public.strategies_marketplace ENABLE ROW LEVEL SECURITY;

-- Grant SELECT permission to anon role (important for public access)
GRANT SELECT ON public.strategies_marketplace TO anon;
GRANT SELECT ON public.strategy_reviews TO anon;

-- Verify the policies are correct
-- Run this query to test:
-- SELECT * FROM public.strategies_marketplace WHERE is_published = true AND is_private = false;

