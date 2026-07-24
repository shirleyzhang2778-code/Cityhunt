"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { Book } from "@/lib/types";
import { AppleProgressBar } from "@/components/progress/AppleProgressBar";
import { ActivationSheet } from "./ActivationSheet";
import { cn } from "@/lib/utils";

type Props = {
  book: Book;
  unlocked: boolean;
  progress: number;
  authorQrUrl: string | null;
  onUnlockChange: () => void;
};

export function BookCard({
  book,
  unlocked,
  progress,
  authorQrUrl,
  onUnlockChange,
}: Props) {
  const canEnter = book.is_free || unlocked;
  const inner = (
    <article
      className={cn(
        "rounded-card border border-border bg-card p-6 shadow-sm transition-shadow",
        canEnter && "hover:shadow-md"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-primary">{book.title}</h3>
        {!canEnter && <Lock className="h-5 w-5 shrink-0 text-muted" />}
      </div>
      {book.description && (
        <p className="mb-3 line-clamp-2 text-sm text-secondary">{book.description}</p>
      )}
      <AppleProgressBar progress={progress} />
    </article>
  );

  if (canEnter) {
    return <Link href={`/books/${book.id}`}>{inner}</Link>;
  }

  return (
    <ActivationSheet
      bookId={book.id}
      bookTitle={book.title}
      authorQrUrl={authorQrUrl}
      onUnlocked={onUnlockChange}
    >
      <button type="button" className="w-full text-left">
        {inner}
      </button>
    </ActivationSheet>
  );
}
