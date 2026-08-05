import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import articleRoutes from './routes/articles';
import adminRoutes from './routes/admin';

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

// API v1 routes
const apiRouter = express.Router();

// Article routes
apiRouter.use('/articles', articleRoutes);

// Admin routes
apiRouter.use('/admin', adminRoutes);

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

app.use('/api', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
});
