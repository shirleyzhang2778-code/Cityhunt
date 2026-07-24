import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const chapters: Array<{
    chapter_id: string;
    mastered_count?: number;
    last_word_index?: number;
    completed_at?: string;
  }> = body.chapters ?? [];
  const words: Array<{
    word_id: string;
    status?: string;
    familiar?: boolean;
  }> = body.words ?? [];
  const vocabulary: Array<{ word_id: string; action?: string }> = body.vocabulary ?? [];

  for (const ch of chapters) {
    if (!ch.chapter_id) continue;
    await supabase.from("user_chapter_progress").upsert({
      user_id: user.id,
      chapter_id: ch.chapter_id,
      mastered_count: ch.mastered_count ?? 0,
      last_word_index: ch.last_word_index ?? 0,
      completed_at: ch.completed_at ?? null,
      last_studied_at: new Date().toISOString(),
    });
  }

  for (const w of words) {
    if (!w.word_id) continue;
    await supabase.from("user_word_progress").upsert({
      user_id: user.id,
      word_id: w.word_id,
      status: w.status ?? "learning",
      familiar: w.familiar,
      updated_at: new Date().toISOString(),
    });
  }

  for (const v of vocabulary) {
    if (!v.word_id) continue;
    if (v.action === "remove") {
      await supabase
        .from("user_vocabulary")
        .delete()
        .eq("user_id", user.id)
        .eq("word_id", v.word_id);
    } else {
      await supabase.from("user_vocabulary").upsert({
        user_id: user.id,
        word_id: v.word_id,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
