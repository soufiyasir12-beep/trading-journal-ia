-- Crear tabla de estrategias
CREATE TABLE IF NOT EXISTS public.strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rules TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Crear índices para strategies
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON public.strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_strategies_user_created ON public.strategies(user_id, created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Políticas para strategies
DROP POLICY IF EXISTS "Users can view own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can insert own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can update own strategies" ON public.strategies;
DROP POLICY IF EXISTS "Users can delete own strategies" ON public.strategies;

CREATE POLICY "Users can view own strategies"
  ON public.strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies"
  ON public.strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies"
  ON public.strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies"
  ON public.strategies FOR DELETE
  USING (auth.uid() = user_id);

-- Crear tabla de análisis de IA
CREATE TABLE IF NOT EXISTS public.ai_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis TEXT NOT NULL,
  errors_detected TEXT,
  strengths TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Crear índices para ai_analysis
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON public.ai_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_created ON public.ai_analysis(user_id, created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_analysis
DROP POLICY IF EXISTS "Users can view own ai_analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Users can insert own ai_analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Users can update own ai_analysis" ON public.ai_analysis;
DROP POLICY IF EXISTS "Users can delete own ai_analysis" ON public.ai_analysis;

CREATE POLICY "Users can view own ai_analysis"
  ON public.ai_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_analysis"
  ON public.ai_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_analysis"
  ON public.ai_analysis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_analysis"
  ON public.ai_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at en strategies
DROP TRIGGER IF EXISTS update_strategies_updated_at ON public.strategies;
CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON public.strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en ai_analysis
DROP TRIGGER IF EXISTS update_ai_analysis_updated_at ON public.ai_analysis;
CREATE TRIGGER update_ai_analysis_updated_at
  BEFORE UPDATE ON public.ai_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

