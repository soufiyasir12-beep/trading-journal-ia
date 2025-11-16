-- Fix marketplace policies and functions for production
-- This migration ensures:
-- 1. Public SELECT access to published strategies
-- 2. Corrected SQL functions with search_path
-- 3. Public storage bucket access

-- Drop and recreate policies to ensure they work without authentication
DROP POLICY IF EXISTS "Anyone can view published strategies" ON public.strategies_marketplace;
DROP POLICY IF EXISTS "Users can view own strategies" ON public.strategies_marketplace;

-- Public SELECT policy for published, non-private strategies (works without auth)
CREATE POLICY "Anyone can view published strategies"
  ON public.strategies_marketplace FOR SELECT
  TO public
  USING (is_published = true AND is_private = false);

-- Users can view their own strategies (even if private)
CREATE POLICY "Users can view own strategies"
  ON public.strategies_marketplace FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure INSERT, UPDATE, DELETE remain protected
-- (These should already exist, but we verify they're correct)

-- Fix function to update strategy rating with search_path
DROP FUNCTION IF EXISTS update_strategy_rating() CASCADE;
CREATE OR REPLACE FUNCTION update_strategy_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.strategies_marketplace
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.strategy_reviews
      WHERE strategy_id = COALESCE(NEW.strategy_id, OLD.strategy_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.strategy_reviews
      WHERE strategy_id = COALESCE(NEW.strategy_id, OLD.strategy_id)
    )
  WHERE id = COALESCE(NEW.strategy_id, OLD.strategy_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS update_rating_on_review_insert ON public.strategy_reviews;
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON public.strategy_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_strategy_rating();

DROP TRIGGER IF EXISTS update_rating_on_review_update ON public.strategy_reviews;
CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON public.strategy_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_strategy_rating();

DROP TRIGGER IF EXISTS update_rating_on_review_delete ON public.strategy_reviews;
CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON public.strategy_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_strategy_rating();

-- Fix function to update purchase count with search_path
DROP FUNCTION IF EXISTS update_purchase_count() CASCADE;
CREATE OR REPLACE FUNCTION update_purchase_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.strategies_marketplace
  SET purchase_count = (
    SELECT COUNT(*)
    FROM public.user_purchases
    WHERE strategy_id = NEW.strategy_id
  )
  WHERE id = NEW.strategy_id;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_purchase_count_on_insert ON public.user_purchases;
CREATE TRIGGER update_purchase_count_on_insert
  AFTER INSERT ON public.user_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_purchase_count();

-- Storage bucket policies (run these if bucket is not public)
-- Note: If bucket is public, these are not needed
-- Uncomment if you need to make the bucket public via policies instead

/*
-- Allow public to read files from strategy-files bucket
CREATE POLICY "Public can read strategy files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'strategy-files');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload strategy files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'strategy-files');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own strategy files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'strategy-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- Grant necessary permissions
GRANT SELECT ON public.strategies_marketplace TO anon, authenticated;
GRANT SELECT ON public.strategy_reviews TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.strategies_marketplace TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.strategy_reviews TO authenticated;
GRANT SELECT, INSERT ON public.user_purchases TO authenticated;
GRANT SELECT, INSERT ON public.payment_logs TO authenticated;

