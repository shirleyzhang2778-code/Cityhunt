"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { CheckInPosterButton } from "@/components/share/CheckInPosterButton";
import { createClient } from "@/lib/supabase/client";
import { db } from "@/lib/db/dexie";
import { enqueueSync } from "@/lib/sync/progressQueue";

export default function StudyCompletePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chapterId = params.chapterId as string;
  const bookId = searchParams.get("bookId") ?? "";

  const returnTo = searchParams.get("returnTo") ?? "";

  const [bookTitle, setBookTitle] = useState("词书");
  const [streakDays, setStreakDays] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const duration = 1500;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      if (bookId) {
        const { data: book } = await supabase
          .from("books")
          .select("title")
          .eq("id", bookId)
          .single();
        if (book) setBookTitle(book.title);
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      const userId = session.session.user.id;

      const today = new Date().toISOString().slice(0, 10);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      let newStreak = profile?.streak_days ?? 0;
      if (profile?.last_study_date !== today) {
        newStreak += 1;
        await supabase
          .from("profiles")
          .update({ streak_days: newStreak, last_study_date: today })
          .eq("id", userId);
      }

      setStreakDays(newStreak);
      setDisplayName(profile?.display_name ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);

      if (db) {
        const ch = await db.chapter_progress.get(chapterId);
        const mastered = ch?.masteredCount ?? 0;
        await enqueueSync("chapter_progress", {
          chapter_id: chapterId,
          mastered_count: mastered,
          last_word_index: mastered,
          completed_at: new Date().toISOString(),
        });
      }

      await supabase.from("user_chapter_progress").upsert({
        user_id: userId,
        chapter_id: chapterId,
        mastered_count: (await db?.chapter_progress.get(chapterId))?.masteredCount ?? 0,
        completed_at: new Date().toISOString(),
        last_studied_at: new Date().toISOString(),
      });

      if (session.session.access_token) {
        const { flushSyncQueue } = await import("@/lib/sync/progressQueue");
        await flushSyncQueue(session.session.access_token);
      }
    })();
  }, [chapterId, bookId]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-2 text-2xl font-bold text-primary">本章背诵完成</h1>
      <p className="mb-8 text-secondary">《{bookTitle}》</p>
      <div className="w-full max-w-xs space-y-3">
        <CheckInPosterButton
          displayName={displayName}
          avatarUrl={avatarUrl}
          streakDays={streakDays}
          bookTitle={bookTitle}
        />
        {returnTo === "vocabulary" && (
          <Button asChild variant="outline" className="w-full">
            <Link href="/vocabulary">← 返回生词本</Link>
          </Button>
        )}
        <Button asChild className="w-full">
          <Link href={bookId ? `/books/${bookId}` : "/"}>继续学习</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
