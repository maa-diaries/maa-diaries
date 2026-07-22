const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;

const missing = required.filter((key) => !import.meta.env[key]);

if (missing.length > 0 && import.meta.env.PROD) {
  console.warn(`[WARNING] Missing critical production environment variables: ${missing.join(', ')}. The application will run in degraded/mock mode.`);
}
