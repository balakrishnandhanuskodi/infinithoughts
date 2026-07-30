-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_number INT UNIQUE NOT NULL,
  month VARCHAR(20) NOT NULL,
  year INT NOT NULL,
  cover_image_url VARCHAR(1000),
  pdf_url VARCHAR(1000),
  toc TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(month, year),
  INDEX (year, month)
);

-- Users table (for admin team)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('admin', 'moderator', 'proofer', 'approver')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX (email),
  INDEX (role)
);

-- Articles table (supports both XML and future CMS)
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt VARCHAR(1000),
  content_html TEXT NOT NULL,
  content_json JSONB,

  author_id UUID REFERENCES users(id),
  issue_id UUID REFERENCES issues(id) NOT NULL,

  source VARCHAR(50) CHECK (source IN ('xml', 'cms')) DEFAULT 'xml',
  xml_file_path VARCHAR(500),

  status VARCHAR(50) CHECK (status IN ('DRAFT', 'IN_MODERATION', 'READY_FOR_PROOF', 'IN_PROOF', 'PROOFED', 'IN_APPROVAL', 'PUBLISHED', 'REJECTED')) DEFAULT 'DRAFT',
  current_reviewer_id UUID REFERENCES users(id),

  reading_time_minutes INT,
  word_count INT,
  page_number INT,
  theme VARCHAR(100),
  featured_image_url VARCHAR(1000),

  created_date TIMESTAMP,
  publication_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,

  INDEX (slug),
  INDEX (status, current_reviewer_id),
  INDEX (issue_id, published_at),
  FULLTEXT (title, excerpt)
);

-- Article status history (audit trail)
CREATE TABLE IF NOT EXISTS article_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by_user_id UUID REFERENCES users(id),
  reason_or_comment TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX (article_id, changed_at)
);

-- Article comments (for review feedback)
CREATE TABLE IF NOT EXISTS article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES users(id) NOT NULL,
  comment_text TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX (article_id, created_at)
);

-- Article tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Article-tag relationships
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,

  PRIMARY KEY (article_id, tag_id)
);

-- XML import logs
CREATE TABLE IF NOT EXISTS xml_import_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id VARCHAR(255) UNIQUE NOT NULL,
  imported_by_user_id UUID REFERENCES users(id),
  total_files INT,
  successful INT,
  failed INT,
  errors JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  INDEX (imported_by_user_id, completed_at)
);

-- Raw XML backup
CREATE TABLE IF NOT EXISTS articles_xml_raw (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
  xml_content TEXT NOT NULL,
  xml_file_path VARCHAR(500),
  parsed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  import_batch_id VARCHAR(255),

  INDEX (article_id)
);

-- Flipbook pages metadata
CREATE TABLE IF NOT EXISTS flipbook_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  page_number INT NOT NULL,
  s3_url_thumbnail VARCHAR(500),
  s3_url_mobile VARCHAR(500),
  s3_url_desktop VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (issue_id, page_number),
  INDEX (issue_id, page_number)
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX (user_id, timestamp),
  INDEX (resource_type, resource_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_issue_id ON articles(issue_id);
CREATE INDEX idx_articles_publication_date ON articles(publication_date);
CREATE INDEX idx_issues_year_month ON issues(year, month);
