"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/dexie";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();

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
