import type { WordProgressRow } from "@/lib/db/dexie";

export const DAILY_REVIEW_GOAL_KEY = "daily_review_goal";
export const DEFAULT_DAILY_REVIEW_GOAL = 10;

const DAY = 24 * 60 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export function getDailyReviewGoal() {
  if (typeof window === "undefined") return DEFAULT_DAILY_REVIEW_GOAL;
  const value = Number(localStorage.getItem(DAILY_REVIEW_GOAL_KEY));
  return [10, 20, 30].includes(value) ? value : DEFAULT_DAILY_REVIEW_GOAL;
}

export function getEffectiveDueAt(row: WordProgressRow) {
  if (typeof row.dueAt === "number") return row.dueAt;
  return row.familiar === false ? row.updatedAt : row.updatedAt + DAY;
}

export function isWeakWord(row: WordProgressRow) {
  return row.familiar === false || (row.lapseCount ?? 0) > 0;
}

export function createNextReviewProgress(
  previous: WordProgressRow | undefined,
  familiar: boolean,
  now = Date.now()
): Pick<
  WordProgressRow,
  "reviewCount" | "lapseCount" | "intervalDays" | "dueAt" | "lastReviewedAt"
> {
  const reviewCount = (previous?.reviewCount ?? 0) + 1;
  const lapseCount = (previous?.lapseCount ?? 0) + (familiar ? 0 : 1);

  if (!familiar) {
    return {
      reviewCount,
      lapseCount,
      intervalDays: 0,
      dueAt: now + TEN_MINUTES,
      lastReviewedAt: now,
    };
  }

  const priorInterval = previous?.intervalDays ?? 0;
  const intervalDays =
    priorInterval <= 0 ? 1 : priorInterval === 1 ? 3 : Math.min(60, Math.max(7, priorInterval * 2));

  return {
    reviewCount,
    lapseCount,
    intervalDays,
    dueAt: now + intervalDays * DAY,
    lastReviewedAt: now,
  };
}

export function getReviewSummary(rows: WordProgressRow[], now = Date.now()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  return {
    due: rows.filter((row) => getEffectiveDueAt(row) <= now).length,
    weak: rows.filter(isWeakWord).length,
    completedToday: rows.filter(
      (row) => (row.lastReviewedAt ?? row.updatedAt) >= startOfToday.getTime()
    ).length,
  };
}
