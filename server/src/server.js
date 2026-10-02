import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { supabase } from './config/supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(generalLimiter);


// Health & System Info Route
app.get('/api/health', async (req, res) => {
  try {
    const { count, error } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    res.json({
      status: 'healthy',
      service: 'CampusVoice API',
      timestamp: new Date().toISOString(),
      database: error ? 'error' : 'connected',
      categoriesCount: count || 0,
    });
  } catch (err) {
    res.status(500).json({
      status: 'degraded',
      error: err.message,
    });
  }
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 CampusVoice Backend Server running`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`===========================================`);
});
