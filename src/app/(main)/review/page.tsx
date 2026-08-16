"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FlashcardEngine } from "@/components/flashcard/FlashcardEngine";
import { Button } from "@/components/ui/button";
import { db, type WordProgressRow } from "@/lib/db/dexie";
import { getEffectiveDueAt, isWeakWord } from "@/lib/review";
import type { ChapterBundle, Word } from "@/lib/types";

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const [bundle, setBundle] = useState<ChapterBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const weakMode = searchParams.get("mode") === "weak";

  useEffect(() => {
    async function loadReviewWords() {
      if (!db) return;
      const [rows, cachedBundles] = await Promise.all([
        db.word_progress.toArray(),
        db.chapter_bundles.toArray(),
      ]);
      const wordMap = new Map<string, Word>();
      cachedBundles.forEach((entry) => entry.payload.words.forEach((word) => wordMap.set(word.id, word)));

      const now = Date.now();
      const selected = rows
        .filter((row) => (weakMode ? isWeakWord(row) : getEffectiveDueAt(row) <= now))
        .sort((a, b) => score(a, now) - score(b, now))
        .map((row) => row.word ?? wordMap.get(row.wordId))
        .filter((word): word is Word => Boolean(word))
        .slice(0, 30)
        .map((word, index) => ({ ...word, sort_order: index }));

      if (selected.length > 0) {
        setBundle({
          chapter: {
            id: "daily-review",
            book_id: "review",
            title: weakMode ? "薄弱词巩固" : "今日复习",
            sort_order: 0,
            word_count: selected.length,
          },
          words: selected,
        });
      }
      setLoading(false);
    }
    loadReviewWords().catch(() => setLoading(false));
  }, [weakMode]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-muted">正在准备复习…</div>;

  if (!bundle) {
    return (
      <div className="px-5 pt-16 text-center">
        <div className="rounded-card border border-border bg-card p-8 shadow-sm">
          <h1 className="text-xl font-bold text-primary">{weakMode ? "暂无薄弱词" : "今日复习已完成"}</h1>
          <p className="mt-2 text-sm text-muted">继续学习新词后，这里会自动安排复习。</p>
          <Button asChild className="mt-6"><Link href="/">返回词书</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <Link href="/" className="mb-4 ml-5 inline-block text-sm text-secondary">← 返回首页</Link>
      <h1 className="mb-4 px-5 text-lg font-semibold text-primary">{bundle.chapter.title}</h1>
      <FlashcardEngine bundle={bundle} completeHref="/" isReviewSession />
    </div>
  );
}

function score(row: WordProgressRow, now: number) {
  return getEffectiveDueAt(row) - now - (isWeakWord(row) ? 24 * 60 * 60 * 1000 : 0);
}
