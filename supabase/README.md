# Supabase Backend Setup - Infinithoughts v2

This directory contains all Supabase configuration, migrations, and Edge Functions for the Infinithoughts digital magazine platform.

## Project Structure

```
supabase/
├── config.toml              # Supabase project configuration
├── migrations/              # Database schema migrations
│   ├── 001_init_schema.sql     # Core tables and indexes
│   └── 002_rls_policies.sql    # Row Level Security policies
├── functions/               # Supabase Edge Functions
│   ├── on-auth-user-created/   # Triggered on user signup
│   └── send-notifications/     # Notification service
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase CLI installed (`npm install -g supabase`)
- PostgreSQL knowledge (basic)

### 1. Create Supabase Project

```bash
# Login to Supabase
supabase login

# Create new project (or link existing)
supabase projects create --name "infinithoughts-v2"

# Or link to existing project
supabase link --project-ref your-project-ref
```

### 2. Run Migrations

```bash
# Navigate to project root
cd /home/user/infinithoughts

# Apply all migrations
supabase db push

# Or push specific migration
supabase db push --local supabase/migrations/001_init_schema.sql
```

### 3. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy on-auth-user-created
supabase functions deploy send-notifications
```

### 4. Configure Authentication

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Phone (OTP)
3. Enable Google OAuth
4. Enable Apple OAuth
5. Set redirect URLs to your app domain

## Database Schema Overview

### Core Tables

#### Users
- Profile information and preferences
- Reading statistics (streak, total articles, minutes)
- Notification preferences
- Display preferences (theme, font size, line spacing)

#### Articles
- Magazine content with metadata
- Category and author information
- Publishing status and timestamps
- View and engagement counters

#### User Progress
- Tracks reading history for each user-article pair
- Reading time and completion percentage
- Bookmarking and liking status
- Last read position for resuming

#### Challenges
- Reading challenges with targets and rewards
- Can be daily, weekly, monthly, or special event
- Includes badge/reward system

#### User Challenges
- Tracks user participation in challenges
- Completion progress and points earned
- Challenge status (in_progress, completed, abandoned)

#### Favorites
- Bookmarked articles per user
- Quick access to saved reading list

#### Notifications
- User notifications and alerts
- Multiple types: reminders, achievements, digests
- Read/unread tracking

### Indexes

Strategic indexes optimize common queries:
- User lookups by email/phone
- Article filtering by category/author/publish date
- User progress queries
- Notification filtering

### Triggers

Automatic `updated_at` timestamp updates on all main tables.

## Row Level Security (RLS)

All tables have RLS enabled with granular policies:

- **Users**: Can only view/update own profile
- **Articles**: Published articles visible to all, private articles only to authors
- **User Progress**: Only see own reading history
- **Challenges**: Active challenges visible to all
- **User Challenges**: Only see own participation
- **Favorites**: Only see own favorites
- **Notifications**: Only see own notifications

## Edge Functions

### on-auth-user-created
**Trigger**: Supabase Auth "User Signed Up" webhook

**What it does**:
1. Creates user profile in `public.users` table
2. Sends welcome notification
3. Initializes empty reading history

**Environment variables**:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role API key

### send-notifications
**Trigger**: HTTP API endpoint (can be called via cron or manually)

**Endpoints**:
```
POST /functions/v1/send-notifications
Content-Type: application/json
Authorization: Bearer <FUNCTION_SECRET>

{
  "type": "daily_reminder|weekly_digest|challenge_complete|new_article",
  "userId": "uuid (optional)",
  "articleId": "uuid (optional)",
  "challengeId": "uuid (optional)"
}
```

**Types**:
- `daily_reminder`: Sends reminder to all active users
- `weekly_digest`: Sends weekly summary to user
- `challenge_complete`: Notifies user of challenge completion
- `new_article`: Notifies users interested in article category

## API Endpoints (to be implemented in Phase 2)

These endpoints will connect the frontend to Supabase:

### Articles
```
GET /api/articles                    # List articles with filters
GET /api/articles/:id                # Get single article
GET /api/articles/:id/progress       # Get reading progress
POST /api/articles/:id/progress      # Update reading progress
POST /api/articles/:id/like          # Like/unlike article
```

### User
```
GET /api/user/profile                # Get user profile
PUT /api/user/profile                # Update profile
GET /api/user/favorites              # List bookmarks
POST /api/user/favorites             # Add bookmark
DELETE /api/user/favorites/:articleId # Remove bookmark
GET /api/user/stats                  # Get reading statistics
```

### Challenges
```
GET /api/challenges                  # List active challenges
GET /api/challenges/:id              # Get challenge details
POST /api/challenges/:id/join        # Join challenge
GET /api/user/challenges             # Get user's challenges
```

### Notifications
```
GET /api/notifications               # List user notifications
PUT /api/notifications/:id/read      # Mark as read
DELETE /api/notifications/:id        # Delete notification
```

## Environment Variables

Create `.env.local` in v2-app directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing

### Test User Registration Flow
1. Create test user via Supabase Auth dashboard
2. Verify user profile created in `public.users`
3. Check welcome notification in `public.notifications`

### Test Reading Progress
1. Insert article record
2. Insert user_progress record with completion percentage
3. Verify RLS policies allow user to see own progress only

### Test Notifications
1. Call send-notifications endpoint with type "daily_reminder"
2. Verify notifications created for all active users

## Security Considerations

1. **RLS Enabled**: All tables have Row Level Security enabled
2. **Service Role**: Only used in Edge Functions, never exposed to frontend
3. **Anon Key**: Used by frontend, has RLS restrictions
4. **API Keys**: Store securely in environment variables
5. **Functions**: Validate all inputs before database operations

## Performance Optimization

### Indexes
- All frequently queried columns have indexes
- Composite indexes on common filter combinations
- Partial indexes on boolean flags (bookmarked, is_published)

### Caching Strategy
- Use Supabase realtime for live notifications
- Frontend can cache article list (1 hour TTL)
- User progress syncs in real-time

### Query Optimization
- Use `select()` to limit columns
- Filter before fetching (use database filtering)
- Paginate large result sets

## Common Tasks

### Add New Article
```sql
INSERT INTO public.articles (
  title, slug, content, excerpt, category, 
  author_id, featured_image_url, reading_time_minutes,
  is_published, published_at
) VALUES (
  'Article Title', 'article-title', 'Full content...', 
  'Short excerpt', 'Science', 'author-uuid', 
  'https://...jpg', 15, true, NOW()
);
```

### Track Article Read
```sql
INSERT INTO public.user_progress (
  user_id, article_id, read_at, completion_percentage
) VALUES (
  'user-uuid', 'article-uuid', NOW(), 100
) ON CONFLICT (user_id, article_id) DO UPDATE
SET completion_percentage = 100, updated_at = NOW();
```

### Get User's Bookmarks
```sql
SELECT a.* FROM public.articles a
JOIN public.favorites f ON a.id = f.article_id
WHERE f.user_id = 'user-uuid'
ORDER BY f.created_at DESC;
```

## Troubleshooting

### RLS Denying Access
- Check user is authenticated (JWT token valid)
- Verify RLS policy allows the operation
- Check `auth.uid()` matches expected user

### Performance Issues
- Check table sizes with `SELECT pg_size_pretty(pg_total_relation_size('table_name'));`
- Analyze slow queries with EXPLAIN ANALYZE
- Add missing indexes

### Function Errors
- Check function logs in Supabase dashboard
- Verify environment variables set
- Test locally with `supabase functions serve`

## Phase 2: Frontend Integration

Next phase will:
1. Add React Router for navigation
2. Integrate Supabase JS client
3. Implement API endpoints
4. Add offline support with Service Workers
5. Convert to PWA

See analysis document for complete roadmap.
