"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { db } from "@/lib/db/dexie";

type Props = {
  bookId: string;
  bookTitle: string;
  authorQrUrl: string | null;
  children: React.ReactNode;
  onUnlocked: () => void;
};

export function ActivationSheet({
  bookId,
  bookTitle,
  authorQrUrl,
  children,
  onUnlocked,
}: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRedeem() {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setError("请先登录");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/redeem-activation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "激活失败，请检查激活码");
      setLoading(false);
      return;
    }

    if (db) {
      await db.book_unlocks.put({ bookId, unlockedAt: Date.now() });
    }
    setOpen(false);
    setCode("");
    onUnlocked();
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <p className="mb-4 text-base text-primary">
          本词书属于高级定制内容，请输入激活码解锁
        </p>
        <p className="mb-2 text-sm text-muted">{bookTitle}</p>
        <Input
          placeholder="请输入 6-12 位激活码"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-3"
        />
        {error && <p className="mb-2 text-sm text-danger">{error}</p>}
        <Button className="mb-6 w-full" onClick={handleRedeem} disabled={loading}>
          {loading ? "验证中…" : "解锁词书"}
        </Button>
        <p className="mb-3 text-center text-sm text-secondary">
          暂无激活码？请微信扫码或添加作者人工获取
        </p>
        {authorQrUrl && (
          <div className="relative mx-auto h-[120px] w-[120px]">
            <Image src={authorQrUrl} alt="作者微信" fill className="object-contain" unoptimized />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
