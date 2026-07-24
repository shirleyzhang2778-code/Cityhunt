"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Chapter } from "@/lib/types";
import { db } from "@/lib/db/dexie";

type Props = {
  chapters: Chapter[];
  serverProgress: Record<string, number>;
};

export function ChapterListClient({ chapters, serverProgress }: Props) {
  const [progress, setProgress] = useState(serverProgress);

  useEffect(() => {
    (async () => {
      if (!db) return;
      const map = { ...serverProgress };
      const rows = await db.chapter_progress.toArray();
      rows.forEach((r) => {
        const existing = map[r.chapterId] ?? 0;
        map[r.chapterId] = Math.max(existing, r.masteredCount);
      });
      setProgress(map);
    })();
  }, [serverProgress]);

  return (
    <ul className="divide-y divide-border rounded-card border border-border bg-card">
      {chapters.map((ch) => (
        <li key={ch.id}>
          <Link
            href={`/study/${ch.id}`}
            className="flex items-center justify-between px-4 py-4"
          >
            <span className="text-base text-primary">{ch.title}</span>
            <span className="text-sm text-muted">
              {progress[ch.id] ?? 0}/{ch.word_count}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
