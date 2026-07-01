/**
 * CampusNavigator — Unified Server
 * Express serves both API and React frontend on ONE port.
 *
 * DEV mode  : Vite runs as middleware inside Express → HMR works, one server
 * PROD mode : Express serves the pre-built dist/ folder as static files
 */

// ── DNS fix: use Google DNS (8.8.8.8) so MongoDB Atlas SRV records
//    resolve correctly on any ISP/network that blocks them. ──────────
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ROOT_DIR: backend/src → backend → project root
// When running with tsx (dev): __dirname = backend/src → ../../ = project root
// When running compiled (prod): __dirname = backend/dist → ../../ = project root
const ROOT_DIR = path.resolve(__dirname, '..', '..');
// Vite output folder (built into project root's dist/)
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const app = express();
app.set('trust proxy', 1);

// ── Security ──────────────────────────────────────────────────
// Relax helmet in dev so Vite's inline scripts work
app.use(
  helmet({
    contentSecurityPolicy: config.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: config.NODE_ENV === 'production',
  })
);

// ── CORS (only matters in dev when Vite HMR is on a different WS) ──
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.NODE_ENV === 'development') return callback(null, true);
      const allowed = [
        config.FRONTEND_URL,
        'http://localhost:5000',
        'http://localhost:5173',
      ];
      if (
        allowed.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app')
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Rate limiting (API only) ───────────────────────────────────
app.use(
  '/api',
  rateLimit({
    windowMs: Number(config.RATE_LIMIT_WINDOW_MS),
    max: Number(config.RATE_LIMIT_MAX_REQUESTS),
    message: {
      success: false,
      message: 'Too many requests. Please wait.',
      code: 'RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ── HTTP logging ──────────────────────────────────────────────
if (config.NODE_ENV !== 'test') {
  app.use(morgan('short', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// ── API routes ────────────────────────────────────────────────
app.use('/api', routes);

// ── Frontend serving ─────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDatabase();
    const port = Number(config.PORT);

    if (config.NODE_ENV === 'development') {
      // ── DEV: Vite as Express middleware (HMR included) ──────
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: ROOT_DIR,
        server: {
          middlewareMode: true,
          hmr: true,
        },
        appType: 'spa',
      });

      // Vite handles all non-API requests (static assets + HMR)
      app.use(vite.middlewares);

      // SPA fallback — Vite transforms the real index.html
      app.use('*', async (req, res, next) => {
        try {
          const { createReadStream } = await import('fs');
          const { readFile } = await import('fs/promises');

          // Read the real index.html from project root
          const indexPath = path.join(ROOT_DIR, 'index.html');
          const rawHtml = await readFile(indexPath, 'utf-8');

          // Let Vite transform it (applies plugins, HMR injection, etc.)
          const html = await vite.transformIndexHtml(req.originalUrl, rawHtml);

          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });

      logger.info('  🔥 Vite HMR middleware active');

    } else {
      // ── PROD: serve pre-built dist/ ─────────────────────────
      const fs = await import('fs');

      if (!fs.existsSync(DIST_DIR)) {
        logger.error(`❌ dist/ not found at ${DIST_DIR}`);
        logger.error('   Run: npm run build  (from project root)');
        logger.error('   Then restart the server.');
      } else {
        // Serve static files
        app.use(
          express.static(DIST_DIR, {
            maxAge: '1y',
            etag: true,
            lastModified: true,
            // Don't cache index.html
            setHeaders(res, filePath) {
              if (filePath.endsWith('index.html')) {
                res.setHeader('Cache-Control', 'no-cache');
              }
            },
          })
        );

        // SPA fallback — all non-API routes serve index.html
        app.get('*', (req, res) => {
          res.sendFile(path.join(DIST_DIR, 'index.html'));
        });

        logger.info(`  📦 Serving static files from ${DIST_DIR}`);
      }
    }

    // Error handlers (must come after all routes)
    app.use(notFoundHandler);
    app.use(errorHandler);

    app.listen(port, () => {
      logger.info('');
      logger.info('═══════════════════════════════════════════');
      logger.info('  🚀 CampusNavigator — Unified Server');
      logger.info(`  📡 Mode: ${config.NODE_ENV}`);
      logger.info(`  🌐 http://localhost:${port}          ← Open this`);
      logger.info(`  📚 http://localhost:${port}/api/health`);
      logger.info(`  🤖 Gemini AI: ${config.GEMINI_API_KEY ? 'Active' : 'Disabled'}`);
      if (config.NODE_ENV === 'development') {
        logger.info('  🔥 HMR: Active (Vite middleware)');
      }
      logger.info('═══════════════════════════════════════════');
      logger.info('');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
  }
};

// ── Process handlers ──────────────────────────────────────────
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down...');
  process.exit(0);
});

startServer();

export default app;
