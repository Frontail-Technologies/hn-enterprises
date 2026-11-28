"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Path levels that are not pages of their own; going up skips them. */
const NOT_A_PAGE = new Set(["/dashboard/stats", "/dashboard/summary", "/masters/values", "/reports"]);
/** Nested addresses that are sidebar pages of their own (no back arrow). */
const TOP_LEVEL = new Set(["/reports/templates"]);

function parentPath(pathname: string) {
  let path = pathname.replace(/\/+$/, "");
  do {
    path = path.slice(0, path.lastIndexOf("/"));
  } while (NOT_A_PAGE.has(path));
  return path || "/dashboard";
}

type Props = { href?: string; className?: string };

function BackButton({ href, className }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const projectId = useSearchParams().get("projectId");
  const segments = pathname.split("/").filter(Boolean);
  // Opened from a project (?projectId=...): back goes to that project.
  const fromProject = Boolean(projectId && UUID.test(projectId) && !pathname.startsWith("/projects/"));
  if (!href && !fromProject && (segments.length <= 1 || TOP_LEVEL.has(pathname))) return null;

  const target = href ?? (fromProject ? `/projects/${encodeURIComponent(projectId!)}` : parentPath(pathname));
  const label = fromProject && !href ? "Back to project" : "Back";

  function goBack() {
    // Prefer the real previous page (e.g. the project tab a customer was opened from).
    if (!fromProject && window.history.length > 1) router.back();
    else router.push(target);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        // Small screens already have the back arrow in the top bar on nested pages.
        !fromProject && "max-md:hidden",
        className,
      )}
    >
      <ArrowLeftIcon size={16} />
    </button>
  );
}

/**
 * Back arrow at the left of a page title. Shown on nested pages (details,
 * forms, sub pages) and on pages opened from a project; hidden on top-level
 * pages. `href` forces where it goes.
 */
export function PageBackButton(props: Props) {
  return (
    <Suspense fallback={null}>
      <BackButton {...props} />
    </Suspense>
  );
}
