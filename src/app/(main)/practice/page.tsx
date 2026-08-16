"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Headphones, RotateCcw, Volume2, X } from "lucide-react";
import { BurmeseText } from "@/components/burmese/BurmeseText";
import { Button } from "@/components/ui/button";
import { audioManager } from "@/lib/audio/AudioManager";
import { db } from "@/lib/db/dexie";
import { createNextReviewProgress } from "@/lib/review";
import { recordReviewEvent } from "@/lib/stats";
import type { Word } from "@/lib/types";
import { cn } from "@/lib/utils";

type Question = { word: Word; options: string[] };

export default function PracticePage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "audio" ? "audio" : "meaning";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const loadQuestions = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    const [bundles, vocabulary] = await Promise.all([
      db.chapter_bundles.toArray(),
      db.vocabulary.toArray(),
    ]);
    const words = new Map<string, Word>();
    bundles.forEach((bundle) => bundle.payload.words.forEach((word) => words.set(word.id, word)));
    vocabulary.forEach((row) => row.word && words.set(row.word.id, row.word));
    const pool = shuffle([...words.values()].filter((word) => mode === "meaning" || Boolean(word.audio_url)));
    const optionPool = [...new Set([...words.values()].map((word) => word.word_zh).filter(Boolean))];
    const nextQuestions = pool.slice(0, 10).map((word) => ({
      word,
      options: shuffle([
        word.word_zh,
        ...shuffle(optionPool.filter((meaning) => meaning !== word.word_zh)).slice(0, 3),
      ]),
    })).filter((question) => question.options.length >= 4);
    setQuestions(nextQuestions);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setLoading(false);
  }, [mode]);

  useEffect(() => {
    loadQuestions();
    return () => audioManager.stop();
  }, [loadQuestions]);

  const current = questions[index];
  const title = mode === "audio" ? "听音选义" : "看词选义";
  const correct = selected === current?.word.word_zh;

  const playCurrent = useCallback(() => {
    if (current?.word.audio_url) audioManager.play(current.word.audio_url);
  }, [current]);

  useEffect(() => {
    if (mode === "audio" && current) playCurrent();
  }, [current, mode, playCurrent]);

  async function choose(option: string) {
    if (!current || selected) return;
    setSelected(option);
    const isCorrect = option === current.word.word_zh;
    if (isCorrect) setScore((value) => value + 1);
    if (db) {
      const previous = await db.word_progress.get(current.word.id);
      const now = Date.now();
      await db.word_progress.put({
        wordId: current.word.id,
        status: isCorrect ? "mastered" : "learning",
        familiar: isCorrect,
        updatedAt: now,
        word: current.word,
        chapterId: current.word.chapter_id,
        ...createNextReviewProgress(previous, isCorrect, now),
      });
      await recordReviewEvent(current.word.id, isCorrect, mode);
    }
  }

  function next() {
    if (index >= questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  }

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-muted">正在准备题目…</div>;

  if (questions.length === 0) {
    return (
      <div className="px-5 pt-16 text-center">
        <div className="rounded-card border border-border bg-card p-8 shadow-sm">
          <h1 className="text-xl font-bold text-primary">练习词汇还不够</h1>
          <p className="mt-2 text-sm text-muted">请先学习并缓存至少四个不同释义的单词。</p>
          <Button asChild className="mt-6"><Link href="/">返回词书</Link></Button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="px-5 pt-16 text-center">
        <div className="rounded-card border border-border bg-card p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-primary"><Check className="h-7 w-7" /></div>
          <h1 className="mt-4 text-xl font-bold text-primary">练习完成</h1>
          <p className="mt-2 text-secondary">答对 {score} / {questions.length}</p>
          <div className="mt-6 space-y-3">
            <Button className="w-full" onClick={loadQuestions}><RotateCcw className="mr-2 h-4 w-4" />再练一次</Button>
            <Button asChild variant="outline" className="w-full"><Link href="/">返回首页</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-secondary">← 返回首页</Link>
        <span className="text-sm text-muted">{index + 1} / {questions.length}</span>
      </div>
      <h1 className="mb-4 text-lg font-semibold text-primary">{title}</h1>
      <div className="rounded-card border border-border bg-card p-6 shadow-sm">
        <div className="flex min-h-44 flex-col items-center justify-center text-center">
          {mode === "audio" ? (
            <button type="button" onClick={playCurrent} className="flex h-20 w-20 items-center justify-center rounded-full bg-canvas text-primary active:scale-95" aria-label="播放发音">
              <Headphones className="h-9 w-9" />
            </button>
          ) : (
            <>
              <BurmeseText as="h2" className="text-3xl font-bold text-primary">{current.word.word_mm}</BurmeseText>
              {current.word.phonetic && <p className="mt-2 text-secondary">{current.word.phonetic}</p>}
              {current.word.audio_url && <button type="button" onClick={playCurrent} className="mt-4 text-secondary"><Volume2 className="h-6 w-6" /></button>}
            </>
          )}
        </div>

        <div className="mt-5 grid gap-3">
          {current.options.map((option) => {
            const isAnswer = option === current.word.word_zh;
            const isSelected = option === selected;
            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                className={cn(
                  "flex min-h-12 items-center justify-between rounded-button border px-4 text-left text-sm",
                  !selected && "border-border bg-card text-primary",
                  selected && isAnswer && "border-success bg-success/10 text-primary",
                  selected && isSelected && !isAnswer && "border-danger bg-danger/10 text-primary",
                  selected && !isAnswer && !isSelected && "border-border text-muted"
                )}
              >
                <span>{option}</span>
                {selected && isAnswer && <Check className="h-5 w-5 text-success" />}
                {selected && isSelected && !isAnswer && <X className="h-5 w-5 text-danger" />}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-5">
            <p className={cn("mb-3 text-center text-sm font-medium", correct ? "text-success" : "text-danger")}>
              {correct ? "回答正确" : `正确答案：${current.word.word_zh}`}
            </p>
            <Button className="w-full" onClick={next}>{index === questions.length - 1 ? "查看结果" : "下一题"}</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}
