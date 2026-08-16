"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, Star, Volume2 } from "lucide-react";
import type { ChapterBundle, Word } from "@/lib/types";
import { BurmeseText } from "@/components/burmese/BurmeseText";
import { Button } from "@/components/ui/button";
import { audioManager } from "@/lib/audio/AudioManager";
import { isEmptyField, cn } from "@/lib/utils";
import { db } from "@/lib/db/dexie";
import { createClient } from "@/lib/supabase/client";
import { enqueueSync } from "@/lib/sync/progressQueue";
import { createNextReviewProgress } from "@/lib/review";
import { recordReviewEvent } from "@/lib/stats";

type CardSide = "front" | "back";

type Props = {
  bundle: ChapterBundle;
  initialIndex?: number;
  returnTo?: string;
  completeHref?: string;
  isReviewSession?: boolean;
};

export function FlashcardEngine({
  bundle,
  initialIndex = 0,
  returnTo,
  completeHref,
  isReviewSession = false,
}: Props) {
  const router = useRouter();
  const words = [...bundle.words].sort((a, b) => a.sort_order - b.sort_order);
  const [index, setIndex] = useState(initialIndex);
  const [side, setSide] = useState<CardSide>("front");
  const [starred, setStarred] = useState<Set<string>>(new Set());

  const current = words[index];

  const playAudio = useCallback((word: Word) => {
    if (word.audio_url) {
      audioManager.play(word.audio_url);
    }
  }, []);

  useEffect(() => {
    return () => {
      audioManager.stop();
    };
  }, []);

  useEffect(() => {
    if (side === "front" && current) {
      playAudio(current);
    }
  }, [index, side, current, playAudio]);

  useEffect(() => {
    async function loadStars() {
      if (!db) return;
      const all = await db.vocabulary.toArray();
      setStarred(new Set(all.map((v) => v.wordId)));
    }
    loadStars();
  }, []);

  const masteredRef = useRef<Set<string>>(new Set());

  const saveChapterProgress = useCallback(
    async (masteredCount: number) => {
      const bookId = bundle.chapter.book_id;
      const chapterId = bundle.chapter.id;

      // 1. Save per-chapter progress (for resume)
      const chapterKey = `progress_ch_${chapterId}`;
      const chapterData = {
        masteredCount,
        lastWordIndex: index,
        bookId,
        updatedAt: Date.now(),
      };
      try {
        localStorage.setItem(chapterKey, JSON.stringify(chapterData));
      } catch {}

      // 2. Aggregate and save per-book progress (for home page progress bar)
      //    Sum mastered across all chapters of this book
      let bookMastered = 0;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.startsWith("progress_ch_")) {
            const raw = localStorage.getItem(k);
            if (raw) {
              const d = JSON.parse(raw);
              if (d.bookId === bookId) {
                bookMastered += d.masteredCount ?? 0;
              }
            }
          }
        }
      } catch {}
      // Update the chapter we just saved (already counted above)
      // bookMastered already includes the new count since we just wrote it

      const bookKey = `progress_book_${bookId}`;
      try {
        localStorage.setItem(bookKey, JSON.stringify({ masteredCount: bookMastered, updatedAt: Date.now() }));
        console.log("[进度保存] ✅", bookId, "已掌握:", bookMastered);
      } catch {}

      // 3. IndexedDB (best effort)
      if (db) {
        try {
          await db.chapter_progress.put({
            chapterId,
            masteredCount,
            lastWordIndex: index,
          });
        } catch {}
      }
    },
    [bundle.chapter.id, bundle.chapter.book_id, index]
  );

  const persistProgress = useCallback(
    async (word: Word, familiar: boolean) => {
      const status = familiar ? "mastered" : "learning";

      if (familiar) {
        masteredRef.current.add(word.id);
      } else {
        masteredRef.current.delete(word.id);
      }

      if (db) {
        try {
          const previous = await db.word_progress.get(word.id);
          const now = Date.now();
          await db.word_progress.put({
            wordId: word.id,
            status,
            familiar,
            updatedAt: now,
            word,
            chapterId: word.chapter_id,
            ...createNextReviewProgress(previous, familiar, now),
          });
        } catch {
          // IndexedDB failed, continue
        }
      }

      try {
        await recordReviewEvent(word.id, familiar, isReviewSession ? "review" : "study");
      } catch {
        // stats must never block learning
      }

      const masteredCount = masteredRef.current.size;
      if (!isReviewSession) {
        await saveChapterProgress(masteredCount);
      }

      try {
        const supabase = createClient();
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          await enqueueSync("word_progress", {
            word_id: word.id,
            status,
            familiar,
          });
          if (!isReviewSession) {
            await enqueueSync("chapter_progress", {
              chapter_id: bundle.chapter.id,
              mastered_count: masteredCount,
              last_word_index: index,
            });
          }
        }
      } catch {
        // sync queue failed
      }
    },
    [bundle.chapter.id, index, isReviewSession, saveChapterProgress]
  );

  const nextWord = useCallback(() => {
    audioManager.stop();
    if (index >= words.length - 1) {
      if (completeHref) {
        router.push(completeHref);
        return;
      }
      const returnParam = returnTo ? `&returnTo=${returnTo}` : "";
      router.push(`/study/${bundle.chapter.id}/complete?bookId=${bundle.chapter.book_id}${returnParam}`);
      return;
    }
    setIndex((i) => i + 1);
    setSide("front");
  }, [index, words.length, bundle.chapter.id, bundle.chapter.book_id, completeHref, returnTo, router]);

  const goBack = useCallback(() => {
    audioManager.stop();
    if (index <= 0) return;
    setIndex((i) => i - 1);
    setSide("front");
  }, [index]);

  async function onRecognized() {
    if (!current) return;
    setSide("back");
    await persistProgress(current, true);
  }

  async function onUnrecognized() {
    if (!current) return;
    setSide("back");
    await persistProgress(current, false);
  }

  async function toggleStar() {
    if (!current) return;

    const isCurrentlyStarred = starred.has(current.id);

    if (isCurrentlyStarred) {
      if (db) {
        await db.vocabulary.delete(current.id);
      }
      setStarred((s) => {
        const n = new Set(s);
        n.delete(current.id);
        return n;
      });
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        try {
          await supabase
            .from("user_vocabulary")
            .delete()
            .eq("user_id", session.session.user.id)
            .eq("word_id", current.id);
        } catch (e) {
          console.error("取消收藏同步失败:", e);
        }
      }
    } else {
      if (db) {
        await db.vocabulary.put({ wordId: current.id, starredAt: Date.now(), word: current });
      }
      setStarred((s) => new Set(s).add(current.id));
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        try {
          await supabase.from("user_vocabulary").upsert({
            user_id: session.session.user.id,
            word_id: current.id,
          });
          await enqueueSync("vocabulary", { word_id: current.id, action: "add" });
        } catch (e) {
          console.error("收藏同步失败:", e);
        }
      }
    }
  }

  if (!current) {
    return <p className="text-center text-muted">本章暂无单词</p>;
  }

  const isStarred = starred.has(current.id);

  return (
    <div className="mx-5 flex min-h-[60vh] flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${current.id}-${side}`}
          initial={{ opacity: 0, rotateY: side === "back" ? -90 : 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col rounded-card border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-4 flex justify-between">
            {side === "back" ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 text-sm text-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                返回
              </button>
            ) : (
              <div />
            )}
            <button type="button" onClick={toggleStar} aria-label="收藏">
              <Star
                className={cn(
                  "h-6 w-6",
                  isStarred ? "fill-star text-star" : "text-muted"
                )}
              />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <BurmeseText as="h1" className="text-3xl font-bold text-primary">
              {current.word_mm}
            </BurmeseText>
            {current.phonetic && (
              <p className="mt-2 text-secondary">{current.phonetic}</p>
            )}
            {side === "front" && (
              <button
                type="button"
                className="mt-4 text-secondary transition-transform active:scale-95"
                onClick={() => playAudio(current)}
                aria-label="发音"
              >
                <Volume2 className="h-6 w-6" />
              </button>
            )}
          </div>

          {side === "back" && (
            <div className="mt-4 space-y-3 border-t border-border pt-4 text-left">
              <p className="text-lg text-primary">{current.word_zh}</p>
              {!isEmptyField(current.notes) && (
                <p className="text-sm leading-relaxed text-secondary">{current.notes}</p>
              )}
              {!isEmptyField(current.example_sentence_mm) && (
                <div>
                  <BurmeseText className="font-semibold text-primary">
                    {current.example_sentence_mm}
                  </BurmeseText>
                  {!isEmptyField(current.example_sentence_zh) && (
                    <p className="mt-1 text-sm text-secondary">
                      {current.example_sentence_zh}
                    </p>
                  )}
                </div>
              )}
              {!isEmptyField(current.image_url) && current.image_url && (
                <div className="relative mx-auto h-[140px] max-w-full">
                  <Image
                    src={current.image_url}
                    alt=""
                    fill
                    className="rounded-button object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            {side === "front" ? (
              <div className="flex justify-between gap-4">
                <Button
                  variant="danger"
                  className="w-[45%]"
                  onClick={onUnrecognized}
                >
                  不认识
                </Button>
                <Button
                  variant="success"
                  className="w-[45%]"
                  onClick={onRecognized}
                >
                  认识
                </Button>
              </div>
            ) : (
              <Button className="mx-auto w-[90%]" onClick={nextWord}>
                下一个
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="mt-4 text-center text-sm text-muted">
        {index + 1} / {words.length}
      </p>
    </div>
  );
}
