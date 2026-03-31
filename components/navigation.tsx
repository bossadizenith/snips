"use client";

import { cn } from "@/lib/utils";
import { ChevronLeftIcon, RaycastLogoNegIcon } from "@raycast/icons";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { Button } from "./ui/button";

export function Navigation() {
  const segments = useSelectedLayoutSegments();
  const segment = segments[0] || "(code)";
  const showBackButton = segments.find((s) => s === "shared")
    ? segments.length > 1
    : segments.length > 2;

  return (
    <nav className="flex items-center gap-3 h-12.5 pl-4 pr-5  text-white w-full fixed z-10">
      <div
        className={cn(
          "flex items-center gap-3 transition-transform ease-in-out",
          showBackButton ? "translate-x-0" : "-translate-x-10",
        )}
      >
        <Button
          asChild
          className={cn(
            "rounded-full shadow-none w-6 h-6 bg-gray-4 hover:bg-gray-5 text-gray-12",
            showBackButton ? "opacity-100 scale-100" : "opacity-0 scale-75",
          )}
        >
          <Link
            href={`/${segment}`}
            aria-label="Home"
            aria-disabled={!showBackButton}
            tabIndex={showBackButton ? 0 : -1}
          >
            <ChevronLeftIcon className="w-4 h-4 shrink-0" />
          </Link>
        </Button>
        <div className="-ml-2 flex items-center relative z-10 gap-1">
          <span className="text-sm text-gray-9">by </span>
          <Button variant="transparent" asChild className="pl-2">
            <a
              href="https://raycast.com#ref=ray-so"
              target="_blank"
              rel="noopener"
            >
              <RaycastLogoNegIcon className="w-5 h-5 text-brand" />
              <span className="text-sm text-gray-12 font-medium hidden sm:block">
                Raycast
              </span>
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}

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
        "h-12.5 flex items-center justify-end px-4 gap-2 bg-background border-b w-full sticky top-0 z-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
