# Infinithoughts v2 - Supabase API Guide

Complete reference for backend API endpoints and Supabase database operations.

## Table of Contents
1. [Authentication](#authentication)
2. [Articles API](#articles-api)
3. [User API](#user-api)
4. [Challenges API](#challenges-api)
5. [Notifications API](#notifications-api)
6. [Favorites API](#favorites-api)
7. [Error Handling](#error-handling)

---

## Authentication

All API requests require authentication via Supabase Auth JWT token.

### Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Session Management
- Access tokens expire in 1 hour
- Refresh tokens valid for 7 days
- Store tokens securely in localStorage (web) or keychain (mobile)

---

## Articles API

### Get All Articles

**Endpoint**: `GET /api/articles`

**Query Parameters**:
- `category` (string, optional): Filter by category
- `search` (string, optional): Search in title/excerpt
- `skip` (number, optional): Pagination offset (default: 0)
- `limit` (number, optional): Results per page (default: 20, max: 100)
- `sortBy` (string, optional): Sort field (published_at, view_count, like_count)
- `sortOrder` (string, optional): 'asc' or 'desc' (default: desc)

**Example**:
```bash
GET /api/articles?category=Technology&limit=20&sortBy=published_at&sortOrder=desc
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Article Title",
      "slug": "article-slug",
      "excerpt": "Short description...",
      "category": "Technology",
      "author_name": "Author Name",
      "featured_image_url": "https://...",
      "reading_time_minutes": 8,
      "view_count": 150,
      "like_count": 32,
      "published_at": "2024-09-20T10:00:00Z"
    }
  ],
  "total": 245,
  "skip": 0,
  "limit": 20
}
```

### Get Single Article

**Endpoint**: `GET /api/articles/{id}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Article Title",
    "slug": "article-slug",
    "content": "Full article content here...",
    "excerpt": "Short description",
    "category": "Technology",
    "author_id": "author-uuid",
    "author_name": "Author Name",
    "featured_image_url": "https://...",
    "reading_time_minutes": 8,
    "view_count": 150,
    "like_count": 32,
    "published_at": "2024-09-20T10:00:00Z",
    "is_published": true,
    "created_at": "2024-09-20T10:00:00Z",
    "updated_at": "2024-09-20T10:00:00Z",
    "user_progress": {
      "completion_percentage": 75,
      "is_bookmarked": true,
      "is_liked": false,
      "last_position": 1250
    }
  }
}
```

### Create Article (Authors only)

**Endpoint**: `POST /api/articles`

**Request Body**:
```json
{
  "title": "New Article",
  "content": "Full article content...",
  "excerpt": "Short description",
  "category": "Technology",
  "featured_image_url": "https://...",
  "reading_time_minutes": 8,
  "is_published": false
}
```

**Response**: Returns created article with ID and timestamps.

### Update Reading Progress

**Endpoint**: `POST /api/articles/{id}/progress`

**Request Body**:
```json
{
  "completion_percentage": 75,
  "reading_time_seconds": 480,
  "last_position": 1250,
  "is_bookmarked": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "progress-uuid",
    "user_id": "user-uuid",
    "article_id": "article-uuid",
    "completion_percentage": 75,
    "reading_time_seconds": 480,
    "last_position": 1250,
    "is_bookmarked": true,
    "read_at": "2024-09-20T10:30:00Z",
    "updated_at": "2024-09-20T10:30:00Z"
  }
}
```

### Like/Unlike Article

**Endpoint**: `POST /api/articles/{id}/like`

**Request Body**:
```json
{
  "is_liked": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "is_liked": true,
    "article_like_count": 33
  }
}
```

---

## User API

### Get User Profile

**Endpoint**: `GET /api/user/profile`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "phone": "+1234567890",
    "name": "User Name",
    "avatar_url": "https://...",
    "bio": "User bio",
    "interests": ["Technology", "Science"],
    "reading_streak": 5,
    "total_articles_read": 25,
    "total_reading_minutes": 180,
    "theme_preference": "light",
    "font_size": 16,
    "line_spacing": "normal",
    "timezone": "America/New_York",
    "notifications_enabled": true,
    "marketing_consent": false,
    "created_at": "2024-01-15T00:00:00Z",
    "updated_at": "2024-09-20T10:00:00Z"
  }
}
```

### Update User Profile

**Endpoint**: `PUT /api/user/profile`

**Request Body**:
```json
{
  "name": "Updated Name",
  "bio": "New bio",
  "interests": ["Technology", "Science", "Philosophy"],
  "theme_preference": "dark",
  "font_size": 18,
  "line_spacing": "comfortable",
  "timezone": "America/Los_Angeles",
  "notifications_enabled": true,
  "marketing_consent": false
}
```

**Response**: Returns updated user profile.

### Upload Avatar

**Endpoint**: `POST /api/user/avatar`

**Request**: Multipart form with file field
```
Content-Type: multipart/form-data
file: <image file>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "avatar_url": "https://supabase.../user-avatar-uuid.jpg"
  }
}
```

### Get User Statistics

**Endpoint**: `GET /api/user/stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "total_articles_read": 25,
    "total_reading_minutes": 180,
    "active_challenges": 3,
    "bookmarked_articles": 8,
    "reading_streak": 5,
    "this_week_articles": 7,
    "this_week_minutes": 120,
    "monthly_progress": {
      "articles_target": 20,
      "articles_read": 15,
      "minutes_target": 300,
      "minutes_spent": 180
    }
  }
}
```

---

## Challenges API

### Get All Challenges

**Endpoint**: `GET /api/challenges`

**Query Parameters**:
- `status` (string, optional): 'active', 'completed', 'archived'
- `type` (string, optional): 'daily_read', 'weekly_goal', 'monthly_goal', 'special_event'

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "challenge-uuid",
      "title": "Read Every Day Challenge",
      "description": "Read at least one article every day for a week",
      "challenge_type": "daily_read",
      "target_days": 7,
      "target_articles": null,
      "target_minutes": null,
      "reward_points": 50,
      "reward_badge_name": "daily_reader",
      "start_date": "2024-09-23",
      "end_date": "2024-09-30",
      "is_active": true,
      "user_status": "in_progress",
      "user_progress": 71,
      "user_points": 30
    }
  ]
}
```

### Get Challenge Details

**Endpoint**: `GET /api/challenges/{id}`

**Response**: Single challenge object with additional stats.

### Join Challenge

**Endpoint**: `POST /api/challenges/{id}/join`

**Response**:
```json
{
  "success": true,
  "data": {
    "user_challenge_id": "uuid",
    "status": "in_progress",
    "started_at": "2024-09-20T10:00:00Z"
  }
}
```

### Get User's Challenges

**Endpoint**: `GET /api/user/challenges`

**Query Parameters**:
- `status` (string, optional): Filter by status

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "challenge-uuid",
      "title": "Weekly Knowledge Goal",
      "challenge_type": "weekly_goal",
      "status": "in_progress",
      "progress_percentage": 80,
      "points_earned": 80,
      "completed_days": [1, 2, 3, 4],
      "start_date": "2024-09-16",
      "end_date": "2024-09-23"
    }
  ]
}
```

### Update Challenge Progress

**Endpoint**: `PUT /api/user/challenges/{id}`

**Request Body**:
```json
{
  "completed_days": [1, 2, 3, 4, 5],
  "status": "in_progress"
}
```

**Response**: Returns updated challenge progress.

---

## Favorites API

### Get Bookmarked Articles

**Endpoint**: `GET /api/user/favorites`

**Query Parameters**:
- `skip` (number, optional): Pagination offset
- `limit` (number, optional): Results per page

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "favorite-uuid",
      "article": {
        "id": "article-uuid",
        "title": "Article Title",
        "excerpt": "...",
        "category": "Technology",
        "featured_image_url": "https://..."
      },
      "created_at": "2024-09-15T00:00:00Z"
    }
  ],
  "total": 8
}
```

### Add to Favorites

**Endpoint**: `POST /api/user/favorites`

**Request Body**:
```json
{
  "article_id": "article-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "favorite-uuid",
    "article_id": "article-uuid",
    "created_at": "2024-09-20T10:00:00Z"
  }
}
```

### Remove from Favorites

**Endpoint**: `DELETE /api/user/favorites/{article_id}`

**Response**:
```json
{
  "success": true,
  "message": "Article removed from favorites"
}
```

---

## Notifications API

### Get Notifications

**Endpoint**: `GET /api/notifications`

**Query Parameters**:
- `unread_only` (boolean, optional): Only unread notifications
- `type` (string, optional): Filter by type
- `skip` (number, optional): Pagination offset
- `limit` (number, optional): Results per page (default: 30)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "notification-uuid",
      "notification_type": "daily_reminder",
      "title": "Time to Read",
      "content": "Don't break your reading streak!",
      "is_read": false,
      "related_article_id": null,
      "related_challenge_id": null,
      "created_at": "2024-09-20T09:00:00Z"
    }
  ],
  "total": 15,
  "unread_count": 3
}
```

### Mark Notification as Read

**Endpoint**: `PUT /api/notifications/{id}/read`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "notification-uuid",
    "is_read": true,
    "read_at": "2024-09-20T10:00:00Z"
  }
}
```

### Mark All as Read

**Endpoint**: `PUT /api/notifications/read-all`

**Response**:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Delete Notification

**Endpoint**: `DELETE /api/notifications/{id}`

**Response**:
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": ["error message"]
    }
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks permission for this resource |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Resource already exists (e.g., duplicate favorite) |
| `INTERNAL_ERROR` | 500 | Server error |

### Example Error Responses

**Validation Error (400)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid parameters",
    "details": {
      "limit": ["must be between 1 and 100"]
    }
  }
}
```

**Unauthorized (401)**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authentication token"
  }
}
```

**Not Found (404)**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Article not found"
  }
}
```

---

## Rate Limiting

API requests are rate limited per user:
- 100 requests per minute for read operations
- 30 requests per minute for write operations
- 10 file upload requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1695239460
```

---

## Pagination

For endpoints returning lists, use `skip` and `limit` parameters:

```
GET /api/articles?skip=20&limit=20
```

Response includes pagination info:
```json
{
  "data": [...],
  "total": 245,
  "skip": 20,
  "limit": 20,
  "has_more": true
}
```

---

## Filtering & Sorting

### Articles Filtering
- By category: `?category=Technology`
- By search: `?search=quantum`
- Combine filters: `?category=Technology&search=AI&sortBy=published_at`

### Sorting
- Default: `-published_at` (newest first)
- Available fields: `published_at`, `view_count`, `like_count`, `created_at`
- Order: append `&sortOrder=asc` for ascending (default: desc)

---

## Real-Time Subscriptions

Using Supabase Realtime (WebSocket):

```javascript
const subscription = supabase
  .from('notifications')
  .on('INSERT', payload => {
    console.log('New notification:', payload.new)
  })
  .subscribe()
```

Supported tables:
- `notifications` - User notifications
- `user_progress` - Reading progress updates
- `articles` - New articles (published)

---

## Implementation Checklist

Phase 2 implementation tasks:
- [ ] Setup API middleware (auth, validation, error handling)
- [ ] Implement articles endpoints
- [ ] Implement user endpoints
- [ ] Implement challenges endpoints
- [ ] Implement favorites endpoints
- [ ] Implement notifications endpoints
- [ ] Setup rate limiting
- [ ] Add request logging
- [ ] Setup API documentation (Swagger/OpenAPI)
- [ ] Write API tests
- [ ] Deploy to production

---

## Next Steps

See `supabase/README.md` for database setup and migration instructions.
See Phase 2 roadmap for API implementation timeline.
