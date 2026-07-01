/**
 * Frontend environment configuration
 * VITE_API_BASE_URL defaults to /api so it works on the same server (port 5000).
 * In standalone Vite dev mode (npm run dev:frontend), set it to http://localhost:5000/api
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  mapApiKey: import.meta.env.VITE_MAP_API_KEY || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
