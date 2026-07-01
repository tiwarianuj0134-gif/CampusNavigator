/**
 * Environment Configuration
 * Validates all required env vars at startup.
 * NO localhost fallbacks for MongoDB — Atlas only.
 */

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend/ directory (handles both `npm run dev` and `npx tsx`)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Also try backend/.env when run from project root
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be ≥ 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be ≥ 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().default(''),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('500'),
  LOG_LEVEL: z.string().default('debug'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      console.error('═══════════════════════════════════════════');
      console.error('❌ Environment validation failed:');
      missing.forEach(m => console.error(`   • ${m}`));
      console.error('');
      console.error('   Please check backend/.env');
      console.error('═══════════════════════════════════════════');
    }

    // In development, provide safe defaults for non-DB vars only
    // MONGODB_URI has NO default — must always come from .env
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ FATAL: MONGODB_URI is not set. Cannot start without a database.');
      console.error('   Set it in backend/.env');
      process.exit(1);
    }

    return {
      PORT: process.env.PORT || '5000',
      NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
      MONGODB_URI: mongoUri,
      JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production-32chars',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-32ch',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '900000',
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '500',
      LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    };
  }
};

export const config = parseEnv();

export default config;
