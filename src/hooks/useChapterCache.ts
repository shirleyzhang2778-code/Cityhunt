"use client";

import { useCallback, useState } from "react";
import { db } from "@/lib/db/dexie";
import type { ChapterBundle } from "@/lib/types";

export function useChapterCache(chapterId: string) {
  const [bundle, setBundle] = useState<ChapterBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineBlocked, setOfflineBlocked] = useState(false);

  const load = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    setOfflineBlocked(false);

    const cached = await db.chapter_bundles.get(chapterId);
    if (cached) {
      setBundle(cached.payload);
      setLoading(false);
      if (navigator.onLine) {
        fetch(`/api/chapters/${chapterId}/bundle`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data: ChapterBundle | null) => {
            if (data) {
              db.chapter_bundles.put({
                chapterId,
                payload: data,
                cachedAt: Date.now(),
              });
              setBundle(data);
            }
          })
          .catch(() => {});
      }
      return;
    }

    if (!navigator.onLine) {
      setOfflineBlocked(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/chapters/${chapterId}/bundle`);
      if (!res.ok) throw new Error("fetch failed");
      const data: ChapterBundle = await res.json();
      await db.chapter_bundles.put({
        chapterId,
        payload: data,
        cachedAt: Date.now(),
      });
      setBundle(data);
    } catch {
      setOfflineBlocked(true);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  return { bundle, loading, offlineBlocked, load };
}
