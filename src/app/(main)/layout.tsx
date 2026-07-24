import { Suspense } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { RestoreProvider } from "@/components/providers/RestoreProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RestoreProvider>
      <Suspense>
        <main className="pb-safe min-h-screen bg-canvas">{children}</main>
        <BottomNav />
      </Suspense>
    </RestoreProvider>
  );
}
