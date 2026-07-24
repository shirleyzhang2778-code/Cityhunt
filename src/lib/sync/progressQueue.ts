import { db } from "../db/dexie";

export async function enqueueSync(table: string, payload: unknown) {
  if (!db) return;
  await db.sync_queue.add({ table, payload, createdAt: Date.now() });
}

export async function flushSyncQueue(_accessToken?: string): Promise<void> {
  if (!db) return;
  const items = await db.sync_queue.orderBy("createdAt").toArray();
  if (items.length === 0) return;

  const chapters: unknown[] = [];
  const words: unknown[] = [];
  const vocabulary: unknown[] = [];

  for (const item of items) {
    if (item.table === "chapter_progress") chapters.push(item.payload);
    if (item.table === "word_progress") words.push(item.payload);
    if (item.table === "vocabulary") vocabulary.push(item.payload);
  }

  const res = await fetch("/api/sync/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ chapters, words, vocabulary }),
  });

  if (res.ok) {
    await db.sync_queue.clear();
  }
}
