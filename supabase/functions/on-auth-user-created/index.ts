import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

interface WebhookPayload {
  type: string;
  record: {
    id: string;
    email?: string;
    phone?: string;
  };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

serve(async (req: Request) => {
  // Only process POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload: WebhookPayload = await req.json();

    // Only process user creation events
    if (payload.type !== "USER_SIGNEDUP") {
      return new Response(JSON.stringify({ status: "ignored" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = payload.record.id;
    const email = payload.record.email;
    const phone = payload.record.phone;

    // Create user profile in public.users table
    const { error: profileError } = await supabase.from("users").insert({
      id: userId,
      email,
      phone,
      name: "",
      notifications_enabled: true,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      throw profileError;
    }

    // Create welcome notification
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        notification_type: "system_message",
        title: "Welcome to Infinithoughts",
        content:
          "Welcome to our premium digital magazine. Complete your profile to get personalized recommendations.",
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (notificationError) {
      console.error("Error creating welcome notification:", notificationError);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "User profile created successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in on-auth-user-created:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
