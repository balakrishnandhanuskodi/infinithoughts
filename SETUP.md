# Setup Guide

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 9+
- Git
- PostgreSQL database (we use Supabase)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/balakrishnandhanuskodi/infinithoughts.git
cd infinithoughts
```

### 2. Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces (backend and admin-dashboard).

### 3. Set Up Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
# Backend
DATABASE_URL="postgresql://user:password@host:5432/database"
PORT=3001
NODE_ENV=development

# Frontend (for local development)
VITE_API_URL=http://localhost:3001/api
```

### 4. Database Setup

If using Supabase:

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings → Database → Connection string
3. Copy the connection string and update DATABASE_URL in `.env`
4. **Important:** If your password contains `@`, replace it with `%40`

For example:
```
Original: postgresql://postgres:my@password@db.supabase.co:5432/postgres
Fixed: postgresql://postgres:my%40password@db.supabase.co:5432/postgres
```

### 5. Initialize Database Schema

```bash
npm run migrate --workspace=@infinithoughts/backend
```

This creates all necessary tables for:
- Articles and article metadata
- Article status workflow tracking
- Articles tags and categories
- Issues/Magazines and articles
- User management
- Audit logging

### 6. Start Development Servers

**Terminal 1 - Backend (Port 3001):**
```bash
npm run dev --workspace=@infinithoughts/backend
```

You should see:
```
✅ DATABASE_URL: SET
📚 [index.ts] Starting route loading process...
✅ [index.ts] All API routes mounted at /api
🚀 [index.ts] Backend running on http://localhost:3001
```

**Terminal 2 - Frontend (Port 5173):**
```bash
npm run dev --workspace=@infinithoughts/admin-dashboard
```

You should see:
```
Local: http://localhost:5173/
```

### 7. Access the Application

- Admin Dashboard: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/health

## Project Structure

```
infinithoughts/
├── backend/                          # Express API server
│   ├── src/
│   │   ├── index.ts                 # Main application entry point
│   │   ├── db/
│   │   │   ├── client.ts           # Database connection pool
│   │   │   └── migrations/          # SQL migrations
│   │   ├── services/
│   │   │   ├── articleService.ts   # Article CRUD operations
│   │   │   └── xmlParser.ts        # XML parsing utilities
│   │   ├── routes/
│   │   │   ├── articles.ts         # Article endpoints
│   │   │   └── admin.ts            # Admin endpoints
│   │   └── middleware/              # Express middleware
│   ├── dist/                        # Compiled JavaScript (generated)
│   └── package.json
│
├── admin-dashboard/                  # React Vite application
│   ├── src/
│   │   ├── main.tsx                # Application entry point
│   │   ├── config/
│   │   │   └── api.ts             # API configuration
│   │   ├── pages/                  # Route components
│   │   ├── components/             # Reusable components
│   │   └── App.tsx                 # Main app component
│   ├── dist/                       # Built frontend (generated)
│   └── package.json
│
├── package.json                     # Root workspace configuration
├── netlify.toml                    # Netlify deployment config
├── railway.json                    # Railway deployment config
├── .env.example                    # Environment variable template
├── SETUP.md                        # This file
├── TROUBLESHOOTING.md              # Troubleshooting guide
└── README.md                       # Project overview
```

## Available Scripts

### Backend
```bash
npm run dev --workspace=@infinithoughts/backend          # Start dev server with hot reload
npm run build --workspace=@infinithoughts/backend        # Build TypeScript to JavaScript
npm run start --workspace=@infinithoughts/backend        # Start production server
npm run migrate --workspace=@infinithoughts/backend      # Run database migrations
npm run test:db --workspace=@infinithoughts/backend      # Test database connection
npm run type-check --workspace=@infinithoughts/backend   # Check TypeScript types
```

### Admin Dashboard
```bash
npm run dev --workspace=@infinithoughts/admin-dashboard        # Start dev server
npm run build --workspace=@infinithoughts/admin-dashboard      # Build for production
npm run preview --workspace=@infinithoughts/admin-dashboard    # Preview production build
npm run type-check --workspace=@infinithoughts/admin-dashboard # Check TypeScript types
```

## Deployment

### Deploy Backend to Railway

1. Push code to GitHub:
   ```bash
   git push origin main
   ```

2. Railway auto-deploys from GitHub (if configured)

3. Set environment variables in Railway dashboard:
   - `DATABASE_URL`: Supabase connection string
   - `PORT`: 3001 (or your preferred port)
   - `NODE_ENV`: production

4. Monitor deployment in Railway dashboard

### Deploy Frontend to Netlify

1. Netlify auto-deploys from GitHub (if connected)

2. Set environment variables in Netlify:
   - `VITE_API_URL`: `https://your-railway-backend.up.railway.app/api`

3. Build command: `npm run build --workspace=@infinithoughts/admin-dashboard`

4. Publish directory: `admin-dashboard/dist`

5. Monitor deployment in Netlify dashboard

## Environment Variables Reference

### Backend Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)

### Frontend Environment Variables
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001/api)

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for:
- Backend API not responding
- Database connection issues
- Frontend showing API errors
- Build failures
- And more...

## Next Steps

1. ✅ Set up local development environment
2. ✅ Test backend API locally
3. ✅ Test frontend locally
4. 📝 Deploy backend to Railway
5. 📝 Deploy frontend to Netlify
6. 📝 Add sample articles via admin dashboard
7. 📝 Build Phase 2 features (Article Editor, Workflows, etc.)

## Support

- **Railway Documentation**: https://docs.railway.app/
- **Netlify Documentation**: https://docs.netlify.com/
- **Supabase Documentation**: https://supabase.com/docs
- **Express.js Documentation**: https://expressjs.com/
- **React Documentation**: https://react.dev/
