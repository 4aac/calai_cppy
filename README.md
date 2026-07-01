# CalAI Copy

MVP PWA movil-first para registrar calorias y macros desde foto, codigo de barras/QR, busqueda o entrada manual. Esta pensado para desplegar en Vercel con Next.js App Router y APIs server-side.

## Stack

- Next.js 16 App Router, React 19, TypeScript y Tailwind CSS.
- Supabase Auth + Postgres con RLS.
- OpenAI Responses API para vision con salida estructurada.
- Open Food Facts API v3 para productos por EAN/UPC.
- ZXing browser para escaneo web de codigos.

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
OPENAI_API_KEY=
OPENAI_VISION_MODEL=gpt-5.5
OPEN_FOOD_FACTS_USER_AGENT=CalAI Copy MVP - contact: you@example.com
```

`SUPABASE_SECRET_KEY` y `OPENAI_API_KEY` nunca deben exponerse al cliente. En Vercel, configura estos valores en Project Settings -> Environment Variables para Preview y Production.

## Supabase

1. Crea un proyecto Supabase.
2. Ejecuta `supabase/migrations/001_initial_schema.sql` en el SQL editor o con Supabase CLI.
3. Habilita email/password en Auth.
4. Copia URL, publishable key y service role key al `.env.local` y a Vercel.

La migracion crea `profiles`, `foods`, `branded_products`, `meals`, `meal_items`, `user_corrections` y `scan_history`, activa RLS y seed de alimentos frecuentes.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Sin variables de entorno, la UI usa datos de demo para que puedas revisar la experiencia; las APIs protegidas devuelven errores claros hasta configurar Supabase/OpenAI.

## Checks

```bash
npm run lint
npm run test
npm run build
```

## Despliegue en Vercel

1. Importa el repo en Vercel.
2. Selecciona framework `Next.js`.
3. Anade las variables de entorno.
4. Ejecuta un preview deploy.
5. Verifica login, onboarding, foto, codigo y guardado antes de promover a produccion.

Con CLI:

```bash
vercel
vercel --prod
```
