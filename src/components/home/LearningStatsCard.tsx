"use client";

import Link from "next/link";
import { BarChart3, ChevronRight, Flame } from "lucide-react";

type Props = {
  streakDays: number;
  accuracy: number;
  totalAnswers: number;
};

export function LearningStatsCard({ streakDays, accuracy, totalAnswers }: Props) {
  return (
    <Link
      href="/stats"
      className="mb-8 flex items-center justify-between rounded-card border border-border bg-card p-5 shadow-sm transition-transform active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-primary">学习数据</h2>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1"><Flame className="h-4 w-4" />连续 {streakDays} 天</span>
            <span>{totalAnswers > 0 ? `正确率 ${accuracy}%` : "开始练习后生成统计"}</span>
          </div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted" />
    </Link>
  );
}
