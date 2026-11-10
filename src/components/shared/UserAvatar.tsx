"use client";

import { useState } from "react";
import { resolveFileUrl } from "@/lib/upload";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-7 text-[11px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
  xl: "size-20 text-2xl",
} as const;

export function initialsOf(name: string | null | undefined) {
  return (
    (name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

/**
 * A person's profile photo, falling back to their initials when there is no
 * photo (or it fails to load). `tone="inverse"` is for the navy sidebar.
 */
export function UserAvatar({
  name,
  src,
  size = "sm",
  tone = "default",
  className,
}: {
  name: string | null | undefined;
  src?: string | null;
  size?: keyof typeof SIZES;
  tone?: "default" | "inverse";
  className?: string;
}) {
  const url = resolveFileUrl(src);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showPhoto = Boolean(url) && failedUrl !== url;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none",
        tone === "inverse" ? "bg-white/12 text-sidebar-foreground" : "bg-muted text-muted-foreground",
        SIZES[size],
        className,
      )}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" onError={() => setFailedUrl(url ?? null)} />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
