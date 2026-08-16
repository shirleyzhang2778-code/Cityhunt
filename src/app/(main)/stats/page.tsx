"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2, Flame, Target } from "lucide-react";
import { db } from "@/lib/db/dexie";
import { buildLearningStats, type LearningStats } from "@/lib/stats";

const emptyStats: LearningStats = {
  totalAnswers: 0,
  correctAnswers: 0,
  accuracy: 0,
  streakDays: 0,
  masteredWords: 0,
  learningWords: 0,
  last7Days: [],
};

export default function StatsPage() {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!db) return;
      const [events, progress] = await Promise.all([
        db.review_events.toArray(),
        db.word_progress.toArray(),
      ]);
      setStats(buildLearningStats(events, progress));
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  const maxDaily = Math.max(1, ...stats.last7Days.map((day) => day.total));

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-muted">正在整理学习数据…</div>;

  return (
    <div className="px-4 pt-4">
      <Link href="/" className="mb-4 inline-block text-sm text-secondary">← 返回首页</Link>
      <h1 className="mb-6 text-xl font-bold text-primary">学习数据</h1>

      <div className="grid grid-cols-2 gap-3">
        <Metric icon={Flame} label="连续学习" value={`${stats.streakDays} 天`} />
        <Metric icon={Target} label="练习正确率" value={`${stats.accuracy}%`} />
        <Metric icon={BarChart3} label="累计练习" value={`${stats.totalAnswers} 次`} />
        <Metric icon={CheckCircle2} label="已掌握" value={`${stats.masteredWords} 词`} />
      </div>

      <section className="mt-6 rounded-card border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary">最近 7 天</h2>
          <span className="text-xs text-muted">答题次数</span>
        </div>
        <div className="mt-6 flex h-40 items-end justify-between gap-2">
          {stats.last7Days.map((day) => (
            <div key={day.dateKey} className="flex min-w-0 flex-1 flex-col items-center">
              <span className="mb-2 text-xs text-secondary">{day.total || ""}</span>
              <div className="flex h-24 w-full items-end justify-center rounded-button bg-canvas px-1">
                <div
                  className="w-full max-w-8 rounded-t bg-primary transition-all"
                  style={{ height: day.total === 0 ? 0 : `${Math.max(10, (day.total / maxDaily) * 100)}%` }}
                />
              </div>
              <span className="mt-2 truncate text-xs text-muted">{day.label}</span>
            </div>
          ))}
        </div>
        {stats.totalAnswers === 0 && (
          <p className="mt-5 text-center text-sm text-muted">完成一次学习或专项练习后，这里会开始记录趋势。</p>
        )}
      </section>

      <section className="mt-4 rounded-card border border-border bg-card p-5 shadow-sm">
        <h2 className="font-semibold text-primary">词汇状态</h2>
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-button bg-canvas p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.masteredWords}</p>
            <p className="mt-1 text-xs text-muted">已掌握</p>
          </div>
          <div className="flex-1 rounded-button bg-canvas p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.learningWords}</p>
            <p className="mt-1 text-xs text-muted">学习中</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-card p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
