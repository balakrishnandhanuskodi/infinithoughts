// Supabase Database Types
// Auto-generated type definitions for all tables

export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  interests: string[];
  reading_streak: number;
  total_articles_read: number;
  total_reading_minutes: number;
  theme_preference: "light" | "dark" | "auto";
  font_size: number;
  line_spacing: "compact" | "normal" | "comfortable" | "relaxed";
  timezone: string;
  notifications_enabled: boolean;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  excerpt: string | null;
  category: string | null;
  author_id: string | null;
  author_name: string | null;
  featured_image_url: string | null;
  thumbnail_url: string | null;
  reading_time_minutes: number | null;
  view_count: number;
  like_count: number;
  published_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  article_id: string;
  read_at: string | null;
  completion_percentage: number;
  reading_time_seconds: number;
  last_position: number;
  is_bookmarked: boolean;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: "daily_read" | "weekly_goal" | "monthly_goal" | "special_event";
  target_days: number | null;
  target_articles: number | null;
  target_minutes: number | null;
  reward_points: number;
  reward_badge_name: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  completed_days: number[];
  status: "in_progress" | "completed" | "abandoned";
  progress_percentage: number;
  points_earned: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type:
    | "daily_reminder"
    | "challenge_progress"
    | "new_article"
    | "challenge_complete"
    | "weekly_digest"
    | "achievement_unlocked"
    | "system_message";
  title: string;
  content: string | null;
  related_article_id: string | null;
  related_challenge_id: string | null;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

export interface UserStats {
  id: string;
  name: string | null;
  total_articles_read: number;
  total_reading_minutes: number;
  active_challenges: number;
  bookmarked_articles: number;
  unread_notifications: number;
}

// Database Response Types
export interface Tables {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Article, "id" | "created_at">>;
      };
      user_progress: {
        Row: UserProgress;
        Insert: Omit<UserProgress, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserProgress, "id" | "created_at">>;
      };
      challenges: {
        Row: Challenge;
        Insert: Omit<Challenge, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Challenge, "id" | "created_at">>;
      };
      user_challenges: {
        Row: UserChallenge;
        Insert: Omit<UserChallenge, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserChallenge, "id" | "created_at">>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at">;
        Update: never;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "created_at">>;
      };
    };
    Views: {
      user_stats: {
        Row: UserStats;
        Insert: never;
        Update: never;
      };
    };
    Functions: {
      update_updated_at_column: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
  };
}
