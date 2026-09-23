import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

interface NotificationRequest {
  type:
    | "daily_reminder"
    | "weekly_digest"
    | "challenge_complete"
    | "new_article";
  userId?: string;
  articleId?: string;
  challengeId?: string;
  title?: string;
  content?: string;
}

serve(async (req: Request) => {
  // Verify request method
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body: NotificationRequest = await req.json();

    if (!body.type) {
      return new Response(JSON.stringify({ error: "Missing notification type" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Handle different notification types
    switch (body.type) {
      case "daily_reminder":
        return await sendDailyReminders();

      case "weekly_digest":
        if (!body.userId) {
          return new Response(
            JSON.stringify({ error: "Missing userId for weekly_digest" }),
            { headers: { "Content-Type": "application/json" }, status: 400 }
          );
        }
        return await sendWeeklyDigest(body.userId);

      case "challenge_complete":
        if (!body.userId || !body.challengeId) {
          return new Response(
            JSON.stringify({
              error: "Missing userId or challengeId for challenge_complete",
            }),
            { headers: { "Content-Type": "application/json" }, status: 400 }
          );
        }
        return await sendChallengeCompletion(body.userId, body.challengeId);

      case "new_article":
        if (!body.articleId) {
          return new Response(
            JSON.stringify({ error: "Missing articleId for new_article" }),
            { headers: { "Content-Type": "application/json" }, status: 400 }
          );
        }
        return await notifyNewArticle(body.articleId);

      default:
        return new Response(
          JSON.stringify({ error: "Unknown notification type" }),
          { headers: { "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in send-notifications:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function sendDailyReminders() {
  try {
    // Get all users with notifications enabled
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name")
      .eq("notifications_enabled", true);

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ status: "success", notificationsCount: 0 }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create notifications for each user
    const notifications = users.map((user) => ({
      user_id: user.id,
      notification_type: "daily_reminder",
      title: "Time to read",
      content: "Don't break your reading streak! Open the app to continue.",
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        status: "success",
        notificationsCount: users.length,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    throw error;
  }
}

async function sendWeeklyDigest(userId: string) {
  try {
    // Get user's reading stats for the week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: weeklyStats, error: statsError } = await supabase
      .from("user_progress")
      .select("id")
      .eq("user_id", userId)
      .gte(
        "created_at",
        weekAgo.toISOString()
      );

    if (statsError) throw statsError;

    const articlesRead = weeklyStats?.length || 0;

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        notification_type: "weekly_digest",
        title: "Your Weekly Reading Summary",
        content: `You read ${articlesRead} articles this week. Keep up the great reading streak!`,
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (notificationError) throw notificationError;

    return new Response(
      JSON.stringify({ status: "success", articlesRead }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    throw error;
  }
}

async function sendChallengeCompletion(userId: string, challengeId: string) {
  try {
    const { data: challenge, error: challengeError } = await supabase
      .from("challenges")
      .select("title")
      .eq("id", challengeId)
      .single();

    if (challengeError) throw challengeError;

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        notification_type: "challenge_complete",
        related_challenge_id: challengeId,
        title: "Challenge Completed! 🎉",
        content: `Congratulations! You've completed the "${challenge.title}" challenge.`,
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (notificationError) throw notificationError;

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Challenge completion notification sent",
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    throw error;
  }
}

async function notifyNewArticle(articleId: string) {
  try {
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("title, category")
      .eq("id", articleId)
      .single();

    if (articleError) throw articleError;

    // Get all users interested in this category
    const { data: interestedUsers, error: usersError } = await supabase
      .from("users")
      .select("id")
      .contains("interests", [article.category]);

    if (usersError) throw usersError;

    if (!interestedUsers || interestedUsers.length === 0) {
      return new Response(
        JSON.stringify({ status: "success", notificationsCount: 0 }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create notifications for interested users
    const notifications = interestedUsers.map((user) => ({
      user_id: user.id,
      notification_type: "new_article",
      related_article_id: articleId,
      title: `New article in ${article.category}`,
      content: article.title,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        status: "success",
        notificationsCount: interestedUsers.length,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    throw error;
  }
}
