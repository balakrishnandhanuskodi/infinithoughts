-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  issue_number INT NOT NULL,
  month VARCHAR(20),
  year INT NOT NULL,
  cover_image_url TEXT,
  pdf_url TEXT,
  toc TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'READER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content_html TEXT,
  content_json JSONB,
  issue_id UUID REFERENCES issues(id),
  status VARCHAR(50) DEFAULT 'DRAFT',
  reading_time_minutes INT,
  word_count INT,
  page_number INT,
  theme VARCHAR(100),
  featured_image_url TEXT,
  source VARCHAR(50) DEFAULT 'cms',
  xml_file_path TEXT,
  author_id UUID REFERENCES users(id),
  publication_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Create article_status_history table for audit trail
CREATE TABLE IF NOT EXISTS article_status_history (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by_user_id UUID REFERENCES users(id),
  reason TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create article_tags junction table
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create article_comments table
CREATE TABLE IF NOT EXISTS article_comments (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  comment_text TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create xml_import_logs table
CREATE TABLE IF NOT EXISTS xml_import_logs (
  batch_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_files INT NOT NULL,
  successful INT DEFAULT 0,
  failed INT DEFAULT 0,
  errors JSONB,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Create articles_xml_raw table for backup
CREATE TABLE IF NOT EXISTS articles_xml_raw (
  article_id UUID PRIMARY KEY UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
  xml_content TEXT NOT NULL,
  import_batch_id UUID REFERENCES xml_import_logs(batch_id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create flipbook_pages table
CREATE TABLE IF NOT EXISTS flipbook_pages (
  issue_id UUID NOT NULL REFERENCES issues(id),
  page_number INT NOT NULL,
  thumbnail_url TEXT,
  mobile_url TEXT,
  desktop_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(issue_id, page_number)
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_theme ON articles(theme);
CREATE INDEX IF NOT EXISTS idx_articles_issue_id ON articles(issue_id);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_publication_date ON articles(publication_date);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_article_status_history_article_id ON article_status_history(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_flipbook_pages_issue_id ON flipbook_pages(issue_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_id ON audit_log(resource_id);
