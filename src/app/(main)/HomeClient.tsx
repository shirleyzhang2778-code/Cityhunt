"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppConfig, Banner, Book, Category, Chapter } from "@/lib/types";
import { BookCard } from "@/components/books/BookCard";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { TodayReviewCard } from "@/components/home/TodayReviewCard";
import { db } from "@/lib/db/dexie";
import { createClient } from "@/lib/supabase/client";
import { getDailyReviewGoal, getReviewSummary } from "@/lib/review";

type Props = {
  categories: Category[];
  books: Book[];
  banners: Banner[];
  appConfig: AppConfig | null;
  serverUnlocks: string[];
  serverChapters: Pick<Chapter, "id" | "book_id" | "word_count">[];
};

export function HomeClient({
  categories,
  books,
  banners,
  appConfig,
  serverUnlocks,
  serverChapters,
}: Props) {
  const [unlocks, setUnlocks] = useState<Set<string>>(new Set(serverUnlocks));
  const [chapterProgress, setChapterProgress] = useState<
    Record<string, { mastered_count: number }>
  >({});
  const [, setTick] = useState(0);
  const [reviewSummary, setReviewSummary] = useState({
    due: 0,
    weak: 0,
    completedToday: 0,
    goal: 10,
  });

  const loadReviewSummary = useCallback(async () => {
    const goal = getDailyReviewGoal();
    if (!db) {
      setReviewSummary((current) => ({ ...current, goal }));
      return;
    }
    try {
      const rows = await db.word_progress.toArray();
      setReviewSummary({ ...getReviewSummary(rows), goal });
    } catch {
      setReviewSummary((current) => ({ ...current, goal }));
    }
  }, []);

  const refreshUnlocks = useCallback(async () => {
    const set = new Set(serverUnlocks);
    if (db) {
      const local = await db.book_unlocks.toArray();
      local.forEach((u) => set.add(u.bookId));
    }
    setUnlocks(set);
    setTick((t) => t + 1);
  }, [serverUnlocks]);

  useEffect(() => {
    refreshUnlocks();
  }, [refreshUnlocks]);

  const loadProgress = useCallback(async () => {
    const map: Record<string, { mastered_count: number }> = {};

    // 1. Read from localStorage (most reliable, even if IndexedDB is blocked)
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("progress_")) {
          const chapterId = key.slice("progress_".length);
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (!map[chapterId] || data.updatedAt > (map[chapterId] as any)._ts) {
              map[chapterId] = { mastered_count: data.masteredCount ?? 0, _ts: data.updatedAt ?? 0 } as any;
            }
          }
        }
      }
    } catch {
      // localStorage disabled
    }

    // 2. Read from IndexedDB (may override localStorage with newer data)
    if (db) {
      try {
        const rows = await db.chapter_progress.toArray();
        rows.forEach((r) => {
          map[r.chapterId] = { mastered_count: r.masteredCount };
        });
      } catch {
        // IndexedDB failed
      }
    }

    // Clean up _ts field
    for (const key of Object.keys(map)) {
      const val = map[key] as any;
      if ("_ts" in val) {
        map[key] = { mastered_count: val.mastered_count };
      }
    }

    // 3. Read from Supabase (remote source of truth)
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        const { data } = await supabase
          .from("user_chapter_progress")
          .select("chapter_id, mastered_count")
          .eq("user_id", session.session.user.id);
        data?.forEach((p) => {
          if (!map[p.chapter_id] || (p as any).mastered_count > (map[p.chapter_id]?.mastered_count ?? 0)) {
            map[p.chapter_id] = { mastered_count: p.mastered_count };
          }
        });
      }
    } catch {
      // table may not exist
    }
    console.log("[进度读取] 合并结果:", map);
    setChapterProgress(map);
  }, []);

  useEffect(() => {
    loadProgress();
    loadReviewSummary();
  }, [loadProgress, loadReviewSummary]);

  // reload progress when navigating back (visibility change)
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        loadProgress();
        loadReviewSummary();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadProgress, loadReviewSummary]);

  const booksByCategory = useMemo(() => {
    const m = new Map<string, Book[]>();
    for (const b of books) {
      const list = m.get(b.category_id) ?? [];
      list.push(b);
      m.set(b.category_id, list);
    }
    return m;
  }, [books]);

  return (
    <div className="px-4 pt-4">
      <h1 className="mb-4 text-xl font-bold text-primary">词书</h1>
      <BannerCarousel
        banners={banners}
        isReviewMode={appConfig?.is_review_mode ?? false}
      />
      <TodayReviewCard {...reviewSummary} />
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-primary">暂无词书数据</p>
          <p className="mt-2 text-sm text-muted">
            数据库还没有内容，请在 Supabase SQL Editor 中运行种子数据脚本
          </p>
        </div>
      )}
      {categories.map((cat) => {
        const catBooks = booksByCategory.get(cat.id) ?? [];
        if (catBooks.length === 0) return null;
        return (
          <section key={cat.id} className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-primary">{cat.title}</h2>
            <div className="space-y-8">
              {catBooks.map((book) => (
                <BookCardWrapper
                  key={book.id}
                  book={book}
                  unlocked={book.is_free || unlocks.has(book.id)}
                  authorQrUrl={appConfig?.author_wechat_qr_url ?? null}
                  onUnlockChange={refreshUnlocks}
                  chapterProgress={chapterProgress}
                  serverChapters={serverChapters}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function BookCardWrapper({
  book,
  unlocked,
  authorQrUrl,
  onUnlockChange,
  chapterProgress,
  serverChapters,
}: {
  book: Book;
  unlocked: boolean;
  authorQrUrl: string | null;
  onUnlockChange: () => void;
  chapterProgress: Record<string, { mastered_count: number }>;
  serverChapters: Pick<Chapter, "id" | "book_id" | "word_count">[];
}) {
  const [progress, setProgress] = useState(() => {
    // Read book-level progress from localStorage on mount (sync, no network)
    try {
      const raw = localStorage.getItem(`progress_book_${book.id}`);
      if (raw) {
        const data = JSON.parse(raw);
        const mastered = data.masteredCount ?? 0;
        const total = book.word_count || 1;
        return Math.min(1, mastered / total);
      }
    } catch {}
    return 0;
  });

  // Refresh progress when chapterProgress changes or on visibility change
  const refresh = useCallback(() => {
    let mastered = 0;
    // Sum from localStorage progress_book_* key
    try {
      const raw = localStorage.getItem(`progress_book_${book.id}`);
      if (raw) {
        const data = JSON.parse(raw);
        mastered = data.masteredCount ?? 0;
      }
    } catch {}
    // Also check chapterProgress from IndexedDB/Supabase as supplement
    const chapterMastered = serverChapters
      .filter((chapter) => chapter.book_id === book.id)
      .reduce(
        (sum, chapter) => sum + (chapterProgress[chapter.id]?.mastered_count ?? 0),
        0
      );
    mastered = Math.max(mastered, chapterMastered);
    const total = book.word_count || 1;
    setProgress(Math.min(1, mastered / total));
  }, [book.id, book.word_count, chapterProgress, serverChapters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Reload on page visibility (user returns from study)
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  return (
    <BookCard
      book={book}
      unlocked={unlocked}
      progress={progress}
      authorQrUrl={authorQrUrl}
      onUnlockChange={onUnlockChange}
    />
  );
}
