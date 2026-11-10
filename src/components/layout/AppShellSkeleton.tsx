import Image from "next/image";
import { cn } from "@/lib/utils";

const NAV_ROWS = [72, 56, 64, 84, 60, 92, 52, 70, 58, 80];

function Bar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={cn("block animate-pulse rounded-md", className)} style={style} />;
}

/**
 * Placeholder of the dashboard shell (sidebar, top bar, page) shown while the
 * session is checked, so the real layout replaces it in place instead of
 * popping in after a blank spinner. Mirrors DashboardLayout's dimensions.
 */
export function AppShellSkeleton({ sidebarOpen = true }: { sidebarOpen?: boolean }) {
  return (
    <div className="flex min-h-svh bg-background" role="status" aria-label="Loading HN Enterprises">
      <span className="sr-only">Loading HN Enterprises…</span>

      {/* Sidebar (desktop) */}
      <aside
        aria-hidden="true"
        className={cn("sticky top-0 hidden h-svh shrink-0 flex-col bg-sidebar md:flex", sidebarOpen ? "w-68" : "w-12")}
      >
        <div className={cn("app-titlebar flex h-16 items-center", sidebarOpen ? "gap-3 px-4" : "justify-center")}>
          <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white", sidebarOpen ? "size-9" : "size-8")}>
            <Image src="/logo.png" alt="" width={36} height={36} priority className={sidebarOpen ? "size-8 object-contain" : "size-7 object-contain"} />
          </span>
          {sidebarOpen ? (
            <div className="leading-tight">
              <p className="text-[15px] font-semibold text-sidebar-foreground">HN Enterprises</p>
              <p className="text-xs text-sidebar-foreground/60">CGD Management</p>
            </div>
          ) : null}
        </div>
        <div className={cn("flex flex-col gap-1.5 py-2", sidebarOpen ? "px-3" : "items-center px-2")}>
          {NAV_ROWS.map((width, index) => (
            <div key={index} className={cn("flex h-10 items-center gap-3", sidebarOpen ? "px-3" : "justify-center")}>
              <Bar className="size-4.5 shrink-0 bg-white/12" />
              {sidebarOpen ? <Bar className="h-3 bg-white/10" style={{ width: `${width}%` }} /> : null}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <div aria-hidden="true" className="flex h-12 items-center gap-2 bg-secondary-action px-3 md:hidden">
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-sm bg-white">
            <Image src="/logo.png" alt="" width={30} height={30} className="size-7 object-contain" />
          </span>
          <p className="text-sm font-semibold text-secondary-action-foreground">HN Enterprises</p>
        </div>

        {/* Desktop top bar */}
        <div aria-hidden="true" className="app-titlebar app-titlebar-pad hidden h-14 items-center gap-3 border-b border-border bg-card px-4 md:flex lg:px-6">
          <Bar className="size-8 bg-muted" />
          <span className="h-5 w-px bg-border" />
          <Bar className="h-3.5 w-32 bg-muted" />
          <Bar className="ms-auto h-8 w-28 rounded-lg bg-primary-soft" />
        </div>

        {/* Page */}
        <div aria-hidden="true" className="flex flex-col gap-5 px-3 py-4 sm:px-4 md:py-5 lg:px-6 lg:py-6">
          <div className="flex flex-col gap-2">
            <Bar className="h-7 w-56 bg-muted" />
            <Bar className="h-4 w-80 max-w-full bg-muted/70" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-start gap-3.5 rounded-card border border-border bg-card p-4 shadow-card sm:p-5">
                <Bar className="size-10 shrink-0 rounded-lg bg-muted sm:size-11" />
                <div className="flex flex-1 flex-col gap-2">
                  <Bar className="h-3 w-2/3 bg-muted" />
                  <Bar className="h-6 w-1/2 bg-muted" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="flex flex-col gap-4 rounded-card border border-border bg-card p-5 shadow-card">
                <Bar className="h-4 w-40 bg-muted" />
                <Bar className="h-56 w-full rounded-lg bg-muted/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
