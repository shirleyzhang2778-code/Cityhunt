import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChapterListClient } from "./ChapterListClient";

export default async function BookChaptersPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase.from("books").select("*").eq("id", bookId).single();

  if (!book) {
    return <p className="p-4 text-muted">词书不存在</p>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!book.is_free && user) {
    const { data: unlock } = await supabase
      .from("user_book_unlocks")
      .select("book_id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle();
    if (!unlock) {
      redirect("/");
    }
  } else if (!book.is_free && !user) {
    redirect("/login");
  }

  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("book_id", bookId)
    .order("sort_order");

  let progressMap: Record<string, number> = {};
  if (user) {
    const { data: prog } = await supabase
      .from("user_chapter_progress")
      .select("chapter_id, mastered_count")
      .eq("user_id", user.id);
    prog?.forEach((p) => {
      progressMap[p.chapter_id] = p.mastered_count;
    });
  }

  return (
    <div className="px-4 pt-4">
      <Link href="/" className="mb-2 inline-block text-sm text-secondary">
        ← 返回
      </Link>
      <h1 className="mb-4 text-xl font-bold text-primary">{book.title}</h1>
      <ChapterListClient chapters={chapters ?? []} serverProgress={progressMap} />
    </div>
  );
}
