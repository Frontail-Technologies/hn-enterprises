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

const noopSubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isClient = useSyncExternalStore(noopSubscribe, getClientSnapshot, getServerSnapshot);

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
