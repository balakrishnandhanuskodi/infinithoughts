# Supabase Setup Guide for infinithoughts Phase 1

This guide walks you through setting up the infinithoughts platform with **Supabase** instead of local PostgreSQL.

## Why Supabase?

✅ Managed PostgreSQL (no local setup hassles)
✅ Free tier includes 500MB storage
✅ Built-in authentication (for Phase 2)
✅ Real-time capabilities
✅ Easy backups and scaling
✅ SSL/TLS included
✅ Works great for development and production

---

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **Sign Up**
3. Use GitHub to sign up (recommended) or email
4. Verify your email

---

## Step 2: Create a New Project

1. Click **New Project** or **Create a new project**
2. Fill in:
   - **Project Name:** `infinithoughts`
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you (e.g., `us-east-1`)
3. Click **Create new project**
4. Wait 2-3 minutes for the database to be created

---

## Step 3: Get Your Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Find **Connection string** section
3. Select **Connection pooling** (recommended for Node.js)
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with the password you created

Example:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxx.supabase.co:6543/postgres?schema=public
```

---

## Step 4: Configure Your Project

Update your backend `.env` file:

```bash
cd infinithoughts/backend
nano .env
```

Replace the DATABASE_URL with your Supabase connection string:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxx.supabase.co:6543/postgres?schema=public
```

Save (Ctrl+O, Enter, Ctrl+X)

---

## Step 5: Run Migrations

From the project root:

```bash
npm run -w backend migrate
```

Expected output:
```
📍 Connecting to: postgresql://postgres:***@db.xxxxxxxxx.supabase.co:6543/postgres?schema=public
🔄 Running database migrations...
📝 Running migration: 001_init_schema.sql
✅ Completed: 001_init_schema.sql
✅ All migrations completed successfully!
```

---

## Step 6: Import Sample Data

```bash
npm run -w backend import-samples
```

Expected output:
```
✅ Import completed!
   Batch ID: [uuid]
   Imported: 5/5
📚 Sample articles imported successfully!
```

---

## Step 7: Start Backend Server

```bash
npm run -w backend dev
```

You should see:
```
🚀 Backend running on http://localhost:3001
📚 API docs: http://localhost:3001/api
```

---

## Step 8: Verify Everything Works

### Test API Endpoints

```bash
# Health check
curl http://localhost:3001/health | jq .

# List articles
curl http://localhost:3001/api/articles | jq .

# Dashboard stats
curl http://localhost:3001/api/admin/dashboard | jq .
```

### Start Dashboard

In a new terminal:

```bash
npm run -w admin-dashboard dev
```

Visit: http://localhost:3000

---

## Supabase Dashboard Features

Once your project is created, explore:

### 1. **SQL Editor**
   - Write and run SQL queries
   - View all tables and data
   - Path: `SQL Editor` in left menu

### 2. **Tables**
   - Browse all created tables
   - View data directly
   - Edit rows (useful for testing)
   - Path: `Database` → `Tables`

### 3. **Authentication** (for Phase 2)
   - Set up user auth
   - Manage sign-ups
   - Path: `Authentication` in left menu

### 4. **Backups**
   - Automatic daily backups
   - Manual backup option
   - Path: `Settings` → `Backups`

### 5. **Logs**
   - Monitor database queries
   - Debug issues
   - Path: `Logs` in left menu

---

## Common Supabase Tasks

### View Your Tables

1. Go to **Database** → **Tables** in Supabase dashboard
2. Click on any table (e.g., `articles`)
3. See all rows and data
4. Edit or delete rows directly

### Run a Query

1. Go to **SQL Editor**
2. Click **New Query**
3. Paste a query:

```sql
SELECT id, title, status, created_at FROM articles ORDER BY created_at DESC LIMIT 5;
```

4. Click **Run**

### Check Database Size

1. Go to **Settings** → **Usage**
2. See storage used, connections, etc.

### Export Data

1. Go to **Database** → **Tables**
2. Select a table
3. Click the menu (⋯) → **Export as CSV**

---

## Troubleshooting

### "Connection refused" error

**Solution:**
- Verify connection string in `.env` has correct password
- Check region matches your project
- Whitelist your IP (Supabase does this automatically)

```bash
cat backend/.env | grep DATABASE_URL
```

### "Role 'postgres' does not exist"

**Solution:**
- Connection string uses default `postgres` user
- If project is new, wait a few minutes for setup to complete
- Try creating a new project

### "Database already has tables"

**Solution:**
- Supabase creates some default tables
- Migration script handles this with `IF NOT EXISTS`
- Should work fine on first run

### Still having issues?

1. Check Supabase status: https://status.supabase.com
2. Clear `.env` and copy connection string again (watch for typos)
3. Try: `psql <your-connection-string>` from terminal
4. Check Supabase logs: **Settings** → **Logs**

---

## Verify Everything is Connected

Run this quick test:

```bash
# 1. Test database connection
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxx.supabase.co:6543/postgres"

# Should show postgres=# prompt
# Type: \dt
# Should list all your tables
# Type: \q to exit
```

---

## Next Steps

1. ✅ Database ready with Supabase
2. ✅ Migrations applied
3. ✅ Sample data imported
4. Next: Build Article Reader component (Phase 2)
5. Next: Implement Elasticsearch search
6. Next: Add user authentication

---

## Supabase vs Local PostgreSQL

| Feature | Supabase | Local |
|---------|----------|-------|
| Setup time | 5 minutes | 30+ minutes |
| Maintenance | None | Manual |
| Backups | Automatic | Manual |
| Scaling | Easy | Hard |
| Cost | Free tier available | Free |
| Reliability | 99.9% SLA | Depends on you |
| Authentication | Built-in | Need to build |
| Real-time | Built-in | Need to build |

---

## Connection String Components

Your Supabase connection string looks like:
```
postgresql://postgres:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

Breaking it down:
- `postgres` = Default user
- `PASSWORD` = Your database password
- `HOST` = Your Supabase host (db.xxxxx.supabase.co)
- `PORT` = 6543 (connection pooling) or 5432 (direct)
- `DATABASE` = postgres (default)
- `schema` = public (default schema)

**Use `6543` for Node.js apps** (connection pooling mode)

---

## Supabase Resources

- **Docs:** https://supabase.com/docs
- **Status:** https://status.supabase.com
- **Community:** https://discord.supabase.com
- **GitHub:** https://github.com/supabase/supabase

---

## Quick Reference

```bash
# Get connection string
# 1. Supabase Dashboard → Settings → Database → Connection pooling

# Update .env
echo "DATABASE_URL=postgresql://..." > backend/.env

# Run migrations
npm run -w backend migrate

# Import samples
npm run -w backend import-samples

# Start backend
npm run -w backend dev

# Start dashboard
npm run -w admin-dashboard dev

# Test API
curl http://localhost:3001/api/articles | jq .
```

---

**You're all set!** Supabase is handling your database, and you can focus on building the infinithoughts platform.

Questions? Check the [Testing Guide](./TESTING_GUIDE.md) or [API Reference](./backend/API_REFERENCE.md).
