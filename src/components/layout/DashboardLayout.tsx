"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Sidebar } from "./Sidebar";
import { Breadcrumb } from "./Breadcrumb";
import { BreadcrumbLabelProvider } from "./BreadcrumbLabelContext";
import { MobileNestedHeader } from "./MobileNestedHeader";
import { MobileNavbar } from "./MobileNavbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CustomScrollbar } from "@/components/shared/CustomScrollbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Hydration-safe "are we on the client yet" check: `document` isn't
// available during SSR, but a plain `typeof document !== "undefined"` check
// in the render body would disagree between the server render and the
// client's first hydration pass (which always has `document`) and trigger a
// hydration mismatch - useSyncExternalStore's separate server/client
// snapshots are the React-blessed way around that.
const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isClient = useSyncExternalStore(noopSubscribe, getClientSnapshot, getServerSnapshot);

  // The app's main scroll is the document itself (no nested overflow-auto
  // wrapper). This is a plain object shaped like a ref, not a useRef() ref -
  // reading/writing a real ref's `.current` during render isn't allowed, but
  // building a fresh object here is fine, and it means the object is already
  // populated by the time CustomScrollbar (a child, so its effect commits
  // before this component's would) reads it in its own effect.
  const pageScrollRef = useMemo(
    () => ({ current: isClient ? document.documentElement : null }),
    [isClient],
  );

  return (
    <SidebarProvider className="overflow-x-clip">
      <BreadcrumbLabelProvider>
        <Sidebar />
        <SidebarInset className="min-w-0 overflow-x-clip">
          <MobileNavbar />
          <MobileNestedHeader />
          <main className="min-w-0 flex-1 overflow-x-clip px-3 py-3 sm:px-4 md:py-4 lg:px-5">
            <div className="mb-3 hidden min-w-0 md:block">
              <Breadcrumb />
            </div>
            {children}
          </main>
        </SidebarInset>
      </BreadcrumbLabelProvider>
      {isClient ? (
        <CustomScrollbar targetRef={pageScrollRef} orientation="vertical" variant="viewport" />
      ) : null}
    </SidebarProvider>
  );
}
