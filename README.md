# Trading Journal IA

Un journal de trading moderno con análisis de IA integrado, construido con Next.js, Supabase y Google Gemini.

## Características

- 📊 **Dashboard Interactivo**: Visualiza estadísticas de tus operaciones
- 📈 **Análisis Detallado**: Gráficos y métricas de tu operativa
- 🤖 **Análisis con IA**: Analiza tus trades usando Google Gemini 1.5 Flash
- 📝 **Gestión de Estrategias**: Guarda y compara tus estrategias con tus operaciones
- 🎨 **Interfaz Moderna**: Diseño limpio y responsivo con Tailwind CSS
- 🔐 **Autenticación Segura**: Autenticación con Supabase
- 📱 **Responsive**: Funciona en todos los dispositivos

## Tecnologías

- **Next.js 16** - Framework React
- **Supabase** - Base de datos y autenticación
- **Google Gemini 1.5 Flash** - Análisis con IA
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **Recharts** - Gráficos

## Getting Started

### Prerrequisitos

- Node.js 18+ instalado
- Cuenta de Supabase
- Cuenta de Google AI Studio (para la API de Gemini)

### Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd trading-journal-ia
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_API_KEY=your_google_api_key
AI_PROVIDER=gemini
```

4. Configura la base de datos:

Ejecuta las migraciones SQL en Supabase:
- `supabase/migrations/000_combined_trades_table.sql` - Tabla de trades
- `supabase/migrations/004_create_strategies_and_ai_analysis.sql` - Tablas de estrategias e IA

Ver `SETUP_DATABASE.md` para más detalles.

5. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Configuración de IA

Para usar el módulo de análisis con IA, necesitas:

1. Obtener una API Key de Google Gemini desde [Google AI Studio](https://aistudio.google.com/)
2. Agregarla a tu archivo `.env.local` como `GOOGLE_API_KEY`
3. Ejecutar la migración de base de datos para las tablas de estrategias y análisis

Ver `AI_SETUP.md` para una guía detallada.

## Estructura del Proyecto

```
├── app/
│   ├── (protected)/        # Rutas protegidas
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── trades/         # Gestión de trades
│   │   ├── analysis/       # Análisis y gráficos
│   │   └── strategy/       # Gestión de estrategias
│   ├── api/                # API routes
│   │   ├── trades/         # API de trades
│   │   ├── strategies/     # API de estrategias
│   │   └── analyze-trades/ # API de análisis IA
│   └── auth/               # Autenticación
├── components/             # Componentes React
│   ├── AIAnalysisCard.tsx  # Componente de análisis IA
│   ├── Sidebar.tsx         # Barra lateral
│   └── Navbar.tsx          # Barra de navegación
├── lib/                    # Utilidades y clientes
│   ├── geminiClient.ts     # Cliente de Gemini
│   ├── aiClient.ts         # Cliente genérico de IA
│   └── auth.ts             # Autenticación
└── supabase/
    └── migrations/         # Migraciones SQL
```

## Uso

### Registrar Trades

1. Ve a la página "Trades"
2. Haz clic en "Nuevo Trade"
3. Completa el formulario con los detalles de tu operación
4. Guarda el trade

### Crear Estrategias

1. Ve a la página "Estrategias"
2. Haz clic en "Nueva Estrategia"
3. Define las reglas de tu estrategia
4. Guarda la estrategia

### Analizar con IA

1. Ve al Dashboard
2. En la sección "Análisis con IA", haz clic en "Analizar Operaciones"
3. La IA analizará tus trades y generará un informe detallado

## Migración a OpenAI

El código está diseñado para facilitar la migración a OpenAI GPT-4o:

1. Instala el paquete de OpenAI: `npm install openai`
2. Agrega `OPENAI_API_KEY` a tu `.env.local`
3. Cambia `AI_PROVIDER=openai` en `.env.local`
4. Implementa el cliente de OpenAI en `lib/aiClient.ts`

Ver `AI_SETUP.md` para más detalles.

## Documentación

- `SETUP_DATABASE.md` - Guía de configuración de la base de datos
- `AI_SETUP.md` - Guía de configuración del módulo de IA

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
