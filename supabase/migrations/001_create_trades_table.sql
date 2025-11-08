-- Crear tabla de trades
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  pair VARCHAR(20) NOT NULL,
  risk_percentage DECIMAL(5, 2) NOT NULL,
  result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss', 'breakeven')),
  setup TEXT NOT NULL,
  notes TEXT,
  trade_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Crear índice para búsquedas rápidas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON trades(user_id, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios trades
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios trades
CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios trades
CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios trades
CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

