"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Shown above a page title when the page was opened from a project (its
 * address carries ?projectId=...): one click back to that project.
 */
export function BackToProjectLink() {
  const projectId = useSearchParams().get("projectId");
  const pathname = usePathname();
  // Dashboard links carry projectId=all ("every project"): no single project to go back to.
  if (!projectId || !UUID.test(projectId) || pathname.startsWith("/projects/")) return null;
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
