"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BreadcrumbLabelProvider } from "./BreadcrumbLabelContext";
import { MobileNestedHeader } from "./MobileNestedHeader";
import { MobileNavbar } from "./MobileNavbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Saved open/collapsed state read from the cookie on the server (falls back to document.cookie). */
  sidebarDefaultOpen?: boolean;
}

// The sidebar saves its open/collapsed state in this cookie (components/ui/sidebar.tsx).
function readSidebarOpen() {
  if (typeof document === "undefined") return true;
  return !document.cookie.split("; ").includes("sidebar_state=false");
}

export function DashboardLayout({ children, sidebarDefaultOpen: savedOpen }: DashboardLayoutProps) {
  // Restore the saved state before the first paint so the sidebar doesn't
  // always open and then need collapsing again.
  const [sidebarDefaultOpen] = useState(() => savedOpen ?? readSidebarOpen());

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen} className="overflow-x-clip">
      <BreadcrumbLabelProvider>
        <Sidebar />
        <SidebarInset className="min-w-0 overflow-x-clip">
          <MobileNavbar />
          <MobileNestedHeader />
          <Header />
          <main className="min-w-0 flex-1 overflow-x-clip px-3 py-4 sm:px-4 md:flex md:flex-col md:py-5 lg:px-6 lg:py-6">
            {children}
          </main>
        </SidebarInset>
      </BreadcrumbLabelProvider>
    </SidebarProvider>
  );
}
