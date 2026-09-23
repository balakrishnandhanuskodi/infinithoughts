-- Row Level Security (RLS) Policies for Infinithoughts
-- Ensures users can only access their own data

-- ============================================================================
-- USERS TABLE - RLS POLICIES
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can read all public profiles (partial)
CREATE POLICY "Users can view public profile info"
  ON public.users
  FOR SELECT
  USING (TRUE)
  WITH CHECK (FALSE);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- ARTICLES TABLE - RLS POLICIES
-- ============================================================================
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read published articles
CREATE POLICY "Anyone can read published articles"
  ON public.articles
  FOR SELECT
  USING (is_published = TRUE OR auth.uid() = author_id);

-- Authors can create articles
CREATE POLICY "Authors can create articles"
  ON public.articles
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles
CREATE POLICY "Authors can update their own articles"
  ON public.articles
  FOR UPDATE
  USING (auth.uid() = author_id);

-- ============================================================================
-- USER_PROGRESS TABLE - RLS POLICIES
-- ============================================================================
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own progress
CREATE POLICY "Users can view their own reading progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own progress records
CREATE POLICY "Users can create reading progress"
  ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own reading progress"
  ON public.user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CHALLENGES TABLE - RLS POLICIES
-- ============================================================================
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can read active challenges
CREATE POLICY "Anyone can read active challenges"
  ON public.challenges
  FOR SELECT
  USING (is_active = TRUE);

-- ============================================================================
-- USER_CHALLENGES TABLE - RLS POLICIES
-- ============================================================================
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Users can only see their own challenge participation
CREATE POLICY "Users can view their own challenge participation"
  ON public.user_challenges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own challenge participations
CREATE POLICY "Users can join challenges"
  ON public.user_challenges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own challenge progress
CREATE POLICY "Users can update their own challenge progress"
  ON public.user_challenges
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FAVORITES TABLE - RLS POLICIES
-- ============================================================================
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can only see their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can remove their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS TABLE - RLS POLICIES
-- ============================================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- System/functions can create notifications
CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (TRUE);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);
