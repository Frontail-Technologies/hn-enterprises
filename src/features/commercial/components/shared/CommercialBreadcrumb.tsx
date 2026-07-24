import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react";
import type { BreadcrumbItem } from "../../types/commercial.types";

export function CommercialBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Commercial breadcrumb"
      className="flex items-center gap-1 text-xs"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span
            key={`${item.label}-${index}`}
            className="flex min-w-0 items-center gap-1"
          >
            {index > 0 ? (
              <CaretRightIcon
                aria-hidden="true"
                size={13}
                weight="bold"
                className="shrink-0 text-muted-foreground/70"
              />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="max-w-44 truncate font-medium text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="max-w-64 truncate font-semibold text-foreground">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
