import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// v1.0.1 - Phase 2 PDF Upload with Issue Routes

// Load env FIRST, before anything else
const envPath = path.resolve(__dirname, '../.env');
console.log('📁 Looking for .env file at:', envPath);
try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    const err = result.error as any;
    if (err.code === 'ENOENT') {
      console.log('ℹ️  No .env file found (expected in production - using Railway environment variables)');
    } else {
      console.error('❌ Error loading .env:', result.error);
    }
  } else {
    console.log('✅ Loaded .env file successfully');
  }
} catch (error) {
  console.log('ℹ️  .env file not found (expected in production - using Railway environment variables)');
}
console.log('✅ DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const app = express();
// Use PORT from environment (set by Railway), fallback to 3000 (Railway's default port detection)
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests from localhost, Netlify deployments, and Railway
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      /netlify\.app$/, // Allow all Netlify subdomains
      /railway\.app$/, // Allow all Railway subdomains
    ];

    if (!origin || allowedOrigins.some(allowed =>
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Diagnostic endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    port: PORT,
    node_env: process.env.NODE_ENV,
    database_url: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 40)}...` : 'UNDEFINED',
    timestamp: new Date().toISOString(),
  });
});

// Load routes and start server
(async () => {
  try {
    console.log('📚 [index.ts] Starting route loading process...');

    console.log('📚 [index.ts] Importing article routes...');
    const articleRoutes = (await import('./routes/articles')).default;
    console.log('✅ [index.ts] Article routes imported successfully');

    console.log('📚 [index.ts] Importing admin routes...');
    const adminRoutes = (await import('./routes/admin')).default;
    console.log('✅ [index.ts] Admin routes imported successfully');

    console.log('📚 [index.ts] Importing issue upload routes...');
    const issueUploadRoutes = (await import('./routes/issueUpload')).default;
    console.log('✅ [index.ts] Issue upload routes imported successfully');

    // API v1 routes
    const apiRouter = express.Router();

    // Article routes
    apiRouter.use('/articles', articleRoutes);
    console.log('✅ [index.ts] Article routes mounted at /api/articles');

    // Admin routes
    apiRouter.use('/admin', adminRoutes);
    console.log('✅ [index.ts] Admin routes mounted at /api/admin');

    // Issue upload routes
    apiRouter.use('/admin/issues/upload', issueUploadRoutes);
    console.log('✅ [index.ts] Issue upload routes mounted at /api/admin/issues/upload');

    // Welcome message
    apiRouter.get('/', (req, res) => {
      res.json({
        message: 'infinithoughts API v1',
        endpoints: {
          articles: '/api/articles',
          admin: '/api/admin',
        },
      });
    });
    console.log('✅ [index.ts] API welcome endpoint registered');

    app.use('/api', apiRouter);
    console.log('✅ [index.ts] All API routes mounted at /api');

    // 404 handler - must be after all other routes
    app.use((req, res) => {
      console.warn(`[index.ts] 404 Not Found: ${req.method} ${req.path}`);
      res.status(404).json({ error: 'Not found' });
    });
    console.log('✅ [index.ts] 404 handler registered');

    // Error handling - must be last
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ [index.ts] Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
    console.log('✅ [index.ts] Error handler registered');

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [index.ts] Backend running on 0.0.0.0:${PORT}`);
      console.log(`📚 [index.ts] API docs: http://localhost:${PORT}/api`);
      console.log(`🏥 [index.ts] Health check: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (err: any) => {
      console.error('❌ [index.ts] Server error:', err.message);
      console.error('❌ [index.ts] Error code:', err.code);
      console.error('❌ [index.ts] Full error:', err);
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📛 [index.ts] SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ [index.ts] Server closed');
        process.exit(0);
      });
    });

    console.log('✅ [index.ts] Server initialization complete');
  } catch (error) {
    console.error('❌ [index.ts] Failed to start server:', error);
    if (error instanceof Error) {
      console.error('❌ [index.ts] Error message:', error.message);
      console.error('❌ [index.ts] Error stack:', error.stack);
    }
    process.exit(1);
  }
})();
