import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';
import collegeRoutes from './collegeRoutes.js';
import aiRoutes from './aiRoutes.js';
import ingestionRoutes from './ingestionRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

// Health check — includes DB status
router.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  let collegeCount = 0;
  try {
    if (dbState === 1) {
      const { College } = await import('../models/College.js');
      collegeCount = await College.countDocuments();
    }
  } catch { /* ignore */ }

  res.json({
    success: true,
    message: 'CampusNavigator API is running',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
      colleges: collegeCount,
    },
    ai: {
      status: !!process.env.GEMINI_API_KEY ? 'active' : 'disabled',
      model: 'gemini-2.0-flash',
    },
    gemini: !!process.env.GEMINI_API_KEY,
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/colleges', collegeRoutes);
router.use('/ai', aiRoutes);
router.use('/ingestion', ingestionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

export default router;
