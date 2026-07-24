import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: chapter, error: chErr } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .single();

  if (chErr || !chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", chapter.book_id)
    .single();

  if (book && !book.is_free) {
    const { data: unlock } = await supabase
      .from("user_book_unlocks")
      .select("book_id")
      .eq("user_id", user.id)
      .eq("book_id", book.id)
      .maybeSingle();
    if (!unlock) {
      return NextResponse.json({ error: "Book locked" }, { status: 403 });
    }
  }

  const { data: words, error: wErr } = await supabase
    .from("words")
    .select("*")
    .eq("chapter_id", id)
    .order("sort_order");

  if (wErr) {
    return NextResponse.json({ error: wErr.message }, { status: 500 });
  }

  return NextResponse.json({
    chapter: { ...chapter, book },
    words: words ?? [],
  });
}
