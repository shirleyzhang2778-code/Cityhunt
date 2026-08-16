import Dexie, { type Table } from "dexie";
import type { ChapterBundle, Word } from "../types";

export type ChapterBundleRow = {
  chapterId: string;
  payload: ChapterBundle;
  cachedAt: number;
};

export type ChapterProgressRow = {
  chapterId: string;
  masteredCount: number;
  lastWordIndex: number;
};

export type WordProgressRow = {
  wordId: string;
  status: string;
  familiar?: boolean;
  updatedAt: number;
  word?: Word;
  chapterId?: string;
  reviewCount?: number;
  lapseCount?: number;
  intervalDays?: number;
  dueAt?: number;
  lastReviewedAt?: number;
};

export type VocabularyRow = {
  wordId: string;
  starredAt: number;
  word?: Word;
};

export type BookUnlockRow = {
  bookId: string;
  unlockedAt: number;
};

export type MediaCacheRow = {
  url: string;
  blob: Blob;
  type: "audio" | "image";
  size: number;
};

export type SyncQueueRow = {
  id?: number;
  table: string;
  payload: unknown;
  createdAt: number;
};

export type ReviewEventRow = {
  id?: number;
  wordId: string;
  familiar: boolean;
  source: "study" | "review" | "meaning" | "audio";
  reviewedAt: number;
};

export class AppDatabase extends Dexie {
  chapter_bundles!: Table<ChapterBundleRow, string>;
  chapter_progress!: Table<ChapterProgressRow, string>;
  word_progress!: Table<WordProgressRow, string>;
  vocabulary!: Table<VocabularyRow, string>;
  book_unlocks!: Table<BookUnlockRow, string>;
  media_cache!: Table<MediaCacheRow, string>;
  sync_queue!: Table<SyncQueueRow, number>;
  review_events!: Table<ReviewEventRow, number>;

  constructor() {
    super("myanmar_vocab_app");
    this.version(1).stores({
      chapter_bundles: "chapterId",
      chapter_progress: "chapterId",
      word_progress: "wordId",
      vocabulary: "wordId",
      book_unlocks: "bookId",
      media_cache: "url",
      sync_queue: "++id, createdAt",
    });
    this.version(2).stores({
      chapter_bundles: "chapterId",
      chapter_progress: "chapterId",
      word_progress: "wordId",
      vocabulary: "wordId",
      book_unlocks: "bookId",
      media_cache: "url",
      sync_queue: "++id, createdAt",
      review_events: "++id, reviewedAt, wordId, source",
    });
  }
}

export const db =
  typeof window !== "undefined" ? new AppDatabase() : (null as unknown as AppDatabase);
