import { Suspense } from "react";

export default function CompleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div className="p-6 text-center">加载中…</div>}>{children}</Suspense>;
}
