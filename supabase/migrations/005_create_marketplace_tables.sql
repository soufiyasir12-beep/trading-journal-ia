-- Create marketplace strategies table
CREATE TABLE IF NOT EXISTS public.strategies_marketplace (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  file_url TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  is_published BOOLEAN DEFAULT false NOT NULL,
  is_private BOOLEAN DEFAULT true NOT NULL,
  tags TEXT[], -- Array of tags
  pair VARCHAR(50), -- Trading pair (e.g., EUR/USD, BTC/USD)
  timeframe VARCHAR(50), -- Timeframe (e.g., 1m, 5m, 1h, 1d)
  strategy_type VARCHAR(50), -- scalping, intraday, swing
  winrate DECIMAL(5, 2), -- Winrate percentage
  complexity VARCHAR(20), -- beginner, intermediate, advanced
  rating DECIMAL(3, 2) DEFAULT 0.00, -- Average rating (0-5)
  rating_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  preview_text TEXT, -- Preview text for non-buyers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create strategy reviews table
CREATE TABLE IF NOT EXISTS public.strategy_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES public.strategies_marketplace(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, strategy_id) -- One review per user per strategy
);

-- Create payment logs table (for future Stripe integration)
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES public.strategies_marketplace(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  stripe_payment_intent_id VARCHAR(255), -- For future Stripe integration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create user purchases table (to track who bought what)
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES public.strategies_marketplace(id) ON DELETE CASCADE,
  payment_log_id UUID REFERENCES public.payment_logs(id),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, strategy_id) -- Prevent duplicate purchases
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_strategies_marketplace_user_id ON public.strategies_marketplace(user_id);
CREATE INDEX IF NOT EXISTS idx_strategies_marketplace_published ON public.strategies_marketplace(is_published, is_private);
CREATE INDEX IF NOT EXISTS idx_strategies_marketplace_pair ON public.strategies_marketplace(pair);
CREATE INDEX IF NOT EXISTS idx_strategies_marketplace_timeframe ON public.strategies_marketplace(timeframe);
CREATE INDEX IF NOT EXISTS idx_strategies_marketplace_type ON public.strategies_marketplace(strategy_type);
CREATE INDEX IF NOT EXISTS idx_strategies_marketplace_rating ON public.strategies_marketplace(rating DESC);
CREATE INDEX IF NOT EXISTS idx_strategies_marketplace_created ON public.strategies_marketplace(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_reviews_strategy_id ON public.strategy_reviews(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_reviews_user_id ON public.strategy_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON public.payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_strategy_id ON public.payment_logs(strategy_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_strategy_id ON public.user_purchases(strategy_id);

-- Enable RLS
ALTER TABLE public.strategies_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strategies_marketplace
-- Anyone can view published, non-private strategies
CREATE POLICY "Anyone can view published strategies"
  ON public.strategies_marketplace FOR SELECT
  USING (is_published = true AND is_private = false);

-- Users can view their own strategies
CREATE POLICY "Users can view own strategies"
  ON public.strategies_marketplace FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own strategies
CREATE POLICY "Users can insert own strategies"
  ON public.strategies_marketplace FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own strategies
CREATE POLICY "Users can update own strategies"
  ON public.strategies_marketplace FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own strategies
CREATE POLICY "Users can delete own strategies"
  ON public.strategies_marketplace FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for strategy_reviews
-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON public.strategy_reviews FOR SELECT
  USING (true);

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews"
  ON public.strategy_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.strategy_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.strategy_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for payment_logs
-- Users can view their own payment logs
CREATE POLICY "Users can view own payment logs"
  ON public.payment_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own payment logs
CREATE POLICY "Users can insert own payment logs"
  ON public.payment_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_purchases
-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.user_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own purchases
CREATE POLICY "Users can insert own purchases"
  ON public.user_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update strategy rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_strategy_rating()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Triggers for updating strategy rating
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

-- Function to update purchase count
CREATE OR REPLACE FUNCTION update_purchase_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger for updating purchase count
DROP TRIGGER IF EXISTS update_purchase_count_on_insert ON public.user_purchases;
CREATE TRIGGER update_purchase_count_on_insert
  AFTER INSERT ON public.user_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_purchase_count();

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_strategies_marketplace_updated_at ON public.strategies_marketplace;
CREATE TRIGGER update_strategies_marketplace_updated_at
  BEFORE UPDATE ON public.strategies_marketplace
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_strategy_reviews_updated_at ON public.strategy_reviews;
CREATE TRIGGER update_strategy_reviews_updated_at
  BEFORE UPDATE ON public.strategy_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_logs_updated_at ON public.payment_logs;
CREATE TRIGGER update_payment_logs_updated_at
  BEFORE UPDATE ON public.payment_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

