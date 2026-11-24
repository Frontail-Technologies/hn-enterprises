"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";

/**
 * Shown above a page title when the page was opened from a project (its
 * address carries ?projectId=...): one click back to that project.
 */
export function BackToProjectLink() {
  const projectId = useSearchParams().get("projectId");
  const pathname = usePathname();
  if (!projectId || pathname.startsWith("/projects/")) return null;
  return (
    <Link
      href={`/projects/${encodeURIComponent(projectId)}`}
      className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
    >
      <ArrowLeftIcon size={13} />
      Back to project
    </Link>
  );
}
