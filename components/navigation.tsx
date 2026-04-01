"use client";

import { cn } from "@/lib/utils";

export function NavigationActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-12.5 flex items-center justify-between px-4 gap-2 bg-background border-b w-full sticky top-0 z-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
