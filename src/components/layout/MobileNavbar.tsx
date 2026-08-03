"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BuildingsIcon,
  DotsThreeIcon,
  HouseIcon,
  PackageIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Home", href: "/dashboard", icon: HouseIcon },
  { label: "Projects", href: "/projects", icon: BuildingsIcon },
  { label: "Customers", href: "/customers", icon: UsersIcon },
  { label: "Inventory", href: "/inventory", icon: PackageIcon },
] as const;

export function MobileNavbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const isNestedPage = pathname.split("/").filter(Boolean).length > 1;

  if (isNestedPage) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background md:hidden">
      <div className="flex h-12 items-center gap-2 px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-white">
          <Image
            src="/logo.png"
            alt="HN Enterprises"
            width={30}
            height={30}
            priority
            className="h-7 w-7 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">HN Enterprises</p>
          <p className="truncate text-[10px] font-medium text-muted-foreground">CGD Management</p>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={toggleSidebar}
          aria-label="Open navigation"
        >
          <DotsThreeIcon size={20} weight="bold" />
        </button>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 rounded-sm px-3 text-xs font-medium text-muted-foreground transition-colors",
                active ? "bg-primary/10 text-primary" : "hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={16} weight={active ? "fill" : "regular"} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
