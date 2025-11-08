-- Agregar campos de hora de entrada y salida
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS entry_time TIME,
ADD COLUMN IF NOT EXISTS exit_time TIME;

