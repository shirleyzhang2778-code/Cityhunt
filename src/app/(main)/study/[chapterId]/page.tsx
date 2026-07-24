"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useChapterCache } from "@/hooks/useChapterCache";
import { FlashcardEngine } from "@/components/flashcard/FlashcardEngine";
import { db } from "@/lib/db/dexie";

export default function StudyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chapterId = params.chapterId as string;
  const { bundle, loading, offlineBlocked, load } = useChapterCache(chapterId);

  const initialIndex = useMemo(() => {
    const idx = parseInt(searchParams.get("wordIndex") || "0", 10);
    return Number.isFinite(idx) && idx >= 0 ? idx : 0;
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!bundle || !db) return;
    (async () => {
      const p = await db.chapter_progress.get(chapterId);
      /* resume index could be passed to FlashcardEngine via initialIndex */
    })();
  }, [bundle, chapterId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        加载本章…
      </div>
    );
  }

  if (offlineBlocked) {
    return (
      <div className="p-6 text-center">
        <p className="text-primary">需联网加载本章</p>
        <p className="mt-2 text-sm text-muted">请连接网络后重试</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          返回首页
        </Link>
      </div>
    );
  }

  if (!bundle) {
    return <p className="p-4 text-center text-muted">无法加载章节</p>;
  }

  return (
    <div className="pt-4">
      <Link
        href={`/books/${bundle.chapter.book_id}`}
        className="mb-4 ml-5 inline-block text-sm text-secondary"
      >
        ← 章节列表
      </Link>
      <FlashcardEngine
        bundle={bundle}
        initialIndex={initialIndex}
        returnTo={searchParams.get("returnTo") ?? undefined}
      />
    </div>
  );
}
