# Resumen de Correcciones del Marketplace

## Problema Principal Resuelto

**Error:** `"Could not find a relationship between 'strategies_marketplace' and 'user_id' in the schema cache"`

**Causa:** Intentábamos hacer JOIN con `auth.users` usando la sintaxis `user:user_id`, pero Supabase no permite JOINs directos con `auth.users` porque no es una tabla pública.

## Cambios Realizados

### 1. API Routes - Removidos JOINs con auth.users

**Archivos modificados:**
- `app/api/marketplace/route.ts` (GET)
- `app/api/marketplace/[id]/route.ts` (GET)
- `app/api/marketplace/[id]/reviews/route.ts` (GET)

**Cambios:**
- Removido: `.select('*, user:user_id (...)')`
- Reemplazado por: `.select('*')`
- Las queries ahora solo obtienen datos de las tablas públicas

### 2. Frontend Components - Actualizados para no esperar objeto `user`

**Archivos modificados:**
- `app/(protected)/marketplace/[id]/page.tsx`
- `components/marketplace/ReviewSection.tsx`

**Cambios:**
- Removido campo `user` del interface `Strategy`
- Agregado campo `user_id` directamente
- Cambiado `strategy.user.email` por texto estático "Author"
- Cambiado `review.user?.email` por "User"

### 3. Migración SQL - Políticas RLS Corregidas

**Archivo:** `supabase/migrations/009_fix_marketplace_rls_final.sql`

**Contenido:**
- Recrea políticas públicas para SELECT
- Asegura que `TO public` esté correctamente configurado
- Otorga permisos SELECT a rol `anon`

### 4. Script de Diagnóstico

**Archivo:** `scripts/diagnose-marketplace.ts`

**Uso:**
```bash
npx tsx scripts/diagnose-marketplace.ts
```

Este script verifica:
- Total de estrategias en la BD
- Estrategias publicadas
- Acceso público funcionando
- Storage bucket accesible

## Pasos para Aplicar

### 1. Ejecutar Migración SQL

```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: supabase/migrations/009_fix_marketplace_rls_final.sql
```

### 2. Verificar Estrategias en la Base de Datos

Asegúrate de que las estrategias tengan:
- `is_published = true`
- `is_private = false`

Si no, actualiza manualmente:
```sql
UPDATE strategies_marketplace 
SET is_published = true, is_private = false 
WHERE id = 'tu-strategy-id';
```

### 3. Ejecutar Script de Diagnóstico

```bash
npx tsx scripts/diagnose-marketplace.ts
```

### 4. Probar la API

```bash
# Sin autenticación (debe funcionar)
curl https://tu-dominio.com/api/marketplace

# Debe retornar JSON con estrategias publicadas
```

## Verificación

### Checklist:

- [x] JOINs con auth.users removidos
- [x] Queries simplificadas a `SELECT *`
- [x] Frontend actualizado para no esperar objeto `user`
- [x] Migración SQL creada para políticas RLS
- [x] Script de diagnóstico creado

### Pruebas:

1. **API GET /marketplace:**
   - ✅ Debe funcionar sin autenticación
   - ✅ Debe retornar estrategias con `is_published = true` y `is_private = false`
   - ✅ No debe tener error de relación

2. **Frontend:**
   - ✅ Debe mostrar estrategias en el marketplace
   - ✅ No debe fallar por campos `user` faltantes

3. **Base de Datos:**
   - ✅ Políticas RLS permiten SELECT público
   - ✅ Estrategias tienen flags correctos

## Notas Importantes

- **No se puede hacer JOIN con auth.users:** Supabase no permite JOINs directos con `auth.users`. Si necesitas información del usuario, debes obtenerla por separado usando `auth.admin.getUserById()` (solo en server-side con service role key).

- **El bucket vacío no afecta:** El marketplace funciona sin archivos. El campo `file_url` es opcional.

- **Funciones SQL con search_path:** Ya fueron corregidas en la migración 008, pero si aún aparecen warnings, ejecuta la migración 009.

## Si Aún No Funciona

1. **Verifica las estrategias:**
   ```sql
   SELECT id, title, is_published, is_private 
   FROM strategies_marketplace;
   ```

2. **Verifica las políticas RLS:**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'strategies_marketplace';
   ```

3. **Ejecuta el script de diagnóstico:**
   ```bash
   npx tsx scripts/diagnose-marketplace.ts
   ```

4. **Revisa los logs del servidor:**
   - Busca errores en la consola del navegador
   - Revisa logs de Vercel/Supabase

