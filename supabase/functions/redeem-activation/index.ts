import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { code } = await req.json();
  const normalized = String(code ?? "")
    .trim()
    .toUpperCase();

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: ac } = await admin
    .from("activation_codes")
    .select("*")
    .eq("code", normalized)
    .eq("is_active", true)
    .single();

  if (!ac) {
    return new Response(JSON.stringify({ error: "激活码无效" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (ac.expires_at && new Date(ac.expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: "激活码已过期" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (ac.used_count >= ac.max_uses) {
    return new Response(JSON.stringify({ error: "激活码已达使用上限" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await admin.from("user_book_unlocks").upsert({
    user_id: user.id,
    book_id: ac.book_id,
    unlocked_via: "activation_code",
    code_used: normalized,
  });

  await admin
    .from("activation_codes")
    .update({ used_count: ac.used_count + 1 })
    .eq("code", normalized);

  const { data: book } = await admin
    .from("books")
    .select("title")
    .eq("id", ac.book_id)
    .single();

  return new Response(
    JSON.stringify({ book_id: ac.book_id, title: book?.title }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
