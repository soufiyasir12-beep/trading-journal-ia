-- Add account_capital field to profiles table for %/dollar conversion
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_capital DECIMAL(15, 2) DEFAULT NULL;

COMMENT ON COLUMN public.profiles.account_capital IS 'Account capital in USD for converting between percentage and dollar results';

