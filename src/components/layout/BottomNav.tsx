"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Settings, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "词书", icon: BookOpen },
  { href: "/vocabulary", label: "生词本", icon: Star },
  { href: "/settings", label: "设置", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-tabbar items-center justify-around border-t border-border bg-card">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" || pathname.startsWith("/books") : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-xs",
              active ? "text-primary" : "text-muted"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
