"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/dexie";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { DAILY_REVIEW_GOAL_KEY, getDailyReviewGoal } from "@/lib/review";

export default function SettingsPage() {
  const router = useRouter();
  const [dailyGoal, setDailyGoal] = useState(10);

  useEffect(() => {
    setDailyGoal(getDailyReviewGoal());
  }, []);

  function changeDailyGoal(goal: number) {
    localStorage.setItem(DAILY_REVIEW_GOAL_KEY, String(goal));
    setDailyGoal(goal);
  }

  async function clearMediaCache() {
    if (!db) return;
    await db.media_cache.clear();
    alert("已清理媒体缓存（图片/音频）。学习进度与生词本未受影响。");
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="mb-6 text-xl font-bold text-primary">设置</h1>
      <div className="space-y-3">
        <section className="rounded-card border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-primary">每日复习目标</h2>
          <p className="mt-1 text-sm text-muted">选择每天计划完成的单词数</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[10, 20, 30].map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => changeDailyGoal(goal)}
                className={cn(
                  "h-11 rounded-button border text-sm font-medium",
                  dailyGoal === goal
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-secondary"
                )}
              >
                {goal} 个
              </button>
            ))}
          </div>
        </section>
        <Button variant="outline" className="w-full" onClick={clearMediaCache}>
          清理缓存（仅媒体文件）
        </Button>
        <Button variant="danger" className="w-full" onClick={signOut}>
          退出登录
        </Button>
      </div>
      <p className="mt-6 text-xs text-muted">
        清理缓存不会删除学习进度、激活状态与生词本数据。
      </p>
    </div>
  );
}
