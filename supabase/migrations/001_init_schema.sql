-- Initialize Infinithoughts v2 Database Schema
-- This migration creates all core tables for the digital magazine app

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  reading_streak INT DEFAULT 0,
  total_articles_read INT DEFAULT 0,
  total_reading_minutes INT DEFAULT 0,
  theme_preference VARCHAR(20) DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  font_size INT DEFAULT 16 CHECK (font_size >= 12 AND font_size <= 24),
  line_spacing VARCHAR(20) DEFAULT 'normal' CHECK (line_spacing IN ('compact', 'normal', 'comfortable', 'relaxed')),
  timezone VARCHAR(50) DEFAULT 'UTC',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ARTICLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  category VARCHAR(100),
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  featured_image_url TEXT,
  thumbnail_url TEXT,
  reading_time_minutes INT,
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER_PROGRESS TABLE - Track reading history and progress
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE,
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  reading_time_seconds INT DEFAULT 0,
  last_position INT DEFAULT 0,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  is_liked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- ============================================================================
-- CHALLENGES TABLE - Reading challenges and daily goals
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50) NOT NULL CHECK (challenge_type IN ('daily_read', 'weekly_goal', 'monthly_goal', 'special_event')),
  target_days INT,
  target_articles INT,
  target_minutes INT,
  reward_points INT DEFAULT 0,
  reward_badge_name VARCHAR(255),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER_CHALLENGES TABLE - Track user participation in challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  completed_days INT[] DEFAULT ARRAY[]::INT[],
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  progress_percentage INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- ============================================================================
-- FAVORITES TABLE - User bookmarked/saved articles
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- ============================================================================
-- NOTIFICATIONS TABLE - User notifications and alerts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL CHECK (notification_type IN (
    'daily_reminder', 'challenge_progress', 'new_article', 'challenge_complete',
    'weekly_digest', 'achievement_unlocked', 'system_message'
  )),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  related_article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  related_challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES - Performance optimization
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_article_id ON public.user_progress(article_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_is_bookmarked ON public.user_progress(is_bookmarked);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON public.user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================================
-- TRIGGERS - Automatic timestamp updates
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to articles table
DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_progress table
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to challenges table
DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_challenges table
DROP TRIGGER IF EXISTS update_user_challenges_updated_at ON public.user_challenges;
CREATE TRIGGER update_user_challenges_updated_at
  BEFORE UPDATE ON public.user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS - Common queries
-- ============================================================================
CREATE OR REPLACE VIEW public.user_stats AS
SELECT
  u.id,
  u.name,
  u.total_articles_read,
  u.total_reading_minutes,
  COUNT(DISTINCT uc.challenge_id) AS active_challenges,
  COUNT(DISTINCT f.article_id) AS bookmarked_articles,
  (SELECT COUNT(*) FROM public.notifications WHERE user_id = u.id AND is_read = FALSE) AS unread_notifications
FROM public.users u
LEFT JOIN public.user_challenges uc ON u.id = uc.user_id AND uc.status = 'in_progress'
LEFT JOIN public.favorites f ON u.id = f.user_id
GROUP BY u.id, u.name, u.total_articles_read, u.total_reading_minutes;

-- ============================================================================
-- COMMENTS - Documentation
-- ============================================================================
COMMENT ON TABLE public.users IS 'User profiles and preferences for the magazine app';
COMMENT ON TABLE public.articles IS 'Magazine articles with metadata and statistics';
COMMENT ON TABLE public.user_progress IS 'Track reading progress and engagement for each article';
COMMENT ON TABLE public.challenges IS 'Reading challenges to encourage user engagement';
COMMENT ON TABLE public.user_challenges IS 'User participation in challenges';
COMMENT ON TABLE public.favorites IS 'User bookmarked articles';
COMMENT ON TABLE public.notifications IS 'Push and in-app notifications for users';
