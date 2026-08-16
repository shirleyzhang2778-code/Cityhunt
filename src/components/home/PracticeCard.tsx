"use client";

import Link from "next/link";
import { Eye, Headphones } from "lucide-react";

export function PracticeCard() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-primary">专项练习</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/practice?mode=meaning"
          className="rounded-card border border-border bg-card p-4 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-primary">
            <Eye className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-primary">看词选义</h3>
          <p className="mt-1 text-xs text-muted">看到缅甸语，选出中文意思</p>
        </Link>
        <Link
          href="/practice?mode=audio"
          className="rounded-card border border-border bg-card p-4 shadow-sm transition-transform active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-primary">
            <Headphones className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-primary">听音选义</h3>
          <p className="mt-1 text-xs text-muted">听发音，选出对应中文意思</p>
        </Link>
      </div>
    </section>
  );
}
