import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

type CustomerBreadcrumbItem = {
  label: string;
  href?: string;
};

export function CustomerBreadcrumb({ items }: { items: CustomerBreadcrumbItem[] }) {
  return (
    <nav aria-label="Customer breadcrumb" className="mb-3 flex items-center gap-1 text-xs">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
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
                className="max-w-40 truncate font-medium text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="max-w-56 truncate font-bold text-foreground">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
