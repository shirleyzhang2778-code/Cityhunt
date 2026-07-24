import type { Chapter } from "./types";

export function bookProgress(
  chapters: Pick<Chapter, "id" | "word_count">[],
  progress: Record<string, { mastered_count: number }>
): number {
  const mastered = chapters.reduce(
    (sum, ch) => sum + (progress[ch.id]?.mastered_count ?? 0),
    0
  );
  const total = chapters.reduce((sum, ch) => sum + ch.word_count, 0);
  return total === 0 ? 0 : mastered / total;
}
