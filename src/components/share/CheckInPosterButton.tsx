"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  displayName: string;
  avatarUrl: string | null;
  streakDays: number;
  bookTitle: string;
};

export function CheckInPosterButton({
  displayName,
  avatarUrl,
  streakDays,
  bookTitle,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function drawAndDownload() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 375;
    const h = 667;
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#1F2937";
    ctx.textAlign = "center";
    ctx.font = "16px sans-serif";
    ctx.fillText(displayName || "学习者", w / 2, 120);

    ctx.font = "bold 64px sans-serif";
    ctx.fillText(String(streakDays), w / 2, 280);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#4B5563";
    ctx.fillText("已连续专注背诵 (天)", w / 2, 310);

    ctx.fillStyle = "#1F2937";
    ctx.font = "15px sans-serif";
    ctx.fillText(`今日通关词书：《${bookTitle}》`, w / 2, 380);

    ctx.strokeStyle = "#E5E7EB";
    ctx.strokeRect(w - 100, h - 100, 80, 80);
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#9CA3AF";
    ctx.fillText("下载 App", w - 60, h - 55);

    if (avatarUrl) {
      try {
        const av = new Image();
        av.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          av.onload = () => resolve();
          av.onerror = reject;
          av.src = avatarUrl;
        });
        ctx.save();
        ctx.beginPath();
        ctx.arc(w / 2, 56, 28, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(av, w / 2 - 28, 28, 56, 56);
        ctx.restore();
      } catch {
        /* skip avatar */
      }
    }

    const link = document.createElement("a");
    link.download = `myanmar-vocab-checkin-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <>
      <canvas ref={canvasRef} className="hidden" aria-hidden />
      <Button variant="outline" className="w-full" onClick={drawAndDownload}>
        分享打卡海报
      </Button>
    </>
  );
}
