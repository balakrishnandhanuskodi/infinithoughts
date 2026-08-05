import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load env FIRST, before anything else
const envPath = path.resolve(__dirname, '../.env');
console.log('📁 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
console.log('✅ DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
if (result.error) {
  console.error('❌ Error loading .env:', result.error);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

// Load routes after env is configured
(async () => {
  try {
    console.log('📚 [index.ts] Starting route loading process...');

    console.log('📚 [index.ts] Importing article routes...');
    const articleRoutes = (await import('./routes/articles')).default;
    console.log('✅ [index.ts] Article routes imported successfully');

    console.log('📚 [index.ts] Importing admin routes...');
    const adminRoutes = (await import('./routes/admin')).default;
    console.log('✅ [index.ts] Admin routes imported successfully');

    // API v1 routes
    const apiRouter = express.Router();

    // Article routes
    apiRouter.use('/articles', articleRoutes);
    console.log('✅ [index.ts] Article routes mounted at /api/articles');

    // Admin routes
    apiRouter.use('/admin', adminRoutes);
    console.log('✅ [index.ts] Admin routes mounted at /api/admin');

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

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 [index.ts] Backend running on http://localhost:${PORT}`);
      console.log(`📚 [index.ts] API docs: http://localhost:${PORT}/api`);
      console.log(`🏥 [index.ts] Health check: http://localhost:${PORT}/health`);
    });

    server.on('error', (err: any) => {
      console.error('❌ [index.ts] Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ [index.ts] Failed to load routes:', error);
    if (error instanceof Error) {
      console.error('❌ [index.ts] Error message:', error.message);
      console.error('❌ [index.ts] Error stack:', error.stack);
    }
    process.exit(1);
  }
})();

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling - must be last
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
