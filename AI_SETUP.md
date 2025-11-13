# Configuración del Módulo de IA

Este proyecto incluye un módulo de análisis de IA que utiliza Google Gemini 1.5 Flash para analizar tus operaciones de trading.

## Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Supabase (ya configurado)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# Google Gemini API (para análisis de IA)
GOOGLE_API_KEY=tu_clave_de_api_de_google

# Proveedor de IA (opcional, por defecto: gemini)
AI_PROVIDER=gemini
```

## Obtener una API Key de Google Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Get API Key" o ve a la sección de API Keys
4. Crea una nueva API Key
5. Copia la clave y agrégala a tu archivo `.env.local`

**Nota:** Gemini 1.5 Flash es gratuito para uso limitado, perfecto para desarrollo y proyectos pequeños.

## Configuración de la Base de Datos

Ejecuta la migración SQL en Supabase para crear las tablas necesarias:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Ejecuta el archivo `supabase/migrations/004_create_strategies_and_ai_analysis.sql`

Esto creará las siguientes tablas:
- `strategies`: Para guardar estrategias de trading
- `ai_analysis`: Para guardar los análisis generados por IA

## Uso del Módulo de IA

### 1. Crear una Estrategia

1. Ve a la página "Estrategias" en el menú lateral
2. Haz clic en "Nueva Estrategia"
3. Completa el formulario:
   - **Nombre**: Nombre de tu estrategia
   - **Descripción**: Descripción opcional
   - **Reglas**: Las reglas de tu estrategia (requerido)

### 2. Analizar Operaciones

1. Ve al Dashboard
2. En la sección "Análisis con IA", haz clic en "Analizar Operaciones"
3. La IA analizará tus trades y los comparará con tu estrategia
4. El análisis incluirá:
   - Errores detectados
   - Puntos fuertes
   - Recomendaciones personalizadas

### 3. Ver Análisis Anteriores

Los análisis se guardan automáticamente en la base de datos. Si ya existe un análisis reciente (últimas 24 horas), se mostrará sin necesidad de generar uno nuevo para ahorrar costos.

## Migración Futura a OpenAI

El código está diseñado para facilitar la migración a OpenAI GPT-4o en el futuro:

1. Instala el paquete de OpenAI:
   ```bash
   npm install openai
   ```

2. Agrega la variable de entorno:
   ```env
   OPENAI_API_KEY=tu_clave_de_openai
   ```

3. Cambia el proveedor en `.env.local`:
   ```env
   AI_PROVIDER=openai
   ```

4. Implementa el cliente de OpenAI en `lib/aiClient.ts` (ya hay un esqueleto preparado)

El resto del código funcionará sin cambios.

## Arquitectura del Módulo

```
lib/
  ├── geminiClient.ts      # Cliente específico de Gemini
  ├── aiClient.ts          # Cliente genérico que soporta múltiples proveedores
  └── auth.ts              # Autenticación (ya existente)

app/api/
  ├── analyze-trades/      # Endpoint para analizar trades
  └── strategies/          # Endpoint para gestionar estrategias

components/
  └── AIAnalysisCard.tsx   # Componente UI para mostrar análisis

supabase/migrations/
  └── 004_create_strategies_and_ai_analysis.sql  # Migración de BD
```

## Características

- ✅ Análisis automático de trades
- ✅ Comparación con estrategias personalizadas
- ✅ Análisis de imágenes de trades (preparado para futuro)
- ✅ Cacheo de resultados (24 horas)
- ✅ Diseño modular para múltiples proveedores de IA
- ✅ Interfaz de usuario intuitiva
- ✅ Manejo de errores robusto

## Solución de Problemas

### Error: "GOOGLE_API_KEY is required"
- Verifica que la variable de entorno `GOOGLE_API_KEY` esté configurada en `.env.local`
- Reinicia el servidor de desarrollo después de agregar la variable

### Error: "No trades found"
- Asegúrate de tener al menos un trade registrado
- Ve a la página "Trades" y agrega algunos trades primero

### Error: "Failed to analyze trades"
- Verifica que tu API Key de Google sea válida
- Revisa la consola del servidor para más detalles
- Asegúrate de que las tablas `strategies` y `ai_analysis` existan en Supabase

## Notas Importantes

- Los análisis se cachean por 24 horas para reducir costos
- La IA analiza todos los trades del usuario, no solo los recientes
- Si no hay estrategia definida, la IA analizará basándose en mejores prácticas
- El análisis de imágenes está preparado pero requiere implementación adicional del cliente Gemini

