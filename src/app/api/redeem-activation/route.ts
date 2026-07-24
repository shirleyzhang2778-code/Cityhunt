import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const code = String(body.code ?? "")
    .trim()
    .toUpperCase();

  if (!code || code.length < 6) {
    return NextResponse.json({ error: "请输入有效激活码" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data: ac, error: acErr } = await service
    .from("activation_codes")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (acErr || !ac) {
    return NextResponse.json({ error: "激活码无效" }, { status: 400 });
  }

  if (ac.expires_at && new Date(ac.expires_at) < new Date()) {
    return NextResponse.json({ error: "激活码已过期" }, { status: 400 });
  }

  if (ac.used_count >= ac.max_uses) {
    return NextResponse.json({ error: "激活码已达使用上限" }, { status: 400 });
  }

  const { data: existing } = await service
    .from("user_book_unlocks")
    .select("book_id")
    .eq("user_id", user.id)
    .eq("book_id", ac.book_id)
    .maybeSingle();

  if (existing) {
    const { data: book } = await service
      .from("books")
      .select("title")
      .eq("id", ac.book_id)
      .single();
    return NextResponse.json({
      book_id: ac.book_id,
      title: book?.title,
      message: "已解锁",
    });
  }

  const { error: unlockErr } = await service.from("user_book_unlocks").insert({
    user_id: user.id,
    book_id: ac.book_id,
    unlocked_via: "activation_code",
    code_used: code,
  });

  if (unlockErr) {
    return NextResponse.json({ error: unlockErr.message }, { status: 500 });
  }

  await service
    .from("activation_codes")
    .update({ used_count: ac.used_count + 1 })
    .eq("code", code);

  const { data: book } = await service
    .from("books")
    .select("title")
    .eq("id", ac.book_id)
    .single();

  return NextResponse.json({
    book_id: ac.book_id,
    title: book?.title,
  });
}
