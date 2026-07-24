"use client";

import { useState } from "react";
import Image from "next/image";
import type { Banner } from "@/lib/types";

type Props = {
  banners: Banner[];
  isReviewMode: boolean;
};

export function BannerCarousel({ banners, isReviewMode }: Props) {
  const [index, setIndex] = useState(0);
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);

  if (banners.length === 0) return null;

  const current = banners[index % banners.length];

  function handleClick() {
    if (isReviewMode || !current.link_url) return;
    setWebviewUrl(current.link_url);
  }

  return (
    <>
      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-card bg-card shadow-sm">
        <button
          type="button"
          className="relative h-full w-full"
          onClick={handleClick}
          disabled={isReviewMode}
        >
          <Image
            src={current.image_url}
            alt="Banner"
            fill
            className="object-cover"
            unoptimized
          />
        </button>
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {banners.map((_, i) => (
              <button
                key={banners[i].id}
                type="button"
                aria-label={`Banner ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-primary" : "bg-border"}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {webviewUrl && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-card">
          <header className="flex h-12 items-center border-b border-border px-4">
            <button
              type="button"
              className="text-sm text-primary"
              onClick={() => setWebviewUrl(null)}
            >
              关闭
            </button>
          </header>
          <iframe src={webviewUrl} className="flex-1 w-full border-0" title="外链" />
        </div>
      )}
    </>
  );
}
