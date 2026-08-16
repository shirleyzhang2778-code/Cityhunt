import { db, type ReviewEventRow, type WordProgressRow } from "@/lib/db/dexie";

export type DailyActivity = {
  dateKey: string;
  label: string;
  total: number;
  correct: number;
};

export type LearningStats = {
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
  streakDays: number;
  masteredWords: number;
  learningWords: number;
  last7Days: DailyActivity[];
};

export async function recordReviewEvent(
  wordId: string,
  familiar: boolean,
  source: ReviewEventRow["source"]
) {
  if (!db) return;
  await db.review_events.add({ wordId, familiar, source, reviewedAt: Date.now() });
}

export function buildLearningStats(
  events: ReviewEventRow[],
  progress: WordProgressRow[],
  now = Date.now()
): LearningStats {
  const last7Days = createLast7Days(now);
  const dayMap = new Map(last7Days.map((day) => [day.dateKey, day]));

  events.forEach((event) => {
    const day = dayMap.get(toDateKey(event.reviewedAt));
    if (!day) return;
    day.total += 1;
    if (event.familiar) day.correct += 1;
  });

  const totalAnswers = events.length;
  const correctAnswers = events.filter((event) => event.familiar).length;

  return {
    totalAnswers,
    correctAnswers,
    accuracy: totalAnswers === 0 ? 0 : Math.round((correctAnswers / totalAnswers) * 100),
    streakDays: calculateStreak(events, now),
    masteredWords: progress.filter((row) => row.familiar === true).length,
    learningWords: progress.filter((row) => row.familiar === false).length,
    last7Days,
  };
}

function createLast7Days(now: number) {
  const formatter = new Intl.DateTimeFormat("zh-CN", { weekday: "short" });
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return {
      dateKey: toDateKey(date.getTime()),
      label: index === 6 ? "今天" : formatter.format(date),
      total: 0,
      correct: 0,
    };
  });
}

function calculateStreak(events: ReviewEventRow[], now: number) {
  const activeDays = new Set(events.map((event) => toDateKey(event.reviewedAt)));
  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  if (!activeDays.has(toDateKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activeDays.has(toDateKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function toDateKey(timestamp: number) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
