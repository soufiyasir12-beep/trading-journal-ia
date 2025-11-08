-- Agregar nuevos campos a la tabla trades
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS direction VARCHAR(10) CHECK (direction IN ('Long', 'Short')),
ADD COLUMN IF NOT EXISTS risk_reward DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS result_amount DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS result_type VARCHAR(10) DEFAULT 'percentage' CHECK (result_type IN ('percentage', 'money'));

-- Actualizar la columna result para incluir más opciones si es necesario
-- (ya está definida como win, loss, breakeven, que está bien)

-- Agregar índices para mejorar las consultas de analíticas
CREATE INDEX IF NOT EXISTS idx_trades_result ON trades(user_id, result);
CREATE INDEX IF NOT EXISTS idx_trades_direction ON trades(user_id, direction);
CREATE INDEX IF NOT EXISTS idx_trades_setup ON trades(user_id, setup);

