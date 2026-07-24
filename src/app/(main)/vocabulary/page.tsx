"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BurmeseText } from "@/components/burmese/BurmeseText";
import { db } from "@/lib/db/dexie";
import { createClient } from "@/lib/supabase/client";
import type { Word } from "@/lib/types";
import { Trash2 } from "lucide-react";

export default function VocabularyPage() {
  const [items, setItems] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const words: Word[] = [];

    if (db) {
      const local = await db.vocabulary.toArray();
      for (const v of local) {
        if (v.word) {
          words.push(v.word);
        }
      }
    }

    if (words.length === 0) {
      try {
        const supabase = createClient();
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          const { data: vocab } = await supabase
            .from("user_vocabulary")
            .select("word_id")
            .eq("user_id", session.session.user.id);
          if (vocab?.length) {
            const ids = vocab.map((v) => v.word_id);
            const { data: ws } = await supabase.from("words").select("*").in("id", ids);
            if (ws) words.push(...(ws as Word[]));
          }
        }
      } catch {
        // user_vocabulary 表可能不存在，忽略错误
      }
    }

    setItems(words);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function removeWord(wordId: string) {
    if (db) {
      await db.vocabulary.delete(wordId);
    }
    setItems((prev) => prev.filter((w) => w.id !== wordId));

    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        await supabase
          .from("user_vocabulary")
          .delete()
          .eq("user_id", session.session.user.id)
          .eq("word_id", wordId);
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <h1 className="mb-4 text-xl font-bold text-primary">生词本</h1>
        <p className="text-center text-muted">加载中…</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-20">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">生词本</h1>
        {items.length > 0 && (
          <Link
            href="/study/vocabulary"
            className="rounded-button bg-primary px-4 py-1.5 text-sm text-white"
          >
            背诵生词
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-primary">还没有收藏生词</p>
          <p className="mt-2 text-sm text-muted">
            在背词时点击 ★ 星标即可收藏单词
          </p>
          <Link
            href="/"
            className="mt-6 rounded-button bg-primary px-6 py-2 text-sm text-white"
          >
            去背词
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((w) => (
            <li
              key={w.id}
              className="flex items-start justify-between gap-3 rounded-card border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <Link
                href={`/study/${w.chapter_id}?wordIndex=${w.sort_order - 1}&returnTo=vocabulary`}
                className="min-w-0 flex-1 p-4"
              >
                <BurmeseText className="text-lg font-semibold text-primary">
                  {w.word_mm}
                </BurmeseText>
                {w.phonetic && (
                  <p className="mt-0.5 text-sm text-muted">{w.phonetic}</p>
                )}
                <p className="mt-1 text-primary">{w.word_zh}</p>
                {w.notes && (
                  <p className="mt-1 text-xs text-muted line-clamp-1">{w.notes}</p>
                )}
              </Link>
              <button
                type="button"
                onClick={() => removeWord(w.id)}
                className="shrink-0 p-4 text-muted hover:text-danger"
                aria-label="取消收藏"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
