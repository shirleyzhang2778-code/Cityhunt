import { createClient } from "../supabase/client";
import { db } from "../db/dexie";

export async function restoreUserData(): Promise<void> {
  if (!db) return;
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  const userId = session.user.id;

  const [unlocks, chapterProg, vocab] = await Promise.all([
    supabase.from("user_book_unlocks").select("book_id, unlocked_at").eq("user_id", userId),
    supabase.from("user_chapter_progress").select("*").eq("user_id", userId),
    supabase.from("user_vocabulary").select("word_id, starred_at").eq("user_id", userId),
  ]);

  if (unlocks.data) {
    for (const u of unlocks.data) {
      await db.book_unlocks.put({
        bookId: u.book_id,
        unlockedAt: new Date(u.unlocked_at).getTime(),
      });
    }
  }

  if (chapterProg.data) {
    for (const p of chapterProg.data) {
      const local = await db.chapter_progress.get(p.chapter_id);
      const remoteTime = p.last_studied_at
        ? new Date(p.last_studied_at).getTime()
        : 0;
      const localTime = local ? 0 : 0;
      if (!local || remoteTime >= localTime) {
        await db.chapter_progress.put({
          chapterId: p.chapter_id,
          masteredCount: p.mastered_count,
          lastWordIndex: p.last_word_index,
        });
      }
    }
  }

  if (vocab.data) {
    for (const v of vocab.data) {
      await db.vocabulary.put({
        wordId: v.word_id,
        starredAt: new Date(v.starred_at).getTime(),
      });
    }
  }
}
