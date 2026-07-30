# infinithoughts
### From Reader to Seeker Movement

A digital magazine platform transforming 3,000+ archived articles into an engaging seeker experience.

**Live at:** [coming soon]

---

## 📋 Project Structure

```
infinithoughts/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── index.ts        # Main entry point
│   │   └── db/
│   │       └── client.ts   # PostgreSQL client
│   ├── package.json
│   └── Dockerfile
├── admin-dashboard/         # React admin UI
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/          # Dashboard pages
│   │   └── components/     # UI components
│   ├── package.json
│   └── Dockerfile
├── content/                 # XML article files
├── db/
│   └── migrations/         # SQL migrations
├── docker-compose.yml      # Local development setup
└── package.json           # Root workspace
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- Git

### Development Setup

1. **Clone and install**
```bash
cd infinithoughts
npm install
```

2. **Start services with Docker Compose**
```bash
docker-compose up
```

This starts:
- **PostgreSQL** (port 5432)
- **Redis** (port 6379)
- **Elasticsearch** (port 9200)
- **Backend API** (port 3001) → http://localhost:3001
- **Admin Dashboard** (port 3000) → http://localhost:3000

3. **Access the admin dashboard**
```
http://localhost:3000
```

### Stopping services
```bash
docker-compose down
```

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Tailwind |
| **Backend** | Node.js/Express + PostgreSQL |
| **Search** | Elasticsearch + OpenAI embeddings |
| **Cache** | Redis |
| **Admin** | Custom WYSIWYG XML editor |
| **Deployment** | Netlify (frontend) + Render (backend) |

### Key Features (Phase 1)

✅ **XML-based content management**
- Direct XML ↔ visual editor (no conversion)
- Git version control for all articles
- 3,000+ article bulk import

✅ **Admin Dashboard**
- WYSIWYG editor for non-technical users
- Article approval workflow (DRAFT → PUBLISHED)
- User roles (Admin, Moderator, Proofer, Approver)
- Real-time collaboration features

✅ **Infrastructure**
- Docker-based local development
- PostgreSQL with full audit logging
- Elasticsearch for search indexing
- Redis caching layer

---

## 📖 Content Format

Articles are stored as **XML** with a structured schema:

```xml
<article id="article-001">
  <metadata>
    <title>Finding Your Life Purpose</title>
    <slug>finding-your-life-purpose</slug>
    <excerpt>Discover proven methods...</excerpt>
    <issue>
      <issue_id>issue-202311</issue_id>
      <issue_number>177</issue_number>
      <month>November</month>
      <year>2019</year>
    </issue>
  </metadata>
  <content>
    <heading level="1">Finding Your Life Purpose</heading>
    <paragraph>...</paragraph>
    <pull_quote>...</pull_quote>
  </content>
</article>
```

**Admin Dashboard:**
- Visual WYSIWYG editor renders XML
- Non-technical users edit visually
- Saves directly as XML to S3/Git
- No HTML → XML conversion needed

---

## 🔄 Workflow

### Content Approval Pipeline

```
1. Admin imports/creates article (XML)
   ↓
2. Moderator reviews for quality
   ↓
3. Proofer checks grammar/spelling
   ↓
4. Approver publishes to live
   ↓
5. Article indexed in Elasticsearch
   ↓
6. Visible in Flipbook & Article Reader
```

### User Roles

| Role | Permission |
|------|-----------|
| **Admin** | Import XML, manage team, override approvals |
| **Moderator** | Edit content, mark ready for proof |
| **Proofer** | Check grammar/spelling, mark proofed |
| **Approver** | Final review and publish to live |

---

## 📁 Database Schema

Key tables:
- `articles` - Article content & metadata
- `issues` - Magazine issues (Nov 2011 - Apr 2020)
- `users` - Admin team members
- `article_status_history` - Audit trail
- `article_comments` - Review feedback
- `xml_import_logs` - Batch import history
- `flipbook_pages` - Preconverted PDF pages

See `db/migrations/001_init_schema.sql` for full schema.

---

## 🛠️ Development

### Backend API

```bash
cd backend
npm install
npm run dev
```

Endpoints (coming in Phase 1):
- `GET /health` - Health check
- `POST /api/articles` - Create article
- `GET /api/articles/:id` - Fetch article
- `POST /api/admin/import-xml` - Bulk import XML

### Admin Dashboard

```bash
cd admin-dashboard
npm install
npm run dev
```

Features (Phase 1):
- Article list with status filtering
- WYSIWYG editor with XML serialization
- Approval workflow UI
- Issue upload manager

### Database

Migrations run automatically on `docker-compose up`:
```bash
# Manual migration
npm run migrate
```

---

## 📦 Phase Breakdown

| Phase | Focus | Duration |
|-------|-------|----------|
| **1** | XML infrastructure + Admin dashboard | Wk 3-4 |
| **2** | Flipbook + Article Reader frontend | Wk 5-7 |
| **3** | Search + AI ranking | Wk 8-9 |
| **4** | Personalization & recommendations | Wk 10-11 |
| **5** | Community layer | Wk 12 |
| **6** | Native mobile apps | Future |

---

## 🌐 Deployment

### Frontend (Netlify)
```bash
# Deploy on push to main
git push origin main
```

### Backend (Render)
- Docker container deployment
- Environment variables via Render dashboard

### Database (Supabase)
- Managed PostgreSQL
- Automatic backups & restore

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/article-editor`
2. Make changes and test locally
3. Commit with clear message: `git commit -m "feat: add XML editor"`
4. Push and create PR on GitHub

---

## 📞 Support

Issues & questions? Open a GitHub issue or contact the team.

---

**infinithoughts**: Turning a magazine into a movement.
