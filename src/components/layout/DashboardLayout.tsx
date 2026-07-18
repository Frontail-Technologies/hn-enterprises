"use client";

import { Sidebar } from "./Sidebar";
import { Breadcrumb } from "./Breadcrumb";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider className="overflow-x-clip">
      <Sidebar />
      <SidebarInset className="min-w-0 overflow-x-clip">
        <main className="min-w-0 flex-1 overflow-x-clip px-3 py-4 sm:px-4 lg:px-5">
          <div className="mb-3 min-w-0">
            <Breadcrumb />
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
