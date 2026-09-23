-- Seed Data for Development
-- This file provides initial test data for development and testing

-- Disable RLS for seeding (will be re-enabled)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SAMPLE USERS
-- ============================================================================
INSERT INTO public.users (id, email, phone, name, avatar_url, interests, reading_streak, total_articles_read, timezone)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@infinithoughts.com', '+1234567890', 'Demo User', NULL, ARRAY['Technology', 'Science', 'Philosophy'], 5, 12, 'America/New_York'),
  ('00000000-0000-0000-0000-000000000002', 'user2@infinithoughts.com', '+9876543210', 'Sarah Chen', NULL, ARRAY['Culture', 'Travel', 'Food'], 3, 8, 'Asia/Shanghai'),
  ('00000000-0000-0000-0000-000000000003', 'user3@infinithoughts.com', '+5555555555', 'James Wilson', NULL, ARRAY['History', 'Politics', 'Environment'], 7, 25, 'Europe/London')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE ARTICLES
-- ============================================================================
INSERT INTO public.articles (id, title, slug, content, excerpt, category, author_id, author_name, featured_image_url, reading_time_minutes, is_published, published_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'The Future of Artificial Intelligence', 'future-of-ai', 'Artificial Intelligence is reshaping our world in unprecedented ways...', 'Exploring how AI will transform industries and society over the next decade.', 'Technology', '00000000-0000-0000-0000-000000000001', 'Demo User', 'https://images.unsplash.com/photo-1677442d019cecf8195a54ca51267ab61?w=800', 8, TRUE, NOW() - INTERVAL '5 days'),
  ('10000000-0000-0000-0000-000000000002', 'Understanding Quantum Physics', 'quantum-physics-101', 'Quantum mechanics is one of the most fascinating fields in modern science...', 'A beginner-friendly introduction to the strange world of quantum phenomena.', 'Science', '00000000-0000-0000-0000-000000000001', 'Demo User', 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', 12, TRUE, NOW() - INTERVAL '3 days'),
  ('10000000-0000-0000-0000-000000000003', 'Philosophy and Modern Life', 'philosophy-modern-life', 'Ancient philosophical concepts remain relevant in our contemporary world...', 'How Stoicism, Zen, and other philosophies can improve your daily life.', 'Philosophy', '00000000-0000-0000-0000-000000000002', 'Sarah Chen', 'https://images.unsplash.com/photo-150784272343-583f20270319?w=800', 10, TRUE, NOW() - INTERVAL '1 day'),
  ('10000000-0000-0000-0000-000000000004', 'Sustainable Travel Guide 2024', 'sustainable-travel-2024', 'Traveling responsibly while exploring the world is both possible and rewarding...', 'Tips for reducing your carbon footprint while enjoying incredible destinations.', 'Travel', '00000000-0000-0000-0000-000000000002', 'Sarah Chen', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', 9, TRUE, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE CHALLENGES
-- ============================================================================
INSERT INTO public.challenges (id, title, description, challenge_type, target_days, target_articles, target_minutes, reward_points, reward_badge_name, start_date, end_date, is_active)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Read Every Day Challenge', 'Read at least one article every day for a week', 'daily_read', 7, NULL, NULL, 50, 'daily_reader', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', TRUE),
  ('20000000-0000-0000-0000-000000000002', 'Weekly Knowledge Goal', 'Read 5 articles and spend 60 minutes reading this week', 'weekly_goal', NULL, 5, 60, 100, 'knowledge_seeker', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', TRUE),
  ('20000000-0000-0000-0000-000000000003', 'Month of Learning', 'Complete 20 articles and reach 300 minutes of reading', 'monthly_goal', NULL, 20, 300, 500, 'scholar', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', TRUE),
  ('20000000-0000-0000-0000-000000000004', 'Science Month Special', 'Read all science articles published this month', 'special_event', NULL, 10, NULL, 200, 'science_fan', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE USER PROGRESS (Reading history)
-- ============================================================================
INSERT INTO public.user_progress (user_id, article_id, read_at, completion_percentage, reading_time_seconds, is_bookmarked, is_liked)
VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days', 100, 480, FALSE, TRUE),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day', 75, 720, TRUE, FALSE),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', NOW() - INTERVAL '6 hours', 100, 600, FALSE, TRUE),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', NOW(), 50, 300, TRUE, FALSE),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '4 days', 100, 540, TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days', 100, 780, FALSE, TRUE),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 days', 100, 660, TRUE, TRUE)
ON CONFLICT (user_id, article_id) DO NOTHING;

-- ============================================================================
-- SAMPLE USER CHALLENGES (Challenge participation)
-- ============================================================================
INSERT INTO public.user_challenges (user_id, challenge_id, completed_days, status, progress_percentage, points_earned, started_at, completed_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', ARRAY[1, 2, 3, 4, 5], 'in_progress', 71, 30, NOW() - INTERVAL '5 days', NULL),
  ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', ARRAY[1, 1, 1, 1, 1], 'completed', 100, 100, NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', ARRAY[1, 2, 3], 'in_progress', 43, 18, NOW() - INTERVAL '3 days', NULL),
  ('00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', ARRAY[1, 1, 1, 1, 1], 'completed', 100, 100, NOW() - INTERVAL '7 days', NOW()),
  ('00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'in_progress', 50, 250, NOW() - INTERVAL '15 days', NULL)
ON CONFLICT (user_id, challenge_id) DO NOTHING;

-- ============================================================================
-- SAMPLE FAVORITES (Bookmarks)
-- ============================================================================
INSERT INTO public.favorites (user_id, article_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003')
ON CONFLICT (user_id, article_id) DO NOTHING;

-- ============================================================================
-- SAMPLE NOTIFICATIONS
-- ============================================================================
INSERT INTO public.notifications (user_id, notification_type, title, content, related_article_id, is_read)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'daily_reminder', 'Time to Read', 'Don''t break your reading streak! Open the app to continue.', NULL, FALSE),
  ('00000000-0000-0000-0000-000000000001', 'challenge_progress', 'Challenge Progress', 'You''re 71% complete on the "Read Every Day Challenge"!', NULL, TRUE),
  ('00000000-0000-0000-0000-000000000002', 'new_article', 'New Article Published', 'Check out "Sustainable Travel Guide 2024" in your favorite category!', '10000000-0000-0000-0000-000000000004', FALSE),
  ('00000000-0000-0000-0000-000000000003', 'challenge_complete', 'Challenge Completed! 🎉', 'Congratulations! You''ve completed the "Weekly Knowledge Goal"!', NULL, TRUE),
  ('00000000-0000-0000-0000-000000000003', 'achievement_unlocked', 'Achievement Unlocked', 'You''ve completed 7 consecutive days of reading!', NULL, FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RE-ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
