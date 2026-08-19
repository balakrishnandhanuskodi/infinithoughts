// CRITICAL: Inline polyfills FIRST, before anything else
if (!(globalThis as any).DOMMatrix) {
  class DOMMatrix {
    m11: number = 1;
    m12: number = 0;
    m21: number = 0;
    m22: number = 1;
    m41: number = 0;
    m42: number = 0;
    m13: number = 0;
    m14: number = 0;
    m23: number = 0;
    m24: number = 0;
    m31: number = 0;
    m32: number = 0;
    m33: number = 1;
    m34: number = 0;
    m43: number = 0;
    m44: number = 1;

    get a(): number { return this.m11; }
    get b(): number { return this.m12; }
    get c(): number { return this.m21; }
    get d(): number { return this.m22; }
    get e(): number { return this.m41; }
    get f(): number { return this.m42; }

    set a(v: number) { this.m11 = v; }
    set b(v: number) { this.m12 = v; }
    set c(v: number) { this.m21 = v; }
    set d(v: number) { this.m22 = v; }
    set e(v: number) { this.m41 = v; }
    set f(v: number) { this.m42 = v; }

    constructor(matrix?: string | number[]) {
      if (Array.isArray(matrix)) {
        if (matrix.length >= 6) {
          this.m11 = matrix[0] ?? 1;
          this.m12 = matrix[1] ?? 0;
          this.m21 = matrix[2] ?? 0;
          this.m22 = matrix[3] ?? 1;
          this.m41 = matrix[4] ?? 0;
          this.m42 = matrix[5] ?? 0;
          if (matrix.length >= 16) {
            this.m13 = matrix[6] ?? 0;
            this.m14 = matrix[7] ?? 0;
            this.m23 = matrix[8] ?? 0;
            this.m24 = matrix[9] ?? 0;
            this.m31 = matrix[10] ?? 0;
            this.m32 = matrix[11] ?? 0;
            this.m33 = matrix[12] ?? 1;
            this.m34 = matrix[13] ?? 0;
            this.m43 = matrix[14] ?? 0;
            this.m44 = matrix[15] ?? 1;
          }
        }
      }
    }

    multiply(other: any): DOMMatrix {
      if (!other) return this;
      const m11 = this.m11 * (other.m11 ?? 1) + this.m21 * (other.m12 ?? 0);
      const m12 = this.m12 * (other.m11 ?? 1) + this.m22 * (other.m12 ?? 0);
      const m21 = this.m11 * (other.m21 ?? 0) + this.m21 * (other.m22 ?? 1);
      const m22 = this.m12 * (other.m21 ?? 0) + this.m22 * (other.m22 ?? 1);
      const m41 = this.m11 * (other.m41 ?? 0) + this.m21 * (other.m42 ?? 0) + this.m41;
      const m42 = this.m12 * (other.m41 ?? 0) + this.m22 * (other.m42 ?? 0) + this.m42;
      return new DOMMatrix([m11, m12, m21, m22, m41, m42]);
    }

    translate(x?: number, y?: number): DOMMatrix {
      return new DOMMatrix([this.m11, this.m12, this.m21, this.m22, this.m41 + (x ?? 0), this.m42 + (y ?? 0)]);
    }

    scale(x?: number, y?: number): DOMMatrix {
      const sx = x ?? 1;
      const sy = y ?? sx;
      return new DOMMatrix([this.m11 * sx, this.m12 * sx, this.m21 * sy, this.m22 * sy, this.m41, this.m42]);
    }

    rotate(angle?: number): DOMMatrix {
      if (!angle || angle === 0) return this;
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const m11 = this.m11 * cos + this.m21 * sin;
      const m12 = this.m12 * cos + this.m22 * sin;
      const m21 = this.m11 * -sin + this.m21 * cos;
      const m22 = this.m12 * -sin + this.m22 * cos;
      return new DOMMatrix([m11, m12, m21, m22, this.m41, this.m42]);
    }

    inverse(): DOMMatrix {
      const det = this.m11 * this.m22 - this.m12 * this.m21;
      if (det === 0) return new DOMMatrix([1, 0, 0, 1, 0, 0]);
      return new DOMMatrix([
        this.m22 / det, -this.m12 / det, -this.m21 / det, this.m11 / det,
        (this.m21 * this.m42 - this.m22 * this.m41) / det,
        (this.m12 * this.m41 - this.m11 * this.m42) / det
      ]);
    }

    toString(): string {
      return `matrix(${this.m11}, ${this.m12}, ${this.m21}, ${this.m22}, ${this.m41}, ${this.m42})`;
    }

    get isIdentity(): boolean {
      return this.m11 === 1 && this.m12 === 0 && this.m21 === 0 && this.m22 === 1 && this.m41 === 0 && this.m42 === 0;
    }
  }

  Object.defineProperty(globalThis, 'DOMMatrix', { value: DOMMatrix, writable: true, enumerable: false, configurable: true });
  if (typeof global !== 'undefined' && global !== globalThis) {
    Object.defineProperty(global, 'DOMMatrix', { value: DOMMatrix, writable: true, enumerable: false, configurable: true });
  }
  if (typeof (globalThis as any).window !== 'undefined') {
    (globalThis as any).window.DOMMatrix = DOMMatrix;
  }
  console.log(`✅ [polyfills] DOMMatrix polyfill initialized inline`);
}

if (!(globalThis as any).DOMMatrixReadOnly) {
  (globalThis as any).DOMMatrixReadOnly = (globalThis as any).DOMMatrix;
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// v1.0.2 - Phase 2 PDF Upload with Issue Routes and Page Extraction Live

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

    // Run database migrations before loading routes
    console.log('🔧 [index.ts] Running database migrations...');
    const { runMigrations } = await import('./db/runMigrations');
    await runMigrations();
    console.log('✅ [index.ts] Database migrations completed');

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

    // Issue upload routes (mount FIRST, before general admin routes)
    apiRouter.use('/admin/issues/upload', issueUploadRoutes);
    console.log('✅ [index.ts] Issue upload routes mounted at /api/admin/issues/upload');

    // Admin routes (general - catches remaining /admin/* routes)
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
