"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTE_LABELS } from "@/constants/navigation";

function formatSegment(segment: string) {
  return ROUTE_LABELS[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function MobileNestedHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const title = formatSegment(segments[segments.length - 1] ?? "");

  return (
    <div className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border bg-background px-3 md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ArrowLeftIcon size={18} />
      </Button>
      <p className="min-w-0 truncate text-sm font-semibold text-foreground">{title}</p>
    </div>
  );
}
