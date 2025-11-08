# Configuración de la Base de Datos

## Problema: Tabla 'trades' no encontrada

Si estás recibiendo el error "Could not find the table 'public.trades' in the schema cache", necesitas ejecutar las migraciones en tu base de datos de Supabase.

## Solución Rápida

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Copia y pega el contenido del archivo `supabase/migrations/000_combined_trades_table.sql`
4. Haz clic en **Run** para ejecutar el script
5. Si la tabla ya existe pero necesitas agregar los campos de hora, ejecuta también `supabase/migrations/003_add_time_fields.sql`
6. Verifica que la tabla se haya creado correctamente

## Verificación

Después de ejecutar el script, puedes verificar que la tabla existe:

1. Ve a **Table Editor** en Supabase
2. Deberías ver la tabla `trades` en la lista
3. La tabla debe tener las siguientes columnas:
   - id (UUID)
   - user_id (UUID)
   - image_url (TEXT)
   - pair (VARCHAR)
   - risk_percentage (DECIMAL)
   - direction (VARCHAR)
   - risk_reward (DECIMAL)
   - result (VARCHAR)
   - result_amount (DECIMAL)
   - result_type (VARCHAR)
   - setup (TEXT)
   - notes (TEXT)
   - trade_date (DATE)
   - **entry_time (TIME)** - Nueva
   - **exit_time (TIME)** - Nueva
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

## Notas Importantes

- Las políticas RLS (Row Level Security) están configuradas para que cada usuario solo pueda ver y modificar sus propios trades
- El trigger automáticamente actualiza el campo `updated_at` cuando se modifica un registro
- Todos los índices están configurados para optimizar las consultas
- Los campos `entry_time` y `exit_time` son opcionales y se usan para el análisis de mejor hora para operar
