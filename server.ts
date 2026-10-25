import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { db } from './server/config/db.js';
import authRoutes from './server/routes/authRoutes.js';
import employeeRoutes from './server/routes/employeeRoutes.js';
import leaveRoutes from './server/routes/leaveRoutes.js';
import attendanceRoutes from './server/routes/attendanceRoutes.js';
import announcementRoutes from './server/routes/announcementRoutes.js';
import trainingRoutes from './server/routes/trainingRoutes.js';
import dashboardRoutes from './server/routes/dashboardRoutes.js';
import { errorHandler } from './server/middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Initialize DB and Seed data if not already initialized
  await db.init();

  // Basic security and parsing middlewares
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'Skill Wallet HRMS API',
      timestamp: new Date().toISOString(),
    });
  });

  // Re-seed utility route
  app.post('/api/seed/reset', async (_req, res) => {
    try {
      await db.seed();
      res.json({ success: true, message: 'Database reset to initial demo state.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Mount REST API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/training', trainingRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Central error handler
  app.use(errorHandler);

  // Serve Frontend
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Skill Wallet HRMS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
