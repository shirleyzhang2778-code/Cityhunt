"use client";

import Link from "next/link";
import { Brain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  due: number;
  weak: number;
  completedToday: number;
  goal: number;
};

export function TodayReviewCard({ due, weak, completedToday, goal }: Props) {
  const progress = Math.min(100, Math.round((completedToday / Math.max(goal, 1)) * 100));
  const href = due > 0 ? "/review" : weak > 0 ? "/review?mode=weak" : "/";

  return (
    <section className="mb-8 rounded-card border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-primary">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-primary">今日复习</h2>
            <p className="mt-1 text-sm text-muted">今日已完成 {completedToday} / {goal}</p>
          </div>
        </div>
        <Link href="/settings" className="flex items-center text-xs text-secondary">
          调整目标 <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-canvas">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-5 text-sm">
          <span className="text-secondary">待复习 <b className="text-primary">{due}</b></span>
          <span className="text-secondary">薄弱词 <b className="text-primary">{weak}</b></span>
        </div>
        <Button asChild disabled={due === 0 && weak === 0} className="h-10 px-5">
          <Link href={href}>{due > 0 ? "开始复习" : weak > 0 ? "巩固薄弱词" : "今日已完成"}</Link>
        </Button>
      </div>
    </section>
  );
}
