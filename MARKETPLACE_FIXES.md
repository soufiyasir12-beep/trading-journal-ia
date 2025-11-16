# Correcciones del Marketplace para Producción

## Cambios Realizados

### 1. API Routes - Acceso Público

**Archivos modificados:**
- `app/api/marketplace/route.ts`
- `app/api/marketplace/[id]/route.ts`

**Cambios:**
- Los endpoints GET ahora funcionan sin autenticación
- Se captura el error de autenticación y se continúa con consultas públicas
- Se mantiene la lógica de purchases solo si hay usuario autenticado

### 2. URL Pública del Storage

**Archivo modificado:**
- `app/api/marketplace/route.ts` (POST)

**Cambios:**
- Se construye la URL pública correctamente usando `NEXT_PUBLIC_SUPABASE_URL`
- Formato: `https://[project-ref].supabase.co/storage/v1/object/public/strategy-files/[path]`
- Fallback al método `getPublicUrl()` si es necesario

### 3. Archivo Opcional

**Archivo modificado:**
- `app/api/marketplace/route.ts` (POST)

**Cambios:**
- Se verifica que el archivo exista y tenga tamaño > 0 antes de subir
- La estrategia se puede crear sin archivo adjunto

### 4. Layout Público

**Archivo modificado:**
- `app/(protected)/layout.tsx`

**Cambios:**
- El layout ya no redirige automáticamente si no hay usuario
- Las páginas individuales manejan sus propios requisitos de autenticación
- Marketplace funciona sin autenticación para ver

### 5. Proxy/Middleware

**Archivo modificado:**
- `proxy.ts`

**Cambios:**
- Marketplace ya no está en rutas protegidas
- Se permite acceso público a `/marketplace`
- Las acciones (upload, purchase) están protegidas en las API routes

## Migración SQL Requerida

**Archivo:** `supabase/migrations/008_fix_marketplace_policies.sql`

Esta migración:
1. ✅ Crea políticas públicas para SELECT en `strategies_marketplace`
2. ✅ Corrige funciones SQL con `SET search_path = public`
3. ✅ Mantiene INSERT/UPDATE/DELETE protegidos por `auth.uid()`
4. ✅ Incluye políticas opcionales para storage bucket

### Pasos para Aplicar:

1. **Ejecutar la migración SQL:**
   ```sql
   -- Ejecutar en Supabase SQL Editor
   -- Archivo: supabase/migrations/008_fix_marketplace_policies.sql
   ```

2. **Verificar Storage Bucket:**
   - Ir a Supabase Dashboard > Storage
   - Verificar que el bucket `strategy-files` existe
   - Si es privado, descomentar las políticas de storage en la migración

3. **Verificar Variables de Entorno:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

## Verificación

### Checklist:

- [ ] Migración SQL ejecutada
- [ ] Bucket `strategy-files` creado y configurado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Estrategias públicas aparecen sin autenticación
- [ ] Upload funciona con y sin archivo
- [ ] URLs de archivos son accesibles públicamente

### Pruebas:

1. **Sin autenticación:**
   - Visitar `/marketplace` - debe mostrar estrategias
   - Visitar `/marketplace/[id]` - debe mostrar detalles
   - No debe poder subir/comprar sin login

2. **Con autenticación:**
   - Debe poder subir estrategias
   - Debe poder comprar estrategias
   - Debe ver sus purchases

3. **Storage:**
   - URLs de archivos deben ser accesibles
   - Formato: `https://[project].supabase.co/storage/v1/object/public/strategy-files/[path]`

## Notas Importantes

- Las funciones SQL ahora tienen `SET search_path = public` para evitar warnings
- Las políticas RLS permiten SELECT público pero mantienen INSERT/UPDATE protegidos
- El marketplace es público para ver, pero requiere auth para acciones
- Los archivos son opcionales al crear estrategias

