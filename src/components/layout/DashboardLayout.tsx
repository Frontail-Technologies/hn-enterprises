"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} />

      {/* Mobile Sidebar Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          collapsed ? "md:ml-16" : "md:ml-60",
        )}
      >
        <Header onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 container mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}
