-- Script consolidado para crear la tabla trades con todos los campos necesarios
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear tabla de trades
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  pair VARCHAR(20) NOT NULL,
  risk_percentage DECIMAL(5, 2) NOT NULL,
  direction VARCHAR(10) CHECK (direction IN ('Long', 'Short')),
  risk_reward DECIMAL(10, 2),
  result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss', 'breakeven')),
  result_amount DECIMAL(15, 2),
  result_type VARCHAR(10) DEFAULT 'percentage' CHECK (result_type IN ('percentage', 'money')),
  setup TEXT NOT NULL,
  notes TEXT,
  trade_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_time TIME,
  exit_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON public.trades(user_id, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_result ON public.trades(user_id, result);
CREATE INDEX IF NOT EXISTS idx_trades_direction ON public.trades(user_id, direction);
CREATE INDEX IF NOT EXISTS idx_trades_setup ON public.trades(user_id, setup);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para evitar errores al re-ejecutar)
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;

-- Política: Los usuarios solo pueden ver sus propios trades
CREATE POLICY "Users can view own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios trades
CREATE POLICY "Users can insert own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios trades
CREATE POLICY "Users can update own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios trades
CREATE POLICY "Users can delete own trades"
  ON public.trades FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS update_trades_updated_at ON public.trades;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

