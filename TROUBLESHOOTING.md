# Troubleshooting Guide

## Backend API not responding (404 errors)

If you're seeing 404 errors when trying to access `/api/articles` from the deployed frontend, follow these steps:

### 1. Check Railway Environment Variables

Make sure the `DATABASE_URL` environment variable is set in Railway:

1. Go to https://railway.app
2. Open the infinithoughts-prod project
3. Click on the backend service
4. Go to Variables tab
5. Verify `DATABASE_URL` is set to your Supabase connection string

The DATABASE_URL should look like:
```
postgresql://postgres:PASSWORD@host.supabase.co:5432/postgres
```

**Important:** If @ symbols are in your password, they must be URL-encoded as `%40`

### 2. Check Netlify Environment Variables

Make sure the `VITE_API_URL` environment variable is set in Netlify:

1. Go to https://app.netlify.com
2. Open the infinithoughts site
3. Go to Site settings → Build & deploy → Environment
4. Verify `VITE_API_URL` is set to: `https://infinithoughts-prod.up.railway.app/api`

### 3. Check Railway Build Status

1. Go to the Railway dashboard
2. Click on the backend service
3. Go to Deployments tab
4. Check if the latest deployment was successful
5. Look at the build logs for any errors

Common build issues:
- TypeScript compilation errors (check console for `error TS...`)
- Missing dependencies (check package.json)
- Module import errors (check that all imports resolve correctly)

### 4. Check Railway Runtime Logs

1. Go to the backend service in Railway
2. Go to Logs tab
3. Look for error messages, especially:
   - `❌ [db/client.ts] DATABASE_URL environment variable is not set`
   - `❌ [index.ts] Failed to load routes:`
   - `✅ [index.ts] Backend running on http://localhost:PORT`

The logs should show:
```
✅ DATABASE_URL: SET
📚 [index.ts] Starting route loading process...
✅ [index.ts] Article routes loaded successfully
✅ [index.ts] Admin routes loaded successfully
✅ [index.ts] All API routes mounted at /api
🚀 [index.ts] Backend running on http://localhost:PORT
```

### 5. Test the Backend Directly

Test these endpoints to verify the backend is working:

**Health Check:**
```bash
curl https://infinithoughts-prod.up.railway.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-08-05T..."}
```

**Diagnostic Status:**
```bash
curl https://infinithoughts-prod.up.railway.app/status
```

Expected response shows DATABASE_URL is set and port is correct.

**List Articles:**
```bash
curl https://infinithoughts-prod.up.railway.app/api/articles
```

Expected response (if database is connected):
```json
{"articles":[],"total":0}
```

Or error with clear message if database connection fails.

### 6. Local Testing

To test locally before deploying:

```bash
# Install dependencies
npm install

# Build backend
npm run build --workspace=@infinithoughts/backend

# Set environment variables
export DATABASE_URL="postgresql://..."
export PORT=3001
export NODE_ENV=development

# Start backend
npm start --workspace=@infinithoughts/backend
```

You should see:
```
✅ DATABASE_URL: SET
📚 [index.ts] Starting route loading process...
[detailed route loading logs]
🚀 [index.ts] Backend running on http://localhost:3001
```

Then test locally:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/articles
```

### 7. Frontend Connection Issues

If the frontend dashboard still shows errors:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for failed requests to the API
4. Check the error response body for details
5. Verify the URL shown matches the Railway backend URL

If you see CORS errors, make sure the backend has CORS enabled (it should by default).

## Common Errors and Solutions

### Error: "DATABASE_URL environment variable is not set"
**Solution:** Set the DATABASE_URL environment variable in Railway dashboard

### Error: "Failed to connect to database"
**Solution:** Verify the PostgreSQL connection string is correct and Supabase server is accessible

### Error: "Route handlers are not registered"
**Solution:** Check the build logs for errors during route import. The detailed logging will show exactly which step failed.

### Frontend shows "API URL: https://infinithoughts-prod.up.railway.app/api"
This is correct! The frontend is configured properly to use the Railway backend.

## More Help

- Railway Docs: https://docs.railway.app/
- Netlify Docs: https://docs.netlify.com/
- Supabase Docs: https://supabase.com/docs
- Express.js Docs: https://expressjs.com/
