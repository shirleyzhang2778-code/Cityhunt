import { createClient } from "@/lib/supabase/server";
import { HomeClient } from "./HomeClient";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: books }, { data: banners }, { data: config }, { data: chapters }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("books").select("*").order("sort_order"),
      supabase.from("banners").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("app_config").select("*").eq("id", 1).single(),
      supabase.from("chapters").select("id, book_id, word_count"),
    ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unlocks: string[] = [];
  if (user) {
    const { data } = await supabase
      .from("user_book_unlocks")
      .select("book_id")
      .eq("user_id", user.id);
    unlocks = data?.map((u) => u.book_id) ?? [];
  }

  return (
    <HomeClient
      categories={categories ?? []}
      books={books ?? []}
      banners={banners ?? []}
      appConfig={config}
      serverUnlocks={unlocks}
      serverChapters={chapters ?? []}
    />
  );
}
