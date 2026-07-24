"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlashcardEngine } from "@/components/flashcard/FlashcardEngine";
import { db } from "@/lib/db/dexie";
import type { ChapterBundle, Word } from "@/lib/types";

export default function VocabularyStudyPage() {
  const [bundle, setBundle] = useState<ChapterBundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const words: Word[] = [];
      if (db) {
        const local = await db.vocabulary.toArray();
        for (const v of local) {
          if (v.word) words.push(v.word);
        }
      }
      setBundle({
        chapter: {
          id: "vocabulary",
          book_id: "vocabulary",
          title: "生词本",
          sort_order: 0,
          word_count: words.length,
        },
        words,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        加载中…
      </div>
    );
  }

  if (!bundle || bundle.words.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-primary">没有可背诵的生词</p>
        <Link href="/vocabulary" className="mt-4 text-sm text-primary underline">
          ← 返回生词本
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <Link href="/vocabulary" className="mb-4 ml-5 inline-block text-sm text-secondary">
        ← 返回生词本
      </Link>
      <FlashcardEngine
        bundle={bundle}
        completeHref="/vocabulary"
      />
    </div>
  );
}
